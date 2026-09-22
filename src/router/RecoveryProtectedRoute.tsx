import { Navigate } from "react-router-dom";
import useRecoveryAuth from "@/hooks/useRecoveryAuth";
import VerificationPageSkeleton from "@/components/admin/skeleton/VerificationSkeleton";

interface Props {
    children: React.ReactNode;
}

function LoadingScreen() {

    return (
        <VerificationPageSkeleton/>
    );

}

/**
 * Guard pour le flux "mot de passe oublié" (recovery).
 * Vérifie le token de récupération via RecoveryAuthProvider (appel /auth/recovery/me).
 * - Si loading : affiche le skeleton de vérification
 * - Si pas authentifié : redirige vers /forgot-password (NOTE: cette route n'existe pas,
 *   la route réelle est /reccuperation-comptes — possible bug)
 * - Sinon : rend les enfants (pages RecoveryPage, VerificationPage, SetPwd)
 */
export default function RecoveryProtectedRoute({ children }: Props) {

    const { authenticated, loading } = useRecoveryAuth();

    if (loading) {

        return <LoadingScreen />;

    }

    if (!authenticated) {

        return <Navigate to="/forgot-password" replace />;

    }

    return children;

}