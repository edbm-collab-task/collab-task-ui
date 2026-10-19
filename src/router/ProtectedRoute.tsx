import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import useAuth from "@/hooks/useAuth";
import AdminLayoutSkeleton from "@/components/admin/skeleton/AdminLayoutSkeleton";
import { requestSessionResync } from "@/services/auth/sessionSync";


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

    const location = useLocation();

    const mounted = useRef(false);


    /**
     * Resynchronise les droits à chaque changement de route (throttlé 30 s
     * par sessionSync). Le premier montage est ignoré : refreshUser() vient
     * déjà de charger la session au montage d'AuthProvider.
     */
    useEffect(() => {

        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        requestSessionResync("navigation");

    }, [location.pathname]);


    if (loading) {

        return <LoadingScreen />;

    }


    if (!user) {

        return <Navigate to="/login" replace />;

    }


    return children;

}