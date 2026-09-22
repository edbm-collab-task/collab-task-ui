import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import usePermissions from "@/hooks/usePermissions";

interface Props {
    children: ReactNode;
    permission: string;
}

/**
 * Guard de route : vérifie une permission spécifique via usePermissions.
 * - SUPER_ADMIN bypass toutes les permissions (voir usePermissions).
 * - Si permission manquante : redirige vers /admin (dashboard).
 * Utilisé pour : VIEW_USERS, MANAGE_USERS, MANAGE_DIRECTIONS, MANAGE_PROJECTS, VIEW_REPORTS.
 */
export default function PermissionRoute({ children, permission }: Props) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
