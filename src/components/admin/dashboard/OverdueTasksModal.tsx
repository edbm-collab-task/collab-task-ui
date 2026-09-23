import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock, ArrowRight } from "lucide-react";
import { taskService } from "@/services/task/task.service";
import { projectService } from "@/services/project/project.service";
import type { TaskRes } from "@/types/task";

interface Props {
    projectId?: number;
    onClose: () => void;
}

export default function OverdueTasksModal({ projectId, onClose }: Props) {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<TaskRes[]>([]);
    const [loading, setLoading] = useState(true);

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
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-800">Tâches en retard</h3>
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
                        <div className="space-y-3">
                            {tasks.map(task => (
                                <div
                                    key={task.taskId}
                                    className="rounded-xl border border-red-200 bg-red-50 p-4 hover:bg-red-100/50 transition cursor-pointer"
                                    onClick={() => {
                                        navigate(`/admin/projects/${task.projectId}`);
                                        onClose();
                                    }}
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
                                        Échéance : {formatDate(task.dueDate)}
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatDate(date: string | null) {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}