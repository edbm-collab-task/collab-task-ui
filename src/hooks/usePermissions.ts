import useAuth from "@/hooks/useAuth";
import type { ActionCode } from "@/constants/actions";
import { hasAction as hasActionBit } from "@/constants/actions";
import type { PermissionName } from "@/constants/permissions";
import type { PermissionSummary } from "@/types/user";

/**
 * Normalise une permission de session en {@link PermissionSummary}.
 *
 * La session expose normalement des objets `PermissionSummary` porteurs du
 * masque `totalActionsAccordees`; la forme historique ne fournissait que le
 * nom (`string`). Une entrée sans masque est ramenée à un
 * `totalActionsAccordees` absent, ce qui laisse `hasPermission` retomber sur
 * « présence seule » (fail-open) plutôt que de masquer toute l'interface.
 */
const normalizePermission = (
    permission: PermissionSummary | string
): PermissionSummary =>
    typeof permission === "string"
        ? { name: permission, totalActions: 0 }
        : permission;

/**
 * Accès aux permissions de l'utilisateur connecté.
 *
 * La session (`user.permissions`) porte, pour chaque permission, son nom
 * (`name`) et le masque de ses actions possibles (`totalActions`) et accordées
 * (`totalActionsAccordees`). Le rôle `SUPER_ADMIN` court-circuite toutes les
 * vérifications.
 */
export default function usePermissions() {
    const { user } = useAuth();

    const permissions = (user?.permissions ?? []).map(normalizePermission);

    /**
     * Masque d'actions accordées pour une permission, ou `undefined` si la
     * permission n'est pas accordée à l'utilisateur.
     */
    const getGrantedMask = (permission: PermissionName): number | undefined =>
        permissions.find(p => p.name === permission)?.totalActionsAccordees;

    /**
     * Indique si l'utilisateur possède une permission, et éventuellement une
     * action donnée sur cette permission.
     *
     * Le masque accordé provient de la session ; s'il est inconnu
     * (`undefined`), la seule présence de la permission vaut accord. Un masque
     * connu, y compris `0`, est appliqué strictement.
     *
     * @param permission Nom de la permission (`PERM.MANAGE_PROJECTS`, …).
     * @param action     Action exigée sur la permission (optionnelle).
     */
    const hasPermission = (permission: PermissionName, action?: ActionCode): boolean => {
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        if (!permissions.some(p => p.name === permission)) return false;
        if (action === undefined) return true;

        const mask = getGrantedMask(permission);
        return mask === undefined ? true : hasActionBit(mask, action);
    };

    /**
     * Indique si l'utilisateur peut effectuer une action sur une permission.
     *
     * Alias explicite de `hasPermission(permission, action)`.
     */
    const hasAction = (permission: PermissionName, action: ActionCode): boolean =>
        hasPermission(permission, action);

    /**
     * Indique si l'utilisateur possède au moins une des permissions données.
     *
     * @param names Noms de permissions à tester.
     */
    const hasAnyPermission = (...names: PermissionName[]): boolean => {
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        return names.some(name => permissions.some(p => p.name === name));
    };

    return {
        hasPermission,
        hasAction,
        hasAnyPermission,
        getGrantedMask,
        permissions
    };
}
