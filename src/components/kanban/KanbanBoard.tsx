import { useState, useMemo } from "react";
import {
    Plus,
} from "lucide-react";

import {
    PRIORITIES,
    STATUSES,
    type TaskRes,
} from "@/types/task";
import type { Status } from "@/types/status";
import { toStatusListFromSeed } from "@/mappers/status.mapper";
import type { UserResponse } from "@/types/user";
import CommentPanel from "./CommentPanel";
import { TaskCard } from "./TaskCard";

interface Props {
    projectId: number;
    tasks: TaskRes[];
    statuses?: Status[];
    allUsers?: UserResponse[];
    onEditTask: (task: TaskRes) => void;
    onCreateTask: (statusId: number) => void;
    onDeleteTask: (task: TaskRes) => void;
    onMoveTask: (task: TaskRes, statusId: number) => void;
    currentUserId: number;
}

/** Badge de priorité : mapping depuis l'ID vers l'objet PRIORITIES (seed backend) */
function priorityBadge(priorityId: number) {
    return PRIORITIES.find(p => p.id === priorityId) ?? PRIORITIES[0];
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
    // Panneau commentaires : ID de la tâche dont on affiche les commentaires
    const [commentTaskId, setCommentTaskId] = useState<number | null>(null);
    // Compteur de commentaires par tâche (mis à jour via onCountChange du CommentPanel)
    const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});

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

    // Gestion du drop : on ne déclenche onMoveTask que si la colonne a changé
    // La mise à jour optimiste est gérée dans le parent (ProjectDetailPage.handleMoveTask)
    const handleDrop = (statusId: number) => {
        if (draggedTask && draggedTask.statusId !== statusId) {
            onMoveTask(draggedTask, statusId);
        }
        setDraggedTask(null);
        setOverColumn(null);
    };

    return (
        <div className="grid gap-5 md:grid-cols-3">
            {availableStatuses.map(status => {
                // ✅ Correction : on utilise directement status.statusId
                const id = status.statusId;
                const columnTasks = tasks
                    .filter(t => t.statusId === id)
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                const style = getStatusStyle(status);

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
                        {/* En-tête colonne */}
                        <div className="mb-3 flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">{status.name}</h3>
                                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-gray-600 shadow-sm">
                                    {columnTasks.length}
                                </span>
                            </div>
                            <button
                                onClick={() => onCreateTask(id)}
                                title={`Ajouter une tâche dans ${status.name}`}
                                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white hover:text-accent"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Cartes tâches */}
                        <div className="flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar p-1">
                            {columnTasks.length === 0 && (
                                <div className="rounded-xl border-2 border-dashed border-white/70 px-4 py-6 text-center text-xs text-gray-400">
                                    Glissez une tâche ici
                                </div>
                            )}

                            {columnTasks.map(task => (
                                <TaskCard
                                    key={`${projectId}-${task.taskId}`}
                                    task={task}
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
                                />
                            ))}
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