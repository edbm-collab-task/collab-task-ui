import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import { toRecoverPasswordRequest } from "@/mappers/auth.mapper";
import type { Email } from "@/types/email";
import type { UserLoginReq, UserLoginRes, UserRequest, UserResponse,RecoveryMeResponse, RecoverPasswordFormUI} from "@/types/user";


export const authService = {

    register: async (
        data: UserRequest
    ): Promise<UserResponse> => {

        return apiClient.post<UserResponse, UserRequest>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        );
    },

    create: async (
        data: UserRequest
    ): Promise<UserResponse> => {

        return apiClient.post<UserResponse, UserRequest>(
            API_ENDPOINTS.AUTH.CREATE,
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

    logout: async (
    ): Promise<void> => {

        await apiClient.post(
            API_ENDPOINTS.AUTH.LOGOUT,
            {}
        );
    },

    recovery: async (email: string ,data: RecoverPasswordFormUI): Promise<void> => {

        var dataToSave = toRecoverPasswordRequest(email,data);

        console.log(dataToSave);

        await apiClient.put(
            API_ENDPOINTS.USERS.RECOVERY,
            dataToSave
        );
    },

    verification: async (data: { code: number }): Promise<void> => {

        await apiClient.get(
            API_ENDPOINTS.AUTH.VERIFICATION,
            data
        );
    },

    searchUserByEmail: async (data: { email: string }): Promise<UserResponse> => {
      return await apiClient.get(
            API_ENDPOINTS.USERS.SEARCH_USER_BY_EMAIL,
            data
        );
    },

    sendVerificationCode: async (data: Email): Promise<void> => {
        await apiClient.post(
            API_ENDPOINTS.AUTH.CODE,
            data
        );
    },

   recoveryMe: async (): Promise<RecoveryMeResponse> => {
       return await apiClient.get(API_ENDPOINTS.AUTH.RECOVERY_ME);
   }
};