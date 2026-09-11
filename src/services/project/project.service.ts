import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";

import type { ProjectReq, ProjectRes } from "@/types/project";
import type { Status } from "@/types/task";
import { statusService } from "@/services/status/status.service";

export const projectService = {

    getAll: async (): Promise<ProjectRes[]> => {
        return apiClient.get<ProjectRes[]>(
            API_ENDPOINTS.PROJECTS.ALL
        );
    },

    getAllIncludingArchived: async (): Promise<ProjectRes[]> => {
        return apiClient.get<ProjectRes[]>(
            `${API_ENDPOINTS.PROJECTS.ALL}/all`
        );
    },

    getById: async (id: number): Promise<ProjectRes> => {
        return apiClient.get<ProjectRes>(
            `${API_ENDPOINTS.PROJECTS.BY_ID}/${id}`
        );
    },

    create: async (data: ProjectReq): Promise<ProjectRes> => {
        return apiClient.post<ProjectRes, ProjectReq>(
            API_ENDPOINTS.PROJECTS.CREATE,
            data
        );
    },

    update: async (id: number, data: ProjectReq): Promise<ProjectRes> => {
        return apiClient.put<ProjectRes, ProjectReq>(
            `${API_ENDPOINTS.PROJECTS.UPDATE}/${id}`,
            data
        );
    },

    archive: async (id: number): Promise<ProjectRes> => {
        return apiClient.delete<ProjectRes>(
            `${API_ENDPOINTS.PROJECTS.DELETE}/${id}`
        );
    },

    unarchive: async (id: number): Promise<ProjectRes> => {
        return apiClient.patch<ProjectRes, Record<string, never>>(
            `${API_ENDPOINTS.PROJECTS.UPDATE}/${id}/unarchive`,
            {}
        );
    },

    transferOwnership: async (id: number, newOwnerId: number): Promise<{ message: string }> => {
        return apiClient.post<{ message: string }, { newOwnerId: number }>(
            API_ENDPOINTS.PROJECTS.TRANSFER_OWNERSHIP(id),
            { newOwnerId }
        );
    },

    getStatuses: async (): Promise<Status[]> => {
        return statusService.getAll();
    },

    // Nouvelle méthode pour exporter le PDF du rapport projet
    exportPdf: async (projectId: number, params: {
        period: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Blob> => {
        const queryParams = new URLSearchParams();
        queryParams.append('period', params.period);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        const url = `${API_ENDPOINTS.PROJECTS.BY_ID}/${projectId}/report/pdf?${queryParams.toString()}`;
        return apiClient.get<Blob>(url, undefined, { responseType: 'blob' });
    }
};