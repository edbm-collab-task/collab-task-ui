// Priorités : couleurs indexées par NOM, car l'association ID↔nom peut varier
// selon la base (seed initial ou import de données réelles). Le nom vient
// toujours de l'API (task.priorityName), jamais d'un ID supposé.
// Le backend n'expose pas d'endpoint pour lister les priorités.
export const PRIORITY_COLORS: Record<string, string> = {
    "Basse": "bg-slate-100 text-slate-700",
    "Moyenne": "bg-sky-100 text-sky-700",
    "Haute": "bg-orange-100 text-orange-700",
    "Urgente": "bg-rose-100 text-rose-700",
};

export const DEFAULT_PRIORITY_COLOR = "bg-slate-100 text-slate-700";

export function priorityColor(priorityName: string | null | undefined): string {
    return (priorityName && PRIORITY_COLORS[priorityName]) || DEFAULT_PRIORITY_COLOR;
}

export interface PriorityOption {
    priorityId: number;
    priorityName: string;
    prioritySortOrder: number | null;
}

// Extrait la liste réelle des priorités depuis les tâches renvoyées par l'API
// (chaque TaskRes contient priorityId + priorityName + prioritySortOrder).
// Triée par ordre métier croissant (1 = Urgente → 4 = Basse).
export function extractPrioritiesFromTasks(tasks: TaskRes[]): PriorityOption[] {
    const map = new Map<number, PriorityOption>();
    for (const t of tasks) {
        if (t.priorityId == null) continue;
        if (!map.has(t.priorityId)) {
            map.set(t.priorityId, {
                priorityId: t.priorityId,
                priorityName: t.priorityName,
                prioritySortOrder: t.prioritySortOrder,
            });
        }
    }
    return Array.from(map.values()).sort(
        (a, b) => (a.prioritySortOrder ?? Number.MAX_SAFE_INTEGER) - (b.prioritySortOrder ?? Number.MAX_SAFE_INTEGER)
    );
}

// Priorité par défaut d'une nouvelle tâche : "Moyenne" si présente, sinon la
// première priorité disponible (résolue par nom, jamais par ID en dur).
export function defaultPriorityId(options: PriorityOption[]): number {
    const middle = options.find(o => o.priorityName === "Moyenne");
    return middle?.priorityId ?? options[0]?.priorityId ?? 0;
}

// Statuts par défaut : valeurs fixées dans data.sql du backend.
// Utilisés par tous les composants existants (Dashboard, KanbanBoard, etc.).
// Format : { id, name, color, column, dot }
export const STATUSES = [
    { id: 1, name: "A faire", color: "bg-amber-100 text-amber-800", column: "bg-amber-50/80 border-amber-200", dot: "bg-amber-400" },
    { id: 2, name: "En cours", color: "bg-blue-100 text-blue-800", column: "bg-blue-50/80 border-blue-200", dot: "bg-blue-500" },
    { id: 3, name: "Termine", color: "bg-emerald-100 text-emerald-800", column: "bg-emerald-50/80 border-emerald-200", dot: "bg-emerald-500" },
] as const;

// Interfaces de tâche (utilisées par les composants et services)
export interface TaskRes {
    taskId: number;
    title: string;
    description: string;
    dueDate: string | null;
    isActive: boolean;
    projectId: number;
    projectTitle: string;
    priorityId: number;
    priorityName: string;
    // Ordre métier de la priorité exposé par l'API (1 = Urgente, 4 = Basse),
    // distinct de priorityId. Nullable : l'API peut retourner null.
    prioritySortOrder: number | null;
    statusId: number;
    statusName: string;
    parentTaskId: number | null;
    commentCount: number;
    assignees: AssigneeRes[];
    sortOrder?: number;
}

export interface AssigneeRes {
    userId: number;
    firstname: string;
    lastname: string;
    email: string;
    imagePath: string | null;
}

export interface TaskReq {
    title: string;
    description: string;
    dueDate: string | null;
    projectId: number;
    priorityId: number;
    statusId: number;
    parentTaskId: number | null;
    assigneeIds: number[];
}

// Type Status minimal : utilisé par l'API /api/statuses pour les statuts personnalisés.
// Ces champs (statusId, name, sortOrder) sont ceux échangés avec le backend.
export type Status = {
    statusId: number;
    name: string;
    sortOrder?: number;
};