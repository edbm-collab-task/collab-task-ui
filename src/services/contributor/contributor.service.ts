import { api } from "@/api/axios";
import type { Contributor } from "@/types/contributor";

export const contributorService = {
    getAll: async (projectId: number): Promise<Contributor[]> => {
        const response = await api.get<Contributor[]>(`projects/${projectId}/contributors`);
        return response.data;
    },

    add: async (projectId: number, userId: number): Promise<Contributor> => {
        const response = await api.post<Contributor>(`projects/${projectId}/contributors`, { userId });
        return response.data;
    },

    remove: async (projectId: number, userId: number): Promise<void> => {
        await api.delete(`projects/${projectId}/contributors/${userId}`);
    },
};
