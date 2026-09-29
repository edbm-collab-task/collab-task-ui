import React from 'react';
import { GitBranch } from 'lucide-react';

import { TaskCard } from './TaskCard';
import type { ColumnTaskNode } from '@/utils/taskTree';

interface TaskTreeItemProps {
    node: ColumnTaskNode;
    projectId: string | number;
    priorityBadge: (priorityName: string | null) => { name: string; color: string };
    formatDate: (date: string | null) => string | null;
    getCount: (taskId: number) => number | string;
    onEditTask?: (task: any) => void;
    onDeleteTask?: (task: any) => void;
    setCommentTaskId?: (taskId: number) => void;
    setDraggedTask?: (task: any) => void;
    setOverColumn?: (column: any) => void;
    showActions?: boolean;
}

/** Décalage (~12px) + filet vertical appliqués à chaque niveau de sous-tâche. */
const NESTED_WRAPPER = 'ml-3 border-l-2 border-gray-200 pl-3 max-md:ml-2 max-md:pl-2';

/**
 * Rendu récursif d'une tâche et de ses sous-tâches.
 *
 * - La carte du parent est suivie de ses enfants, chacun décalé et relié par un
 *   filet vertical (comme l'arbre de commentaires, CommentItem.tsx:357).
 * - Si le parent direct n'est pas dans la colonne (statut différent), il est
 *   représenté par une "carte fantôme" au-dessus, reliée à la sous-tâche par le
 *   même filet.
 */
export const TaskTreeItem: React.FC<TaskTreeItemProps> = ({
    node,
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
    const { task, depth, parentTitle, children } = node;
    const hasGhostParent = parentTitle !== null;

    // Le groupe fantôme (parent dans une autre colonne) est en tête de colonne
    // mais s'affiche visuellement comme une sous-tâche
    const isNested = depth > 0 || hasGhostParent;

    const card = (
        <TaskCard
            key={task.taskId}
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
            showActions={showActions}
            depth={isNested ? Math.max(depth, 1) : 0}
            childrenCount={children.length}
            parentTitle={parentTitle}
        />
    );

    const subtree = children.length > 0 && (
        <div className={`mt-2 space-y-2 ${NESTED_WRAPPER}`}>
            {children.map(child => (
                <TaskTreeItem
                    key={`${child.task.taskId}-${child.depth}`}
                    node={child}
                    projectId={projectId}
                    priorityBadge={priorityBadge}
                    formatDate={formatDate}
                    getCount={getCount}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    setCommentTaskId={setCommentTaskId}
                    setDraggedTask={setDraggedTask}
                    setOverColumn={setOverColumn}
                    showActions={showActions}
                />
            ))}
        </div>
    );

    if (!hasGhostParent) {
        return (
            <div>
                {card}
                {subtree}
            </div>
        );
    }

    return (
        <div>
            {/* Carte fantôme du parent, absente de cette colonne */}
            <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white/60 px-2.5 py-1.5">
                <GitBranch size={12} className="shrink-0 text-gray-400" />

                <span className="truncate text-[11px] font-medium text-gray-500">
                    {parentTitle}
                </span>
            </div>

            {/* Filet reliant la carte fantôme à la sous-tâche */}
            <div className="mt-2 ml-2 space-y-2 border-l-2 border-gray-200 pl-2.5">
                {card}
                {subtree}
            </div>
        </div>
    );
};
