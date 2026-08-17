import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";

import type { TaskReq, TaskRes } from "@/types/task";


export const taskService = {

    getAll: async (): Promise<TaskRes[]> => {

        return apiClient.get<TaskRes[]>(
            API_ENDPOINTS.TASKS.ALL
        );

    },


    getById: async (id: number): Promise<TaskRes> => {

        return apiClient.get<TaskRes>(
            `${API_ENDPOINTS.TASKS.BY_ID}/${id}`
        );

    },


    getByProject: async (projectId: number): Promise<TaskRes[]> => {

        return apiClient.get<TaskRes[]>(
            `${API_ENDPOINTS.TASKS.BY_PROJECT}/${projectId}`
        );

    },


    create: async (data: TaskReq): Promise<TaskRes> => {

        return apiClient.post<TaskRes, TaskReq>(
            API_ENDPOINTS.TASKS.CREATE,
            data
        );

    },


    update: async (id: number, data: TaskReq): Promise<TaskRes> => {

        return apiClient.put<TaskRes, TaskReq>(
            `${API_ENDPOINTS.TASKS.UPDATE}/${id}`,
            data
        );

    },


    changeStatus: async (taskId: number, statusId: number): Promise<TaskRes> => {

        return apiClient.patch<TaskRes, Record<string, never>>(
            `${API_ENDPOINTS.TASKS.CHANGE_STATUS}/${taskId}/status?statusId=${statusId}`,
            {}
        );

    },


    archive: async (id: number): Promise<TaskRes> => {

        return apiClient.delete<TaskRes>(
            `${API_ENDPOINTS.TASKS.DELETE}/${id}`
        );

    }

};
