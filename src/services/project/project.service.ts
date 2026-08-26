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

    getStatuses: async (): Promise<Status[]> => {
        return statusService.getAll();
    }

};