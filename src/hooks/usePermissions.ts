import useAuth from "@/hooks/useAuth";
import usePermissionActions from "@/hooks/usePermissionActions";
import type { ActionCode } from "@/constants/actions";
import { hasAction as hasActionBit } from "@/constants/actions";
import type { PermissionName } from "@/constants/permissions";

/**
 * Accès aux permissions de l'utilisateur connecté.
 *
 * La présence des permissions vient de la session (`user.permissions`), sous
 * forme de noms (`MANAGE_PROJECTS`, …). Les actions *accordées* sur chaque
 * permission sont reconstruites par `PermissionActionsProvider` (voir
 * `usePermissionActions`). Le rôle `SUPER_ADMIN` court-circuite toutes les
 * vérifications.
 */
export default function usePermissions() {
    const { user } = useAuth();
    const { grantedMasks } = usePermissionActions();

    /**
     * Masque d'actions accordées pour une permission, ou `undefined` si
     * l'information n'est pas (encore) connue côté client.
     */
    const getGrantedMask = (permission: PermissionName): number | undefined =>
        grantedMasks[permission];

    /**
     * Indique si l'utilisateur possède une permission, et éventuellement une
     * action donnée sur cette permission.
     *
     * Lorsque le masque accordé est inconnu (`undefined`), la seule présence
     * de la permission vaut accord (fail-open) : l'UI ne cache rien tant que
     * la reconstruction des masques n'a pas abouti. Un masque connu, y compris
     * `0`, est en revanche appliqué strictement.
     *
     * @param permission Nom de la permission (`PERM.MANAGE_PROJECTS`, …).
     * @param action     Action exigée sur la permission (optionnelle).
     */
    const hasPermission = (permission: PermissionName, action?: ActionCode): boolean => {
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        if (!(user.permissions?.includes(permission) ?? false)) return false;
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
     * @param permissions Noms de permissions à tester.
     */
    const hasAnyPermission = (...permissions: PermissionName[]): boolean => {
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        return permissions.some(p => user.permissions?.includes(p));
    };

    return {
        hasPermission,
        hasAction,
        hasAnyPermission,
        getGrantedMask,
        grantedMasks,
        permissions: user?.permissions ?? []
    };
}
