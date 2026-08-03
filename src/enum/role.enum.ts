export const RoleType = {

    USER: "USER",

    ADMIN: "ADMIN",

    SUPER_ADMIN: "SUPER_ADMIN"

} as const;


export type RoleType =
    typeof RoleType[keyof typeof RoleType];