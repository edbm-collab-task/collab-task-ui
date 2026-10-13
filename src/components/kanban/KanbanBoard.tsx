import { useState, useMemo } from "react";
import {
    Plus,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

import {
    priorityColor,
    STATUSES,
    type TaskRes,
} from "@/types/task";
import type { Status } from "@/types/status";
import { toStatusListFromSeed } from "@/mappers/status.mapper";
import { buildColumnTaskTrees, countColumnNodes } from "@/utils/taskTree";
import type { UserResponse } from "@/types/user";
import CommentPanel from "./CommentPanel";
import { TaskTreeItem } from "./TaskTreeItem";

interface Props {
    projectId: number;
    tasks: TaskRes[];
    statuses?: Status[];
    allUsers?: UserResponse[];
    onEditTask: (task: TaskRes) => void;
    onCreateTask: (statusId: number) => void;
    onDeleteTask: (task: TaskRes) => void;
    onMoveTask: (task: TaskRes, statusId: number, beforeTaskId: number | null) => void;
    currentUserId: number;
}

/** Badge de priorité : nom réel fourni par l'API + couleur dérivée du nom */
function priorityBadge(priorityName: string | null | undefined) {
    return { name: priorityName ?? "—", color: priorityColor(priorityName) };
}

/** Formatage date courte pour les cartes (jour + mois abrégé) */
function formatDate(date: string | null) {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

/**
 * Styles de colonne selon le statut.
 * D'abord par ID (statuts personnalisés ont des IDs > 3), puis fallback par nom.
 * Les IDs 1-4 correspondent aux statuts par défaut du seed backend.
 * ATTENTION : STATUSES (constante) n'a que 3 entrées (id 1,2,3) mais styleMap en a 4.
 */
function getStatusStyle(status: Status): { column: string; dot: string } {
    const name = status.name.toLowerCase();
    const id = status.statusId;

    const styleMap: Record<number, { column: string; dot: string }> = {
        1: { column: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
        2: { column: "bg-blue-50 border-blue-200", dot: "bg-blue-400" },
        3: { column: "bg-amber-50 border-amber-200", dot: "bg-amber-400" },
        4: { column: "bg-green-50 border-green-200", dot: "bg-green-400" },
    };

    if (id && styleMap[id]) return styleMap[id];

    if (name.includes("todo") || name.includes("à faire")) {
        return { column: "bg-gray-50 border-gray-200", dot: "bg-gray-400" };
    }
    if (name.includes("progress") || name.includes("en cours")) {
        return { column: "bg-blue-50 border-blue-200", dot: "bg-blue-400" }
    }
    if (name.includes("review") || name.includes("relecture")) {
        return { column: "bg-amber-50 border-amber-200", dot: "bg-amber-400" };
    }
    if (name.includes("done") || name.includes("terminé")) {
        return { column: "bg-green-50 border-green-200", dot: "bg-green-400" };
    }
    return { column: "bg-gray-50 border-gray-200", dot: "bg-gray-400" };
}

export default function KanbanBoard({
    projectId,
    tasks,
    statuses,
    allUsers = [],
    onEditTask,
    onCreateTask,
    onDeleteTask,
    onMoveTask,
    currentUserId,
}: Props) {
    // État drag & drop : tâche en cours de glissement + colonne survolée
    const [draggedTask, setDraggedTask] = useState<TaskRes | null>(null);
    const [overColumn, setOverColumn] = useState<number | null>(null);
    // Zone d'insertion survolée (filet bleu) : choisie à l'approche, mais la
    // position d'insertion est TOUJOURS recalculée au moment du drop (voir
    // wrapper ci-dessous) pour éviter les faux départs du drag HTML5.
    const [dropTarget, setDropTarget] = useState<{ key: number; anchor: "before" | "after" } | null>(null);
    // Panneau commentaires : ID de la tâche dont on affiche les commentaires
    const [commentTaskId, setCommentTaskId] = useState<number | null>(null);
    // Compteur de commentaires par tâche (mis à jour via onCountChange du CommentPanel)
    const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
    // Colonnes repliées par statut : un statut présent dans cet ensemble masque
    // sa zone de cartes (seul l'en-tête reste visible).
    const [collapsedStatuses, setCollapsedStatuses] = useState<Set<number>>(new Set());

    /**
     * Replie ou déplie la colonne d'un statut (masque/affiche sa zone de cartes).
     * Le compteur de l'en-tête conserve toujours le total des cartes
     * (voir countColumnNodes).
     */
    const toggleColumn = (statusId: number) => {
        setCollapsedStatuses(prev => {
            const next = new Set(prev);
            if (next.has(statusId)) {
                next.delete(statusId);
            } else {
                next.add(statusId);
            }
            return next;
        });
    };

    const commentTask = useMemo(
        () => commentTaskId !== null ? tasks.find(t => t.taskId === commentTaskId) ?? null : null,
        [commentTaskId, tasks]
    );

    // Compteur initial de commentaires fourni par le backend (task.commentCount).
    // Les mises à jour locales (commentCounts, via onCountChange du CommentPanel)
    // priment sur cette valeur une fois une interaction effectuée.
    const initialCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        for (const t of tasks) counts[t.taskId] = t.commentCount ?? 0;
        return counts;
    }, [tasks]);

    const getCount = (taskId: number) => commentCounts[taskId] ?? initialCounts[taskId] ?? 0;

    // Fallback sur les statuts "en dur" si l'API ne renvoie pas de statuts personnalisés
    const fallbackStatuses: Status[] = toStatusListFromSeed(STATUSES);

    const availableStatuses = statuses ?? fallbackStatuses;

    // Arbre des sous-tâches par colonne : chaque sous-tâche est rendue sous son
    // parent (décalage + filet vertical). Si le parent est dans une autre colonne,
    // la sous-tâche est précédée d'une carte fantôme avec le titre du parent.
    const columnTrees = useMemo(
        () =>
            buildColumnTaskTrees(
                tasks,
                availableStatuses.map(status => status.statusId)
            ),
        [tasks, availableStatuses]
    );

    // Gestion du drop sur la zone vide d'une colonne : on ne déclenche onMoveTask
    // que si la colonne a changé. La mise à jour optimiste est gérée dans le
    // parent (ProjectDetailPage.handleMoveTask).
    const handleDrop = (statusId: number) => {
        if (draggedTask && draggedTask.statusId !== statusId) {
            onMoveTask(draggedTask, statusId, null);
        }
        setDraggedTask(null);
        setOverColumn(null);
    };

    // Déplacement inséré dans le fil : relâcher sur la moitié supérieure d'une
    // carte insère la tâche AVANT cette carte (elle en hérite la priorité),
    // sur la moitié inférieure APRÈS (c'est-à-dire avant la carte suivante, ou
    // fin de colonne si c'était la dernière). La position est recalculée au
    // moment du drop (bounding rect) : le feedback visuel pendant le drag ne
    // sert que d'indication.
    const computeBeforeTaskId = (statusId: number, nodeId: number, clientY: number, target: HTMLDivElement): number | null => {
        const rect = target.getBoundingClientRect();
        const before = clientY < rect.top + rect.height / 2;
        if (before) return nodeId;
        const nodes = columnTrees.get(statusId) ?? [];
        const index = nodes.findIndex(n => n.task.taskId === nodeId);
        return index >= 0 && index < nodes.length - 1 ? nodes[index + 1].task.taskId : null;
    };

    return (
        <div className="grid gap-5 md:grid-cols-3">
            {availableStatuses.map(status => {
                //  Correction : on utilise directement status.statusId
                const id = status.statusId;
                // Tâches de la colonne, triées par priorité puis ordre manuel
                // (voir compareTasks) et groupées par parent TaskTreeItem.
                const columnNodes = columnTrees.get(id) ?? [];
                const style = getStatusStyle(status);
                // Colonne repliée (zone de cartes masquée) : seul l'en-tête reste
                // visible, le chevron permet de replier/déplier.
                const isCollapsed = collapsedStatuses.has(id);

                return (
                    <div
                        key={id}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setOverColumn(id);
                        }}
                        onDragLeave={() => setOverColumn(null)}
                        onDrop={() => handleDrop(id)}
                        className={`flex h-fit max-h-[calc(100vh-15rem)] flex-col rounded-2xl border p-3 transition ${style.column} ${
                            overColumn === id ? "ring-2 ring-blue-400" : ""
                        }`}
                    >
                        {/* En-tête colonne : point, nom, compteur total, chevron de
                            repli/dépli et bouton d'ajout. Le compteur est toujours
                            le total (sous-tâches comprises), même colonne repliée.
                            Un clic sur la zone du statut (point/nom/compteur)
                            replie ou déplie aussi la colonne ; le clic sur le
                            chevron ou le bouton '+' reste dédié à sa propre
                            action. */}
                        <div className="mb-3 flex items-center justify-between px-1">
                            <div
                                className="flex cursor-pointer items-center gap-2"
                                onClick={e => {
                                    // Évite le double toggle quand le clic vient du
                                    // bouton chevron (qui gère déjà sa propre action).
                                    if ((e.target as HTMLElement).closest('button')) return;
                                    toggleColumn(id);
                                }}
                            >
                                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">{status.name}</h3>
                                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-gray-600 shadow-sm">
                                    {countColumnNodes(columnNodes)}
                                </span>
                                <button
                                    onClick={() => toggleColumn(id)}
                                    title={isCollapsed ? `Déplier ${status.name}` : `Replier ${status.name}`}
                                    aria-expanded={!isCollapsed}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white transition hover:opacity-80"
                                >
                                    {isCollapsed ? <ChevronRight size={17} /> : <ChevronDown size={17} />}
                                </button>
                            </div>
                            <button
                                onClick={() => onCreateTask(id)}
                                title={`Ajouter une tâche dans ${status.name}`}
                                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white hover:text-accent"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Zone des cartes : masquée quand la colonne est repliée (isCollapsed).
                            Le drop sur la colonne vide reste géré par la colonne
                            elle-même (handleDrop), même repliée.
                            Chaque racine reçoit un numéro 1..N (ordre d'affichage)
                            ; les sous-tâches en dérivent un relatif ("1.1", "1.2")
                            dans TaskTreeItem. */}
                        <div
                            className={`flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar p-1 ${
                                isCollapsed ? "hidden" : ""
                            }`}
                        >
                            {columnNodes.length === 0 && (
                                <div className="rounded-xl border-2 border-dashed border-white/70 px-4 py-6 text-center text-xs text-gray-400">
                                    Glissez une tâche ici
                                </div>
                            )}

                            {columnNodes.map((node, index) => {
                                const active = dropTarget?.key === node.task.taskId;
                                return (
                                    <div
                                        key={`${projectId}-${node.task.taskId}`}
                                        className="relative"
                                        onDragOver={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setDropTarget({
                                                key: node.task.taskId,
                                                anchor: e.clientY < rect.top + rect.height / 2 ? "before" : "after",
                                            });
                                            setOverColumn(id);
                                        }}
                                        onDragLeave={() => {
                                            if (dropTarget?.key === node.task.taskId) {
                                                setDropTarget(null);
                                            }
                                        }}
                                        onDrop={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const beforeTaskId = computeBeforeTaskId(
                                                id,
                                                node.task.taskId,
                                                e.clientY,
                                                e.currentTarget
                                            );
                                            if (draggedTask && beforeTaskId !== draggedTask.taskId) {
                                                onMoveTask(draggedTask, id, beforeTaskId);
                                            }
                                            setDraggedTask(null);
                                            setOverColumn(null);
                                            setDropTarget(null);
                                        }}
                                    >
                                        {active && dropTarget?.anchor === "before" && (
                                            <div className="pointer-events-none absolute -top-[3px] left-0 right-0 h-0.5 rounded bg-blue-500" />
                                        )}

                                        <TaskTreeItem
                                            node={node}
                                            projectId={projectId}
                                            priorityBadge={priorityBadge}
                                            formatDate={formatDate}
                                            getCount={getCount}
                                            onEditTask={onEditTask}
                                            onDeleteTask={onDeleteTask}
                                            setCommentTaskId={setCommentTaskId}
                                            setDraggedTask={setDraggedTask}
                                            setOverColumn={setOverColumn}
                                            showActions={true}
                                            number={String(index + 1)}
                                        />

                                        {active && dropTarget?.anchor === "after" && (
                                            <div className="pointer-events-none absolute -bottom-[3px] left-0 right-0 h-0.5 rounded bg-blue-500" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            <CommentPanel
                open={commentTaskId !== null}
                task={commentTask}
                currentUserId={currentUserId}
                availableUsers={allUsers}
                onClose={() => setCommentTaskId(null)}
                onCountChange={(count) => {
                    if (commentTaskId) {
                        setCommentCounts(prev => ({ ...prev, [commentTaskId]: count }));
                    }
                }}
            />
        </div>
    );
}