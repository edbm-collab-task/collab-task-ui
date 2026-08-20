export interface Activity {
    activityId: number;
    projectId: number;
    projectTitle: string;
    userId: number;
    userName: string;
    type: "PROJECT_CREATED" | "CONTRIBUTOR_ADDED" | "CONTRIBUTOR_REMOVED" | "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED" | "TASK_STATUS_CHANGED" | "TASK_PRIORITY_CHANGED" | "TASK_ASSIGNED" | "TASK_UNASSIGNED";
    description: string;
    taskId: number | null;
    createdAt: string;
}
