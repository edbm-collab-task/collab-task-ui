import React from 'react';
import { Pencil, Trash2, Users, CalendarDays, GitBranch, MessageSquare, ListTree, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Propriétés de la carte de tâche.
 *
 * Une carte est soit une tâche racine (déplaçable), soit une sous-tâche
 * (`task.parentTaskId != null`) : les sous-tâches ne sont jamais déplaçables.
 */
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
    /** Profondeur dans l'arbre des sous-tâches : > 0 = carte imbriquée (version compacte) */
    depth?: number;
    /** Nombre de sous-tâches rendues directement en dessous de la carte */
    childrenCount?: number;
    /** La carte possède des sous-tâches (bouton déplier/replier visible) */
    hasChildren?: boolean;
    /** Sous-tâches actuellement dépliées (état contrôlé par TaskTreeItem) */
    expanded?: boolean;
    /** Bascule l'affichage des sous-tâches, appelée au clic sur la carte */
    onToggle?: () => void;
}

/**
 * Carte représentant une tâche ou une sous-tâche dans une colonne du kanban.
 *
 * Seules les tâches racines (sans `parentTaskId`) sont `draggable` : les
 * sous-tâches restent fixes sous leur parent. Le glissement est délégué au
 * parent via `setDraggedTask`/`setOverColumn` (KanbanBoard).
 *
 * Si la carte a des sous-tâches (`hasChildren`), un chevron est affiché à
 * droite et un clic sur la carte bascule leur affichage via `onToggle`
 * (TaskTreeItem gère l'état replié/déplié). Un clic sur un bouton interne
 * (Modifier/Archiver/Commentaires) ne déclenche pas la bascule.
 */
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
    depth = 0,
    childrenCount = 0,
    hasChildren = false,
    expanded = false,
    onToggle,
}) => {
    const priority = priorityBadge(task.priorityName);
    const commentCount = getCount(task.taskId);
    const isNested = depth > 0;
    // Une sous-tâche (parentTaskId renseigné) n'est pas déplaçable.
    const isSubtask = Boolean(task.parentTaskId);
    // Le badge "Sous-tâche" n'est utile que pour une sous-tâche rendue en tête
    // de colonne (parent dans une autre colonne), pas pour une carte imbriquée.
    const showSubtaskBadge = isSubtask && !isNested;

    // Clic sur la carte = déplier/replier les sous-tâches, sauf si le clic
    // provient d'un bouton interne (Modifier/Archiver/Commentaires).
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hasChildren || !onToggle) return;
        if ((e.target as HTMLElement).closest('button')) return;
        onToggle();
    };

    return (
        <div
            key={`${projectId}-${task.taskId}`}
            draggable={!isSubtask}
            onClick={handleClick}
            onDragStart={isSubtask ? undefined : () => setDraggedTask?.(task)}
            onDragEnd={
                isSubtask
                    ? undefined
                    : () => {
                          setDraggedTask?.(null);
                          setOverColumn?.(null);
                      }
            }
            className={`group rounded-xl ${isSubtask ? 'bg-white/80' : 'bg-white'} shadow-sm ring-1 transition hover:shadow-md hover:ring-primary ${
                isSubtask ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
            } ${isNested ? 'p-3 ring-violet-100' : 'p-4 ring-gray-100'}`}
        >
            <div className="flex items-start justify-between gap-2">
                <p className={`font-semibold text-gray-800 ${isNested ? 'text-[13px]' : 'text-sm'}`}>{task.title}</p>
                
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

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priority.color}`}>
                        {priority.name}
                    </span>

                    {task.dueDate && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                            <CalendarDays size={11} />
                            {formatDate(task.dueDate)}
                        </span>
                    )}

                    {showSubtaskBadge && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                            <GitBranch size={11} />
                            Sous-tâche
                        </span>
                    )}

                    {childrenCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-bg">
                            <ListTree size={11} />
                            {childrenCount} sous-tâche{childrenCount > 1 ? "s" : ""}
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

                {hasChildren && (
                    <span
                        title={expanded ? "Masquer les sous-tâches" : "Afficher les sous-tâches"}
                        aria-expanded={expanded}
                        className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-bg transition hover:opacity-80"
                    >
                        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>
                )}
            </div>
        </div>
    );
};