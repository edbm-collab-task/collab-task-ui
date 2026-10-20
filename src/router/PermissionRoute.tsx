import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import usePermissions from "@/hooks/usePermissions";
import type { PermissionName } from "@/constants/permissions";
import { ACT, type ActionName } from "@/constants/actions";

/** Props de {@link PermissionRoute}. */
interface Props {
    children: ReactNode;
    /** Permission requise pour accéder à la route. */
    permission: PermissionName;
    /**
     * Action exigée sur la permission (`INSERT`, `SELECT`, `UPDATE`, …).
     *
     * Obligatoire : une route n'est jamais protégée par la seule présence de
     * la permission. Le bit est testé sur le masque accordé porté par la
     * session (`PermissionSummary.totalActionsAccordees`).
     */
    action: ActionName;
}

/**
 * Guard de route : vérifie une permission **et** une action sur cette
 * permission via `usePermissions().hasPermission(permission, action)`.
 *
 * La vérification s'appuie sur le masque d'actions accordé de l'utilisateur ;
 * `SUPER_ADMIN` court-circuite toutes les vérifications (voir `usePermissions`).
 *
 * Si la permission ou l'action manque, redirige vers `/admin` (dashboard).
 *
 * Utilisé pour : `MANAGE_USERS` (SELECT/INSERT/UPDATE), `MANAGE_DIRECTIONS`
 * (SELECT/INSERT), `MANAGE_PROJECTS` (SELECT/INSERT/UPDATE), `VIEW_REPORTS`
 * (SELECT), `MANAGE_ADMINS` (SELECT), `MANAGE_ROLES` (SELECT).
 */
export default function PermissionRoute({
    children,
    permission,
    action
}: Props) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission, ACT[action])) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
