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

interface Props {
    tasks: TaskRes[];
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

export default function KanbanBoard({ tasks, onEditTask, onCreateTask, onDeleteTask, onMoveTask }: Props) {

    const [draggedTask, setDraggedTask] = useState<TaskRes | null>(null);
    const [overColumn, setOverColumn] = useState<number | null>(null);

    const handleDrop = (statusId: number) => {
        if (draggedTask && draggedTask.statusId !== statusId) {
            onMoveTask(draggedTask, statusId);
        }
        setDraggedTask(null);
        setOverColumn(null);
    };

    return (
        <div className="grid gap-5 md:grid-cols-3">
            {STATUSES.map(status => {

                const columnTasks = tasks.filter(t => t.statusId === status.id);

                return (
                    <div
                        key={status.id}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setOverColumn(status.id);
                        }}
                        onDragLeave={() => setOverColumn(null)}
                        onDrop={() => handleDrop(status.id)}
                        className={`flex h-fit max-h-[calc(100vh-15rem)] flex-col rounded-2xl border p-3 transition ${status.column} ${
                            overColumn === status.id ? "ring-2 ring-blue-400" : ""
                        }`}
                    >
                        {/* En-tête colonne */}
                        <div className="mb-3 flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">{status.name}</h3>
                                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-gray-600 shadow-sm">
                                    {columnTasks.length}
                                </span>
                            </div>
                            <button
                                onClick={() => onCreateTask(status.id)}
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
                                        key={task.taskId}
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
