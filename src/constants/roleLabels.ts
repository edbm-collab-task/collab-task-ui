import { RoleType } from "@/enum/role.enum";

/**
 * Libellés lisibles pour chaque code de rôle.
 * La clé = la valeur renvoyée par l'API (ex: "U1S", "A1D", "S1ADM").
 */
export const ROLE_LABELS: Record<string, string> = {
    [RoleType.USER]: "Utilisateur",
    [RoleType.ADMIN]: "Administrateur",
    [RoleType.SUPER_ADMIN]: "Super administrateur",
};

/**
 * Retourne le libellé du rôle, ou le code brut en fallback.
 */
export function getRoleLabel(role: string | null | undefined): string {
    if (!role) return "—";
    return ROLE_LABELS[role] ?? role;
}