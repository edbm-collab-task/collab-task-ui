import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { Activity } from "@/types/activity";

export const activityService = {
    getByProject: async (projectId: number): Promise<Activity[]> => {
        return apiClient.get<Activity[]>(
            API_ENDPOINTS.ACTIVITIES.BY_PROJECT(projectId)
        );
    },
};
