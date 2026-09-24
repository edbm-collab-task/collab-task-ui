import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { Status } from "@/types/status";

export const statusService = {
    getAll: async (projectId?: number): Promise<Status[]> => {
        const params: Record<string, unknown> = {};
        if (projectId) params.projectId = projectId;
        return apiClient.get<Status[]>(API_ENDPOINTS.STATUSES.ALL, params);
    },

    create: async (payload: { name: string; sortOrder?: number; projectId?: number }): Promise<Status> => {
        return apiClient.post<Status, { name: string; sortOrder?: number; projectId?: number }>(API_ENDPOINTS.STATUSES.ALL, payload);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${API_ENDPOINTS.STATUSES.ALL}/${id}`);
    },
};
