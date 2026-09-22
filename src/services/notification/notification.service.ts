import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { Notification } from "@/types/notification";

export const notificationService = {
    getAll: async (): Promise<Notification[]> => {
        return apiClient.get<Notification[]>(
            API_ENDPOINTS.NOTIFICATIONS.ALL
        );
    },

    getUnreadCount: async (): Promise<number> => {
        const res = await apiClient.get<{ count: number }>(
            API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
        );
        return res.count;
    },

    markAsRead: async (id: number): Promise<Notification> => {
        return apiClient.patch<Notification, undefined>(
            API_ENDPOINTS.NOTIFICATIONS.READ(id),
            undefined
        );
    },

    markAllAsRead: async (): Promise<void> => {
        await apiClient.patch<void, undefined>(
            API_ENDPOINTS.NOTIFICATIONS.READ_ALL,
            undefined
        );
    },
};
