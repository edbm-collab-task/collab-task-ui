import { Navigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import usePermissions from "@/hooks/usePermissions";
import useAuth from "@/hooks/useAuth";

interface Props {
    children: ReactNode;
    permission: string;
}

/**
 * Guard hybride : autorise si l'utilisateur est le propriétaire de la ressource (id dans l'URL)
 * OU s'il a la permission requise.
 * Utilisé pour /admin/users/:id/edit — un user peut éditer son propre profil,
 * un admin avec MANAGE_USERS peut éditer n'importe qui.
 * Redirige vers /admin si ni l'un ni l'autre.
 */
export default function SelfOrPermissionRoute({ children, permission }: Props) {
    const { hasPermission } = usePermissions();
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();

    if (user?.userId === Number(id) || hasPermission(permission)) {
        return <>{children}</>;
    }

    return <Navigate to="/admin" replace />;
}