import { apiClient } from "@/api/api-client";
import type { Status } from "@/types/status";

export const statusService = {
    getAll: async (projectId?: number): Promise<Status[]> => {
        const params: Record<string, unknown> = {};
        if (projectId) params.projectId = projectId;
        return apiClient.get<Status[]>("statuses", params);
    },

    create: async (payload: { name: string; sortOrder?: number; projectId?: number }): Promise<Status> => {
        return apiClient.post<Status, { name: string; sortOrder?: number; projectId?: number }>("statuses", payload);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`statuses/${id}`);
    },
};
