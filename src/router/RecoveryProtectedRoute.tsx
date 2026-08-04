import { Navigate } from "react-router-dom";
import useRecoveryAuth from "@/hooks/useRecoveryAuth";

interface Props {
    children: React.ReactNode;
}

function LoadingScreen() {

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-50">

            <div className="flex flex-col items-center gap-4">

                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>

                <p className="text-gray-600 text-sm">
                    Vérification...
                </p>

            </div>

        </div>

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