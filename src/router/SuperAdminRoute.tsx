import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import useAuth from "@/hooks/useAuth";

interface Props {
    children: ReactNode;
}

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
