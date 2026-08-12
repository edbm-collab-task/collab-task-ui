import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";

import type {
    UserRequest,
    UserResponse
} from "@/types/user";


export const userService = {

    getAll: async (): Promise<UserResponse[]> => {

        return apiClient.get<UserResponse[]>(
            API_ENDPOINTS.USERS.ALL
        );

    },

    getAllActive: async (): Promise<UserResponse[]> => {

        return apiClient.get<UserResponse[]>(
            API_ENDPOINTS.USERS.ALL_ACTIVE
        );

    },

      getAllDisable: async (): Promise<UserResponse[]> => {

        return apiClient.get<UserResponse[]>(
            API_ENDPOINTS.USERS.ALL_DISABLE
        );

    },

    getById: async (
        id: number
    ): Promise<UserResponse> => {

        return apiClient.get<UserResponse>(
            `${API_ENDPOINTS.USERS.BY_ID}/${id}`
        );

    },


    create: async (
        data: UserRequest
    ): Promise<UserResponse> => {

        return apiClient.post<UserResponse, UserRequest>(
            API_ENDPOINTS.USERS.CREATE,
            data
        );

    },


    update: async (
        id: number,
        data: UserRequest
    ): Promise<UserResponse> => {

        return apiClient.put<UserResponse, UserRequest>(
            `${API_ENDPOINTS.USERS.UPDATE}/${id}`,
            data
        );

    },


    delete: async (
        id: number
    ): Promise<void> => {

        await apiClient.delete(
            `${API_ENDPOINTS.USERS.DELETE}/${id}`
        );

    },

    updateAccountStatus: async (
        email: string,
        isActive: boolean
    ): Promise<void> => {

        await apiClient.put(
            `${API_ENDPOINTS.USERS.DESACTIVATE}?email=${encodeURIComponent(email)}&isActive=${isActive}`,
            {}
        );

    },

};