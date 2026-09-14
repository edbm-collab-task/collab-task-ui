import { api } from "./axios";

export const apiClient = {

    get: async <T>(
        url: string,
        params?: Record<string, unknown>
    ): Promise<T> => {

        const response = await api.get<T>(url, {
            params
        });

        return response.data;
    },


    post: async <T, B>(
        url: string,
        body: B
    ): Promise<T> => {

        const response = await api.post<T>(
            url,
            body
        );

        return response.data;
    },


    put: async <T, B>(
        url: string,
        body: B
    ): Promise<T> => {

        const response = await api.put<T>(
            url,
            body
        );

        return response.data;
    },


    patch: async <T, B>(
        url: string,
        body: B
    ): Promise<T> => {

        const response = await api.patch<T>(
            url,
            body
        );

        return response.data;
    },


    delete: async <T>(
        url: string
    ): Promise<T> => {

        const response = await api.delete<T>(url);

        return response.data;
    }

};