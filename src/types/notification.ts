export interface Notification {
    notificationId: number;
    message: string;
    type: "CONTRIBUTOR_ADDED" | "TASK_ASSIGNED" | "PRIORITY_CHANGED" | "PROJECT_DEADLINE" | "TASK_DEADLINE";
    isRead: boolean;
    createdAt: string;
    projectId: number | null;
    taskId: number | null;
}
