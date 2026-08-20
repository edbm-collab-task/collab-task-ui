// Priorités : valeurs fixées dans la base (data.sql du backend).
// Le backend n'expose pas d'endpoint pour lister les priorités,
// ces constantes reflètent donc le seed initial de la base edbm.
export const PRIORITIES = [
    { id: 1, name: "Basse", color: "bg-slate-100 text-slate-700" },
    { id: 2, name: "Moyenne", color: "bg-sky-100 text-sky-700" },
    { id: 3, name: "Haute", color: "bg-orange-100 text-orange-700" },
    { id: 4, name: "Urgente", color: "bg-rose-100 text-rose-700" },
] as const;

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
    statusId: number;
    statusName: string;
    parentTaskId: number | null;
    assignees: AssigneeRes[];
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