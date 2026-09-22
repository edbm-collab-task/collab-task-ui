import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import useAuth from "@/hooks/useAuth";

interface Props {
    children: ReactNode;
}

/**
 * Guard strict : n'autorise que les utilisateurs avec role === "SUPER_ADMIN".
 * Différent de PermissionRoute : ne vérifie pas les permissions mais le rôle brut.
 * Utilisé pour : /admin/dashboard-admin, /admin/admins, /admin/roles.
 * Affiche un spinner pendant le loading (vérification session).
 */
export default function SuperAdminRoute({ children }: Props) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!user || user.role !== "SUPER_ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
