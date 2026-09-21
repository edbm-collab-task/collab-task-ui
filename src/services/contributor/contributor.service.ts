import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { Contributor } from "@/types/contributor";

export const contributorService = {
    getAll: async (projectId: number): Promise<Contributor[]> => {
        return apiClient.get<Contributor[]>(
            API_ENDPOINTS.CONTRIBUTORS.ALL(projectId)
        );
    },

    add: async (projectId: number, userId: number): Promise<Contributor> => {
        return apiClient.post<Contributor, { userId: number }>(
            API_ENDPOINTS.CONTRIBUTORS.ALL(projectId),
            { userId }
        );
    },

    remove: async (projectId: number, userId: number): Promise<void> => {
        await apiClient.delete(
            API_ENDPOINTS.CONTRIBUTORS.BY_ID(projectId, userId)
        );
    },
};
