import { useState } from 'react';

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
    /** Numéro hiérarchique dans la colonne : racine "1", enfants "1.1", etc. */
    number: string;
}

/** Décalage (~12px) + filet vertical appliqués à chaque niveau de sous-tâche. */
const NESTED_WRAPPER = 'ml-3 border-l-2 border-primary pl-3 max-md:ml-2 max-md:pl-2';

/**
 * Rendu récursif d'une tâche et de ses sous-tâches.
 *
 * La carte du parent est suivie de ses enfants, chacun décalé et relié par un
 * filet vertical (comme l'arbre de commentaires, CommentItem.tsx:357).
 *
 * Les sous-tâches sont repliées par défaut : un clic sur la carte du parent
 * (voir TaskCard onClick/onToggle) les déplie ou les replie. Chaque nœud gère
 * son propre état d'expansion, donc un parent déplié laisse ses enfants
 * eux-mêmes repliés tant qu'ils ne sont pas cliqués.
 *
 * Chaque tâche porte un numéro hiérarchique (`number`) défini par KanbanBoard
 * pour les racines ("1", "2", ...) et hérité ici pour les sous-tâches
 * (ex. "1.1", "1.2"), même repliées.
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
    number,
}) => {
    const { task, depth, children } = node;
    const isNested = depth > 0;
    // Sous-tâches masquées par défaut ; la carte parent bascule via onToggle.
    const [expanded, setExpanded] = useState(false);
    const hasChildren = children.length > 0;

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
            hasChildren={hasChildren}
            expanded={expanded}
            onToggle={() => setExpanded(prev => !prev)}
            number={number}
        />
    );

    const subtree = expanded && hasChildren && (
        <div className={`mt-2 space-y-2 ${NESTED_WRAPPER}`}>
            {children.map((child, childIndex) => (
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
                    number={`${number}.${childIndex + 1}`}
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
