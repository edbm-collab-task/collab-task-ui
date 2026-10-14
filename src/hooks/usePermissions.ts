import useAuth from "@/hooks/useAuth";
import type { ActionCode } from "@/constants/actions";
import { hasAction } from "@/constants/actions";

/**
 * Masque d'actions accordées pour une permission de l'utilisateur courant.
 *
 * TODO backend : retourner `accorde` une fois que l'API exposera les masques
 * `{ correspondant, accorde }`. Tant que ce n'est pas le cas, retourne
 * `undefined`, ce qui laisse `hasPermission` se contenter de la présence de
 * la permission.
 *
 * @param _permission Nom de la permission concernée (inutilisé pour l'instant).
 * @returns Le masque accordé, ou `undefined` si l'API ne le fournit pas.
 */
function getGrantedMask(_permission: string): number | undefined {
    return undefined;
}

/**
 * Accès aux permissions de l'utilisateur connecté.
 *
 * Les permissions sont fournies par la session (`user.permissions`) sous
 * forme de noms (`MANAGE_PROJECTS`, …). Le rôle `SUPER_ADMIN` court-circuite
 * toutes les vérifications.
 */
export default function usePermissions() {
    const { user } = useAuth();

    /**
     * Indique si l'utilisateur possède une permission, et éventuellement une
     * action donnée sur cette permission.
     *
     * @param permission Nom de la permission (`PERM.MANAGE_PROJECTS`, …).
     * @param action     Action exigée sur la permission. **Non contrôlée tant
     *   que le backend n'expose pas le masque `accorde`** : dans ce cas la
     *   seule présence de la permission vaut accord (voir {@link getGrantedMask}).
     */
    const hasPermission = (permission: string, action?: ActionCode): boolean => {
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        if (!(user.permissions?.includes(permission) ?? false)) return false;
        if (action === undefined) return true;

        const mask = getGrantedMask(permission);
        return mask === undefined ? true : hasAction(mask, action);
    };

    /**
     * Indique si l'utilisateur possède au moins une des permissions données.
     *
     * @param permissions Noms de permissions à tester.
     */
    const hasAnyPermission = (...permissions: string[]): boolean => {
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        return permissions.some(p => user.permissions?.includes(p));
    };

    return { hasPermission, hasAnyPermission, permissions: user?.permissions ?? [] };
}
