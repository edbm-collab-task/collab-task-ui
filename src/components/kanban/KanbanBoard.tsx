import { useState, useMemo } from "react";
import {
    Pencil,
    Trash2,
    CalendarDays,
    Plus,
    GitBranch,
    Users,
    MessageSquare,
} from "lucide-react";

import {
    PRIORITIES,
    STATUSES,
    type TaskRes,
} from "@/types/task";
import type { Status } from "@/types/status";
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
    allUsers = [],
    onEditTask,
    onCreateTask,
    onDeleteTask,
    onMoveTask,
    currentUserId,
}: Props) {
    const [draggedTask, setDraggedTask] = useState<TaskRes | null>(null);
    const [overColumn, setOverColumn] = useState<number | null>(null);
    const [commentTaskId, setCommentTaskId] = useState<number | null>(null);
    const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});

    const commentTask = useMemo(
        () => commentTaskId !== null ? tasks.find(t => t.taskId === commentTaskId) ?? null : null,
        [commentTaskId, tasks]
    );

    const getCount = (taskId: number) => commentCounts[taskId] ?? 0;

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
                task={tasks.find(t => t.taskId === commentTaskId)}
                projectId={projectId}
                priorityBadge={priorityBadge}
                formatDate={formatDate}
                getCount={getCount}
            />
        </div>
    );
}