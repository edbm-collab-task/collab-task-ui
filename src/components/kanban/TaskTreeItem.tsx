import React from 'react';

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
 * La carte du parent est suivie de ses enfants, chacun décalé et relié par un
 * filet vertical (comme l'arbre de commentaires, CommentItem.tsx:357).
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
    const { task, depth, children } = node;
    const isNested = depth > 0;

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

    return (
        <div>
            {card}
            {subtree}
        </div>
    );
};
