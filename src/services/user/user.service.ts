import { apiClient, type RequestOptions } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { AttacheRole } from "@/types/role";
import type { EditUser } from "@/types/user";

import type {
    UserRequest,
    UserResponse
} from "@/types/user";


export const userService = {

    getAll: async (options?: RequestOptions): Promise<UserResponse[]> => {

        return apiClient.get<UserResponse[]>(
            API_ENDPOINTS.USERS.ALL,
            undefined,
            options
        );

    },

    getAllActive: async (): Promise<UserResponse[]> => {

        return apiClient.get<UserResponse[]>(
            API_ENDPOINTS.USERS.ALL_ACTIVE
        );

    },

    getByEmail: async (data: { email: string }): Promise<UserResponse> => {
        return await apiClient.get(
            API_ENDPOINTS.USERS.SEARCH_USER_BY_EMAIL,
            data
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

    updateRole: async (
        data: AttacheRole
    ): Promise<UserResponse> => {

        return apiClient.put<UserResponse, AttacheRole>(
            `${API_ENDPOINTS.USERS.UPDATE_ROLE}`,
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

    updateUser: async (
        data: EditUser
    ): Promise<UserResponse> => {

        return apiClient.post<UserResponse, EditUser>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        );
    },

    addImageToUser: async (
        id: number,
        image: File
    ): Promise<UserResponse> => {

        const formData = new FormData();

        formData.append("image", image);

        return apiClient.post<UserResponse, FormData>(
            API_ENDPOINTS.USERS.IMAGE(id),
            formData
        );
    },

    getAdmins: async (): Promise<UserResponse[]> => {
        return apiClient.get<UserResponse[]>(API_ENDPOINTS.ADMINS.ALL);
    },

};