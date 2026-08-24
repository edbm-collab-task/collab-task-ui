import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import usePermissions from "@/hooks/usePermissions";

interface Props {
    children: ReactNode;
    permission: string;
}

export default function PermissionRoute({ children, permission }: Props) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
