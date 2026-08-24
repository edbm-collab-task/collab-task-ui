import { api } from "./axios";

export interface RequestOptions {
    silent?: boolean;
}

export const apiClient = {

    get: async <T>(
        url: string,
        params?: Record<string, unknown>,
        options?: RequestOptions
    ): Promise<T> => {

        const response = await api.get<T>(url, {
            params,
            silent: options?.silent,
        } as any);

        return response.data;
    },


    post: async <T, B>(
        url: string,
        body: B,
        options?: RequestOptions
    ): Promise<T> => {

        const response = await api.post<T>(
            url,
            body,
            { silent: options?.silent } as any
        );

        return response.data;
    },


    put: async <T, B>(
        url: string,
        body: B,
        options?: RequestOptions
    ): Promise<T> => {

        const response = await api.put<T>(
            url,
            body,
            { silent: options?.silent } as any
        );

        return response.data;
    },


    patch: async <T, B>(
        url: string,
        body: B,
        options?: RequestOptions
    ): Promise<T> => {

        const response = await api.patch<T>(
            url,
            body,
            { silent: options?.silent } as any
        );

        return response.data;
    },


    delete: async <T>(
        url: string,
        options?: RequestOptions
    ): Promise<T> => {

        const response = await api.delete<T>(url, {
            silent: options?.silent,
        } as any);

        return response.data;
    }

};