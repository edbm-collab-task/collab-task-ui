import { api } from "@/api/axios";
import type { Activity } from "@/types/activity";

export const activityService = {
    getByProject: async (projectId: number): Promise<Activity[]> => {
        const response = await api.get<Activity[]>(`projects/${projectId}/activities`);
        return response.data;
    },
};
