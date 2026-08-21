import useAuth from "@/hooks/useAuth";

export default function usePermissions() {
    const { user } = useAuth();

    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        return user.permissions?.includes(permission) ?? false;
    };

    const hasAnyPermission = (...permissions: string[]): boolean => {
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        return permissions.some(p => user.permissions?.includes(p));
    };

    return { hasPermission, hasAnyPermission, permissions: user?.permissions ?? [] };
}
