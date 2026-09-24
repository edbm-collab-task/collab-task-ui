export const RoleType = {
    USER: "U1S",
    ADMIN: "A1D",
    SUPER_ADMIN: "S1ADM"
} as const;

export type RoleTypeCode = (typeof RoleType)[keyof typeof RoleType];

export type RoleName = keyof typeof RoleType;