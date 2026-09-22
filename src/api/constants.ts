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
        BASE: "/users",
        RECOVERY: "/users/pwd",
        SEARCH_USER_BY_EMAIL: "/users/email",
        ALL: "/users",
        ALL_ACTIVE: "/users/active",
        BY_ID: "/users",
        CREATE: "/auth/register",
        UPDATE: "/auth/register",
        DELETE: "/users",
        DESACTIVATE: "/users/account",
        ALL_DISABLE: "/users/disable",
        UPDATE_ROLE: "/users/role",
        IMAGE: (id: number) => `/users/${id}/image`,
        POTENTIAL_CONTRIBUTORS: (projectId: number) => `/users/project/${projectId}/contributors`,
    },

    DIRECTION: {
        ALL: "/directions",
        BY_ID: "/directions",
        CREATE: "/directions",
        UPDATE: "/directions",
        DELETE: "/directions"
    },

    PROJECTS: {

        ALL: "/projects",

        BY_ID: "/projects",

        CREATE: "/projects",

        UPDATE: "/projects",

        DELETE: "/projects",

        TRANSFER_OWNERSHIP: (id: number) => `/projects/${id}/transfer-ownership`

    },

    TASKS: {

        ALL: "/tasks",

        BY_ID: "/tasks",

        BY_PROJECT: "/tasks/project",

        CREATE: "/tasks",

        UPDATE: "/tasks",

        CHANGE_STATUS: "/tasks",

        DELETE: "/tasks"

    },

    STATUSES: {

        ALL: "/statuses"

    },

    ROLES: {
        ALL: "/roles",
        BY_ID: "/roles",
        CREATE: "/roles",
        UPDATE: "/roles",
        DELETE: "/roles",
        PERMISSIONS: "/roles/permissions",
    },

    ADMINS: {
        ALL: "/users/admins",
    },

    MESSAGES: {
        CONVERSATIONS: "/conversations",
        USERS: "/conversations/users",
        MESSAGES: "/conversations",
    },

    CONVERSATIONS: {
        ALL: "/conversations",
        USERS: "/conversations/users",
        BY_ID: "/conversations",
        PRIVATE: "/conversations/private",
        GROUP: "/conversations/group",
        MEMBERS: (conversationId: number) =>
            `/conversations/${conversationId}/members`,
        ADD_MEMBERS: (conversationId: number) =>
            `/conversations/${conversationId}/members`,
        REMOVE_MEMBER: (
            conversationId: number,
            userId: number
        ) =>
            `/conversations/${conversationId}/members/${userId}`,
        LEAVE: (conversationId: number) =>
            `/conversations/${conversationId}/leave`,

        READ: (conversationId: number) =>
            `/conversations/${conversationId}/read`,

        PIN: (conversationId: number) =>
            `/conversations/${conversationId}/pin`,

        ARCHIVE: (conversationId: number) =>
            `/conversations/${conversationId}/archive`,

        DELETE: (conversationId: number) =>
            `/conversations/${conversationId}`,

        MESSAGES: (conversationId: number) =>
            `/conversations/${conversationId}/messages`,

        SEND_MESSAGE: (conversationId: number) =>
            `/conversations/${conversationId}/messages`,

        MESSAGE_BY_ID: (messageId: number) =>
            `/conversations/messages/${messageId}`,

        DELETE_MESSAGE: (messageId: number) =>
            `/conversations/messages/${messageId}`,
    },

    ACTIVITIES: {
        BY_PROJECT: (projectId: number) => `/projects/${projectId}/activities`,
    },

    ATTACHMENTS: {
        BY_TASK: (taskId: number) => `/tasks/${taskId}/attachments`,
        BY_ID: (attachmentId: number) => `/tasks/attachments/${attachmentId}`,
        DOWNLOAD: (attachmentId: number) => `/tasks/attachments/${attachmentId}/download`,
    },

    COMMENTS: {
        BY_TASK: (taskId: number) => `/tasks/${taskId}/comments`,
        COUNT: (taskId: number) => `/tasks/${taskId}/comments/count`,
        BY_ID: (taskId: number, commentId: number) => `/tasks/${taskId}/comments/${commentId}`,
        REACTIONS: (taskId: number, commentId: number) => `/tasks/${taskId}/comments/${commentId}/reactions`,
    },

    CONTRIBUTORS: {
        ALL: (projectId: number) => `/projects/${projectId}/contributors`,
        BY_ID: (projectId: number, userId: number) => `/projects/${projectId}/contributors/${userId}`,
    },

    NOTIFICATIONS: {
        ALL: "/notifications",
        UNREAD_COUNT: "/notifications/unread-count",
        READ: (id: number) => `/notifications/${id}/read`,
        READ_ALL: "/notifications/read-all",
    },

    DASHBOARD: {
        STATS: "/dashboard/stats",
        REPORT_PDF: "/dashboard/reports/pdf",
    },

    ADMIN_DASHBOARD: {
        STATS: "/admin/dashboard/stats",
        REPORT_PDF: "/admin/dashboard/reports/pdf",
    },

} as const;