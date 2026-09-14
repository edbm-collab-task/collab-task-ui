import { Navigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import usePermissions from "@/hooks/usePermissions";
import useAuth from "@/hooks/useAuth";

interface Props {
    children: ReactNode;
    permission: string;
}

export default function SelfOrPermissionRoute({ children, permission }: Props) {
    const { hasPermission } = usePermissions();
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();

    if (user?.userId === Number(id) || hasPermission(permission)) {
        return <>{children}</>;
    }

    return <Navigate to="/admin" replace />;
}