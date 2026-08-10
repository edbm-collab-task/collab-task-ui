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