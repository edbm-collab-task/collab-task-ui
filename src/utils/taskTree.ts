import type { TaskRes } from "@/types/task";

/**
 * Construction de l'arbre des sous-tâches à partir du tableau plat des tâches.
 *
 * Le backend n'expose pas d'arbres : une sous-tâche est simplement une TaskRes
 * dont `parentTaskId` pointe vers le `taskId` d'une autre tâche (types/task.ts:76).
 *
 * Chaque tâche a son propre `statusId` (donc sa propre colonne kanban). Une
 * sous-tâche dont le parent est dans une AUTRE colonne ne peut pas être rendue
 * sous sa vraie carte : elle est placée à la racine de sa colonne avec un
 * `parentTitle`, rendu comme une "carte fantôme" au-dessus d'elle (TaskTreeItem).
 */

/** Nœud d'une colonne : tâche + profondeur + éventuel parent fantôme + fils. */
export interface ColumnTaskNode {
    task: TaskRes;
    /** 0 = en tête de colonne, 1 = sous-tâche, etc. */
    depth: number;
    /** Titre du parent direct, quand celui-ci n'est pas rendu juste au-dessus. */
    parentTitle: string | null;
    children: ColumnTaskNode[];
}

interface TaskIndex {
    byId: Map<number, TaskRes>;
    childrenByParent: Map<number, TaskRes[]>;
}

/**
 * Tri d'une colonne : priorité d'abord (prioritySortOrder croissant = Urgente →
 * Basse), puis l'ordre manuel sortOrder. Les priorités sans ordre connu passent
 * en fin de liste. Extrait de l'ancien tri inline du KanbanBoard.
 */
export const compareTasks = (a: TaskRes, b: TaskRes): number => {
    const priorityA = a.prioritySortOrder ?? Number.MAX_SAFE_INTEGER;
    const priorityB = b.prioritySortOrder ?? Number.MAX_SAFE_INTEGER;

    if (priorityA !== priorityB) return priorityA - priorityB;

    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
};

/** Nombre total de cartes d'une colonne, sous-tâches imbriquées comprises. */
export const countColumnNodes = (nodes: ColumnTaskNode[]): number =>
    nodes.reduce((total, node) => total + 1 + countColumnNodes(node.children), 0);

const buildIndex = (tasks: TaskRes[]): TaskIndex => {
    const byId = new Map<number, TaskRes>(tasks.map(task => [task.taskId, task]));
    const childrenByParent = new Map<number, TaskRes[]>();

    for (const task of tasks) {
        // Un parent introuvable est traité comme une racine (donnée obsolète)
        const parentTaskId =
            task.parentTaskId !== null && byId.has(task.parentTaskId)
                ? task.parentTaskId
                : null;

        if (parentTaskId === null) continue;

        const siblings = childrenByParent.get(parentTaskId) ?? [];
        siblings.push(task);
        childrenByParent.set(parentTaskId, siblings);
    }

    for (const siblings of childrenByParent.values()) {
        siblings.sort(compareTasks);
    }

    return { byId, childrenByParent };
};

/**
 * Détecte les tâches impliquées dans un cycle de parenté (A parent de B et B
 * parent de A, encore possible car le sélecteur "Tâche parente" de la TaskModal
 * propose toutes les tâches). Résultat mémoïsé par tâche.
 */
const buildCycleIds = (index: TaskIndex, tasks: TaskRes[]): Set<number> => {
    const cycleIds = new Set<number>();
    const cache = new Map<number, number | null>();

    const findCycleStart = (task: TaskRes): number | null => {
        const cached = cache.get(task.taskId);
        if (cached !== undefined) return cached;

        cache.set(task.taskId, null);

        const visited = new Set<number>([task.taskId]);
        let current: TaskRes | undefined =
            task.parentTaskId !== null ? index.byId.get(task.parentTaskId) : undefined;

        let cycleStart: number | null = null;

        while (current) {
            if (visited.has(current.taskId)) {
                cycleStart = current.taskId;
                break;
            }

            visited.add(current.taskId);
            current =
                current.parentTaskId !== null
                    ? index.byId.get(current.parentTaskId)
                    : undefined;
        }

        cache.set(task.taskId, cycleStart);

        if (cycleStart !== null) cycleIds.add(cycleStart);

        return cycleStart;
    };

    for (const task of tasks) {
        if (task.parentTaskId !== null) findCycleStart(task);
    }

    return cycleIds;
};

/**
 * Parcourt les sous-tâches d'une même colonne : un enfant qui n'est pas dans la
 * colonne courante est ignoré ici, il sera traité comme racine de sa propre
 * colonne par buildColumnTree.
 */
const buildColumnTree = (
    index: TaskIndex,
    cycleIds: Set<number>,
    tasks: TaskRes[],
    statusId: number
): ColumnTaskNode[] => {
    const seen = new Set<number>();

    const visit = (
        task: TaskRes,
        depth: number,
        parentTitle: string | null
    ): ColumnTaskNode | null => {
        // Filet de sécurité : une tâche déjà rendue (cas d'un cycle de parenté
        // dont les deux membres sont promus racines) n'est pas dupliquée
        if (seen.has(task.taskId)) return null;
        seen.add(task.taskId);

        const children = (index.childrenByParent.get(task.taskId) ?? [])
            .filter(child => child.statusId === statusId)
            .map(child => visit(child, depth + 1, null))
            .filter((node): node is ColumnTaskNode => node !== null);

        return { task, depth, parentTitle, children };
    };

    // Racines de la colonne : tâches dont le parent n'est pas rendu au-dessus
    // (pas de parent, parent introuvable, parent dans une autre colonne) ou
    // faisant partie d'un cycle de parenté.
    const roots = tasks
        .filter(task => task.statusId === statusId)
        .filter(task => {
            if (task.parentTaskId === null) return true;
            if (cycleIds.has(task.taskId)) return true;

            const parent = index.byId.get(task.parentTaskId);

            return !parent || parent.statusId !== statusId;
        })
        .sort(compareTasks);

    return roots
        .map(task => {
            // Parent direct non rendu au-dessus : la carte fantôme prend le relais
            const parent =
                task.parentTaskId !== null
                    ? index.byId.get(task.parentTaskId)
                    : undefined;

            return visit(task, 0, parent ? parent.title : null);
        })
        .filter((node): node is ColumnTaskNode => node !== null);
};

/**
 * Construit l'arbre de chaque colonne à partir du tableau plat des tâches.
 * Une seule passe sur les données, le résultat est mémoïsé par l'appelant.
 */
export const buildColumnTaskTrees = (
    tasks: TaskRes[],
    statusIds: number[]
): Map<number, ColumnTaskNode[]> => {
    const index = buildIndex(tasks);
    const cycleIds = buildCycleIds(index, tasks);
    const trees = new Map<number, ColumnTaskNode[]>();

    for (const statusId of statusIds) {
        trees.set(statusId, buildColumnTree(index, cycleIds, tasks, statusId));
    }

    return trees;
};
