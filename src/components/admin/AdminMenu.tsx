import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Building2, FolderKanban, MessageCircle, Bell, Shield, Settings } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";

interface MenuItem {
    name: string;
    path: string;
    icon: typeof LayoutDashboard;
    permission?: string;
}

const menus: MenuItem[] = [
    {
        name: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
    },
    {
        name: "Projets",
        path: "/admin/projects",
        icon: FolderKanban,
        permission: "MANAGE_PROJECTS",
    },
    {
        name: "Utilisateurs",
        path: "/admin/users",
        icon: Users,
        permission: "VIEW_USERS",
    },
    {
        name: "Directions",
        path: "/admin/directions",
        icon: Building2,
        permission: "MANAGE_DIRECTIONS",
    },
    {
        name: "Message",
        path: "/admin/messages",
        icon: MessageCircle
    },
    {
        name: "Notifications",
        path: "/admin/notifications",
        icon: Bell
    }
];

const superAdminMenus: MenuItem[] = [
    {
        name: "Administrateurs",
        path: "/admin/admins",
        icon: Shield,
    },
    {
        name: "Rôles & Permissions",
        path: "/admin/roles",
        icon: Settings,
    },
];

export default function AdminMenu() {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    const visibleMenus = menus.filter(m => !m.permission || hasPermission(m.permission));

    return (
        <nav className="mt-8 px-4">
            {visibleMenus.map((menu) => {
                const Icon = menu.icon;

                return (
                    <NavLink key={menu.path} to={menu.path} end={menu.path === "/admin"}>
                        {({ isActive }) => (
                            <div
                                className={`group relative mb-3 flex items-center gap-4 overflow-hidden rounded-xl px-5 py-4 transition-all duration-300
                                    ${
                                        isActive
                                            ? "bg-slate-800 text-white shadow-lg"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }
                                `}
                            >
                                {isActive && (
                                    <span
                                        className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-orange-500 via-yellow-400 to-blue-500"
                                    />
                                )}

                                <Icon
                                    size={22}
                                    className={`
                                        transition-all duration-300
                                        ${
                                            isActive
                                                ? "text-orange-400 scale-110"
                                                : "group-hover:text-orange-300 group-hover:scale-110"
                                        }
                                    `}
                                />

                                <span className="font-medium tracking-wide">
                                    {menu.name}
                                </span>
                            </div>
                        )}
                    </NavLink>
                );
            })}

            {isSuperAdmin && (
                <>
                    <div className="my-4 border-t border-slate-700" />
                    <p className="mb-2 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Super Admin
                    </p>
                    {superAdminMenus.map((menu) => {
                        const Icon = menu.icon;

                        return (
                            <NavLink key={menu.path} to={menu.path}>
                                {({ isActive }) => (
                                    <div
                                        className={`group relative mb-3 flex items-center gap-4 overflow-hidden rounded-xl px-5 py-4 transition-all duration-300
                                            ${
                                                isActive
                                                    ? "bg-slate-800 text-white shadow-lg"
                                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                            }
                                        `}
                                    >
                                        {isActive && (
                                            <span
                                                className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-purple-500 via-pink-400 to-red-500"
                                            />
                                        )}

                                        <Icon
                                            size={22}
                                            className={`
                                                transition-all duration-300
                                                ${
                                                    isActive
                                                        ? "text-purple-400 scale-110"
                                                        : "group-hover:text-purple-300 group-hover:scale-110"
                                                }
                                            `}
                                        />

                                        <span className="font-medium tracking-wide">
                                            {menu.name}
                                        </span>
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </>
            )}
        </nav>
    );
}
