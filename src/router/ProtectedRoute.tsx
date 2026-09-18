import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import AdminLayoutSkeleton from "@/components/admin/skeleton/AdminLayoutSkeleton";


interface Props {
    children: React.ReactNode;
}


/**
 * Écran de chargement affiché pendant la vérification de la session (refreshUser).
 * Utilise le squelette de l'admin layout pour éviter un flash de contenu.
 */
function LoadingScreen() {

    return (
        <AdminLayoutSkeleton />
    );

}


/**
 * Guard de route : protège les routes nécessitant une authentification.
 * - Si loading (vérification session en cours) : affiche le skeleton
 * - Si pas d'utilisateur : redirige vers /login (replace = pas d'historique)
 * - Sinon : rend les enfants (route accessible)
 */
export default function ProtectedRoute({ children }: Props) {

    const { user, loading } = useAuth();


    if (loading) {

        return <LoadingScreen />;

    }


    if (!user) {

        return <Navigate to="/login" replace />;

    }


    return children;

}