export const API_CONFIG = {

    BASE_URL: import.meta.env.VITE_API_BASE_URL,

    TIMEOUT: 10000

} as const;



export const API_ENDPOINTS = {

    AUTH: {

        LOGIN: "/auth/login",

        ME: "/auth/me",

        REGISTER: "/auth/register",

        LOGOUT: "/auth/logout",

        REFRESH: "/auth/refresh"

    },


    USERS: {

        BASE: "/users"

    }

} as const;