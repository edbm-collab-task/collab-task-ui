import { API_CONFIG } from "@/api/constants";
import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

const shouldRefresh = (status: number, url: string): boolean => {
    if (url.includes("/auth/")) return false;
    return status === 401 || status === 403;
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            toast.error("Impossible de contacter le serveur.");
            return Promise.reject(error);
        }

        const originalRequest = error.config;
        const status = error.response.status;

        if (shouldRefresh(status, originalRequest.url) && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(
                    `${API_CONFIG.BASE_URL}/auth/refresh`,
                    null,
                    { withCredentials: true }
                );
                processQueue(null);
                return api(originalRequest);
            } catch {
                processQueue(null);
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        const message = error.response.data?.message || "Une erreur est survenue.";

        switch (status) {
            case 400:
                toast.error(message);
                break;
            case 401:
                break;
            case 403:
                toast.error("Accès refusé.");
                break;
            case 404:
                toast.error("Ressource introuvable.");
                break;
            case 409:
                toast.error(message);
                break;
            case 500:
                toast.error("Erreur interne du serveur.");
                break;
            default:
                toast.error(message);
        }

        return Promise.reject(error);
    }
);
