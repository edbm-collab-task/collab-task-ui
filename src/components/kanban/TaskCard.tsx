import React from 'react';
import { Pencil, Trash2, Users, CalendarDays, GitBranch, MessageSquare } from 'lucide-react';

interface TaskCardProps {
    task: any;
    projectId: string | number;
    priorityBadge: (priorityName: any) => { name: string; color: string };
    formatDate: (date: string | null) => string | null;

    getCount: (taskId: any) => number | string;
    onEditTask?: (task: any) => void;
    onDeleteTask?: (task: any) => void;
    setCommentTaskId?: (taskId: any) => void;
    setDraggedTask?: (task: any) => void;
    setOverColumn?: (column: any) => void;
    showActions?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
    task,
    projectId,
    priorityBadge,
    formatDate,
    getCount,
    onEditTask,
    onDeleteTask,
    setCommentTaskId,
    setDraggedTask,
    setOverColumn,
    showActions = true,
}) => {
    const priority = priorityBadge(task.priorityName);
    const commentCount = getCount(task.taskId);

    return (
        <div
            key={`${projectId}-${task.taskId}`}
            draggable
            onDragStart={() => setDraggedTask?.(task)}
            onDragEnd={() => {
                setDraggedTask?.(null);
                setOverColumn?.(null);
            }}
            className="group cursor-grab rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-primary active:cursor-grabbing"
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                
                {showActions && (
                    <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                        {onEditTask && (
                            <button
                                onClick={() => onEditTask(task)}
                                title="Modifier"
                                className="rounded p-1 text-gray-400 transition hover:bg-blue-50 hover:text-accent"
                            >
                                <Pencil size={14} />
                            </button>
                        )}
                        {onDeleteTask && (
                            <button
                                onClick={() => onDeleteTask(task)}
                                title="Archiver"
                                className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-accent"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {task.description && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>
            )}

            {task.assignees && task.assignees.length > 0 && (
                <div className="mt-2 flex items-center gap-1">
                    <Users size={11} className="text-gray-400" />
                    <div className="flex -space-x-1.5">
                        {task.assignees.slice(0, 4).map((a: any) => (
                            <span
                                key={a.userId}
                                title={`${a.firstname} ${a.lastname}`}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white ring-1 ring-white"
                            >
                                {a.firstname?.[0]}{a.lastname?.[0]}
                            </span>
                        ))}
                        {task.assignees.length > 4 && (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-500 ring-1 ring-white">
                                +{task.assignees.length - 4}
                            </span>
                        )}
                    </div>
                </div>
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

                {showActions && setCommentTaskId && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCommentTaskId(task.taskId);
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 transition hover:bg-blue-50 hover:text-accent"
                        title="Commentaires"
                    >
                        <MessageSquare size={11} />
                        {commentCount}
                    </button>
                )}
            </div>
        </div>
    );
};