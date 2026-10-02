import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock, ArrowRight, Users } from "lucide-react";
import { taskService } from "@/services/task/task.service";
import { projectService } from "@/services/project/project.service";
import type { TaskRes } from "@/types/task";
import { getInitialsFromParts } from "@/utils/avatar";
import { formatDateFull } from "@/utils/date";

interface Props {
    projectId?: number;
    onClose: () => void;
}

interface OverdueGroup {
    key: string;
    name: string;
    initials: string;
    count: number;
    tasks: TaskRes[];
}

/** Regroupe les tâches en retard par responsable (task.assignees). Une tâche
 *  apparaît dans le groupe de CHAQUE responsable ; les tâches sans aucun
 *  responsable ne disparaissent pas et vont dans un groupe "Non assignée(s)"
 *  placé en dernier. Les responsables sont triés du plus chargé au moins
 *  chargé, puis par ordre alphabétique. */
function groupOverdueByAssignee(tasks: TaskRes[]): OverdueGroup[] {
    const byUser = new Map<number, OverdueGroup>();
    const unassigned: TaskRes[] = [];

    for (const task of tasks) {
        const assignees = task.assignees ?? [];
        if (assignees.length === 0) {
            unassigned.push(task);
            continue;
        }
        for (const a of assignees) {
            let group = byUser.get(a.userId);
            if (!group) {
                group = {
                    key: `user-${a.userId}`,
                    name: `${a.firstname} ${a.lastname}`.trim(),
                    initials: getInitialsFromParts(a.firstname, a.lastname),
                    count: 0,
                    tasks: [],
                };
                byUser.set(a.userId, group);
            }
            group.count += 1;
            group.tasks.push(task);
        }
    }

    const groups = Array.from(byUser.values())
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    if (unassigned.length > 0) {
        groups.push({
            key: "unassigned",
            name: "Non assignée(s)",
            initials: "",
            count: unassigned.length,
            tasks: unassigned,
        });
    }
    return groups;
}

/** Carte d'une tâche en retard : conserve les informations et la navigation de
 *  l'affichage plat d'origine, réutilisée dans chaque groupe de responsable. */
function OverdueTaskCard({ task, onOpenTask }: { task: TaskRes; onOpenTask: (projectId: number) => void }) {
    return (
        <div
            className="rounded-xl border border-accent p-4 hover:bg-accent/20 transition cursor-pointer"
            onClick={() => onOpenTask(task.projectId)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">
                        {task.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {task.description || "Aucune description"}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>
                                Échéance : {formatDateFull(task.dueDate)}
                            </span>
                        </span>
                        <span className="flex items-center gap-1">
                            <ArrowRight size={12} />
                            <span>{task.projectTitle}</span>
                        </span>
                    </div>
                </div>
                <ArrowRight size={20} className="text-gray-400 flex-shrink-0" />
            </div>
        </div>
    );
}

export default function OverdueTasksModal({ projectId, onClose }: Props) {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<TaskRes[]>([]);
    const [loading, setLoading] = useState(true);

    // Regroupement des tâches en retard par responsable, recalculé à chaque
    // mise à jour de la liste filtrée.
    const groupedTasks = useMemo(() => groupOverdueByAssignee(tasks), [tasks]);

    useEffect(() => {
        let cancelled = false;

        const fetchTasks = async () => {
            try {
                let taskList: TaskRes[];
                if (projectId) {
                    taskList = await taskService.getByProject(projectId);
                } else {
                    const [allTasks, activeProjects] = await Promise.all([
                        taskService.getAll(),
                        projectService.getAll(),
                    ]);
                    if (cancelled) return;
                    const activeIds = new Set(activeProjects.map(p => p.projectId));
                    taskList = allTasks.filter(t => activeIds.has(t.projectId));
                }
                if (cancelled) return;
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                const overdue = taskList.filter(t => {
                    if (!t.dueDate || t.statusId === 3) return false;
                    return t.dueDate < todayStr;
                });
                setTasks(overdue);
                setLoading(false);
            } catch {
                if (!cancelled) setLoading(false);
            }
        };
        fetchTasks();
        return () => { cancelled = true; };
    }, [projectId]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
                    <div className="flex h-32 items-center justify-center text-gray-400">
                        <span className="animate-spin text-blue-500 text-2xl">⟳</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed flex items-center justify-center inset-0 z-50 bg-black/50 p-4">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[80vh] rounded-2xl bg-white overflow-hidden shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-primary border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-bg">Tâches en retard — {tasks.length}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {tasks.length === 0 ? (
                        <div className="flex h-48 items-center justify-center text-gray-400">
                            <p className="text-sm">Aucune tâche en retard</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedTasks.map(group => (
                                <section key={group.key} className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {group.initials ? (
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-primary text-xs font-bold">
                                                    {group.initials}
                                                </div>
                                            ) : (
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                                    <Users size={16} />
                                                </div>
                                            )}
                                            <p className="truncate text-sm font-semibold text-gray-800">{group.name}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                                            {group.count} tâche{group.count > 1 ? "s" : ""} en retard
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {group.tasks.map(task => (
                                            <OverdueTaskCard
                                                key={task.taskId}
                                                task={task}
                                                onOpenTask={(projectId) => {
                                                    navigate(`/admin/projects/${projectId}`);
                                                    onClose();
                                                }}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

