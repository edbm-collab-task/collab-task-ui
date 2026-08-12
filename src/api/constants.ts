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

        REFRESH: "/auth/refresh",

        VERIFICATION: "/auth/verification-code",

        CODE: "/auth/code",

        RECOVERY_ME: "/auth/recovery/me",

        CREATE: "/auth/create"

    },


    USERS: {

        BASE: "/users" ,

        RECOVERY: "/users/pwd",

        SEARCH_USER_BY_EMAIL: "/users/email",

        ALL: "/users",

        ALL_ACTIVE: "/users/active",
        
        BY_ID: "/users",

        CREATE: "/auth/register",
        
        UPDATE: "/auth/register",
        
        DELETE: "/users",

        DESACTIVATE: "/users/account",

        ALL_DISABLE: "/users/disable"

    },

    DIRECTION: {
        
        ALL: "/directions",
        
        BY_ID: "/directions",

        CREATE: "/directions",
        
        UPDATE: "/directions",
        
        DELETE: "/directions"
    }

} as const;