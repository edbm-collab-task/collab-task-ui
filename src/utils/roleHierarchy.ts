import type { Role } from "@/types/role";

/**
 * Rangs hiérarchiques alignés sur `roles.sort_order` côté API :
 * 1 = SUPER_ADMIN, 2 = ADMIN, 3 = tous les autres (USER et rôles créés via l'UI).
 */
export const ROLE_RANK = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    OTHER: 3
} as const;

export type RoleRank = (typeof ROLE_RANK)[keyof typeof ROLE_RANK];

/** Types minimaux nécessaires pour évaluer le rang d'un rôle. */
type RankedRole = Pick<Role, "name"> & { sortOrder?: number | null };

const SUPER_ADMIN_ROLE_NAME = "SUPER_ADMIN";
const ADMIN_ROLE_NAME = "ADMIN";

/**
 * Rang déduit du nom métier. La session expose le nom du rôle (`user.role`),
 * pas son code (`user.codeRole`), d'où ces littéraux alignés sur le backend.
 */
export function getRoleRankByName(roleName?: string | null): RoleRank {
    if (roleName === SUPER_ADMIN_ROLE_NAME) return ROLE_RANK.SUPER_ADMIN;
    if (roleName === ADMIN_ROLE_NAME) return ROLE_RANK.ADMIN;
    return ROLE_RANK.OTHER;
}

/**
 * Rang d'un rôle renvoyé par `GET /roles`. `sortOrder` fait foi ; le nom sert
 * de repli si l'API n'a pas encore été migrée.
 */
export function getRoleRank(role: RankedRole): number {
    return role.sortOrder ?? getRoleRankByName(role.name);
}

/**
 * Reflet côté front du guard backend : un appelant ne peut attribuer qu'un
 * rôle de rang strictement supérieur au sien. `SUPER_ADMIN` court-circuite
 * la règle et peut tout attribuer, y compris `SUPER_ADMIN`.
 */
export function canAssignRole(
    callerRoleName: string | null | undefined,
    target: RankedRole
): boolean {
    if (callerRoleName === SUPER_ADMIN_ROLE_NAME) return true;
    return getRoleRank(target) > getRoleRankByName(callerRoleName);
}

/** Filtre les rôles réellement attribuables par l'utilisateur connecté. */
export function getAssignableRoles(
    roles: Role[],
    callerRoleName: string | null | undefined
): Role[] {
    return roles.filter(role => canAssignRole(callerRoleName, role));
}
