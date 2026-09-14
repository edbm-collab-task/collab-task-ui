import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import { toRecoverPasswordRequest } from "@/mappers/auth.mapper";
import type { Email } from "@/types/email";
import type { UserLoginReq,CreateUser, UserLoginRes, UserRequest, UserResponse,RecoveryMeResponse, RecoverPasswordFormUI} from "@/types/user";


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
        data: CreateUser
    ): Promise<UserResponse> => {

        return apiClient.post<UserResponse, CreateUser>(
            API_ENDPOINTS.AUTH.CREATE,
            data
        );
    },


    login: async (
        data: UserLoginReq
    ): Promise<UserLoginRes> => {

        const res = await apiClient.post<UserLoginRes,UserLoginReq>(
            API_ENDPOINTS.AUTH.LOGIN,
            data
        );
        if (res.accessToken) localStorage.setItem("accessToken", res.accessToken);
        if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
        return res;
    },

     me: async (): Promise<UserLoginRes> => {

        return apiClient.get<UserLoginRes>(
            API_ENDPOINTS.AUTH.ME
        );

    },

     refresh: async (): Promise<UserLoginRes | null> => {

    const res = await apiClient.post<UserLoginRes, {}>(
        API_ENDPOINTS.AUTH.REFRESH,
        {}
    );
    if (res?.accessToken) localStorage.setItem("accessToken", res.accessToken);
    if (res?.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
    return res;

   },

    logout: async (
    ): Promise<void> => {

        await apiClient.post(
            API_ENDPOINTS.AUTH.LOGOUT,
            {}
        );
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    },

    recovery: async (email: string ,data: RecoverPasswordFormUI): Promise<void> => {

        var dataToSave = toRecoverPasswordRequest(email,data);

        await apiClient.put(
            API_ENDPOINTS.USERS.RECOVERY,
            dataToSave,
            { silent: true }
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