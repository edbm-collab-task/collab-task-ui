import { api } from "@/api/axios";
import type { Notification } from "@/types/notification";

export const notificationService = {
    getAll: async (): Promise<Notification[]> => {
        const response = await api.get<Notification[]>("/notifications");
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await api.get<{ count: number }>("/notifications/unread-count");
        return response.data.count;
    },

    markAsRead: async (id: number): Promise<Notification> => {
        const response = await api.patch<Notification>(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await api.patch("/notifications/read-all");
    },
};
