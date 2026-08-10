import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";

import type {
    DirectionReq,
    DirectionRes
} from "@/types/direction";


export const directionService = {

    getAll: async (): Promise<DirectionRes[]> => {

        return apiClient.get<DirectionRes[]>(
            API_ENDPOINTS.DIRECTION.ALL
        );

    },


    getById: async (
        id: number
    ): Promise<DirectionRes> => {

        return apiClient.get<DirectionRes>(
            `${API_ENDPOINTS.DIRECTION.BY_ID}/${id}`
        );

    },


    create: async (
        data: DirectionReq
    ): Promise<DirectionRes> => {

        return apiClient.post<DirectionRes, DirectionReq>(
            API_ENDPOINTS.DIRECTION.CREATE,
            data
        );

    },


    update: async (
        id: number,
        data: DirectionReq
    ): Promise<DirectionRes> => {

        return apiClient.put<DirectionRes, DirectionReq>(
            `${API_ENDPOINTS.DIRECTION.UPDATE}/${id}`,
            data
        );

    },


    delete: async (
        id: number
    ): Promise<void> => {

        await apiClient.delete(
            `${API_ENDPOINTS.DIRECTION.DELETE}/${id}`
        );

    }

};