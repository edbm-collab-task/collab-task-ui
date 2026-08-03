import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { UserLoginReq, UserLoginRes, UserRequest, UserResponse } from "@/types/user";


export const authService = {

    register: async (
        data: UserRequest
    ): Promise<UserResponse> => {

        return apiClient.post<UserResponse, UserRequest>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        );
    },


    login: async (
        data: UserLoginReq
    ): Promise<UserLoginRes> => {

        return apiClient.post<UserLoginRes,UserLoginReq>(
            API_ENDPOINTS.AUTH.LOGIN,
            data
        );
    },

     me: async (): Promise<UserLoginRes> => {

        return apiClient.get<UserLoginRes>(
            API_ENDPOINTS.AUTH.ME
        );

    },

    refresh: async (): Promise<UserLoginRes | null> => {

    return apiClient.post<UserLoginRes, {}>(
        API_ENDPOINTS.AUTH.REFRESH,
        {}
    );

   },

    logout: async (): Promise<void> => {

        await apiClient.post(
            API_ENDPOINTS.AUTH.LOGOUT,
            {}
        );
    }

};