import { Navigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import useAuth from "@/hooks/useAuth";

/** Props de {@link SelfRoute}. */
interface Props {
    children: ReactNode;
}

/**
 * Guard de route strictement personnel : n'autorise l'accès qu'à
 * l'utilisateur concerné par l'identifiant de l'URL (`/admin/users/:id/edit`).
 *
 * Aucune permission ni action n'est consultée : un utilisateur peut toujours
 * modifier son propre profil, indépendamment de ses permissions, et personne
 * d'autre n'y accède — pas plus avec `MANAGE_USERS` (+ action) qu'en tant que
 * `SUPER_ADMIN`.
 *
 * Si `user.userId !== Number(id)`, redirige vers `/admin` (dashboard).
 */
export default function SelfRoute({ children }: Props) {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();

    if (user?.userId !== Number(id)) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
