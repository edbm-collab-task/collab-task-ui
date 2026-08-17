import { useState } from "react";
import {
    Pencil,
    Trash2,
    CalendarDays,
    Plus,
    GitBranch,
} from "lucide-react";

import {
    PRIORITIES,
    STATUSES,
    type TaskRes,
} from "@/types/task";
import type { Status } from "@/types/status";

interface Props {
    projectId: number;
    tasks: TaskRes[];
    statuses?: Status[];
    onEditTask: (task: TaskRes) => void;
    onCreateTask: (statusId: number) => void;
    onDeleteTask: (task: TaskRes) => void;
    onMoveTask: (task: TaskRes, statusId: number) => void;
}

function priorityBadge(priorityId: number) {
    return PRIORITIES.find(p => p.id === priorityId) ?? PRIORITIES[0];
}

function formatDate(date: string | null) {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

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
        return { column: "bg-blue-50 border-blue-200", dot: "bg-blue-400" };
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
    onEditTask,
    onCreateTask,
    onDeleteTask,
    onMoveTask,
}: Props) {
    const [draggedTask, setDraggedTask] = useState<TaskRes | null>(null);
    const [overColumn, setOverColumn] = useState<number | null>(null);

    const fallbackStatuses: Status[] = STATUSES.map(s => ({
        statusId: s.id,
        name: s.name,
        sortOrder: 0,
    }));

    const availableStatuses = statuses ?? fallbackStatuses;

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
                const columnTasks = tasks.filter(t => t.statusId === id);
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
                                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white hover:text-blue-600"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Cartes tâches */}
                        <div className="flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar">
                            {columnTasks.length === 0 && (
                                <div className="rounded-xl border-2 border-dashed border-white/70 px-4 py-6 text-center text-xs text-gray-400">
                                    Glissez une tâche ici
                                </div>
                            )}

                            {columnTasks.map(task => {
                                const priority = priorityBadge(task.priorityId);
                                return (
                                    <div
                                        key={`${projectId}-${task.taskId}`}
                                        draggable
                                        onDragStart={() => setDraggedTask(task)}
                                        onDragEnd={() => {
                                            setDraggedTask(null);
                                            setOverColumn(null);
                                        }}
                                        className="group cursor-grab rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-blue-200 active:cursor-grabbing"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                                            <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                                                <button
                                                    onClick={() => onEditTask(task)}
                                                    title="Modifier"
                                                    className="rounded p-1 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteTask(task)}
                                                    title="Archiver"
                                                    className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {task.description && (
                                            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>
                                        )}

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priority.color}`}>
                                                {priority.name}
                                            </span>
                                            {task.dueDate && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                                    <CalendarDays size={11} />
                                                    {formatDate(task.dueDate)}
                                                </span>
                                            )}
                                            {task.parentTaskId && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                                                    <GitBranch size={11} />
                                                    Sous-tâche
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}