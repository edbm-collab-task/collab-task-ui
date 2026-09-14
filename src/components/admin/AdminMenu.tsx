import { NavLink } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";
import {menus, superAdminMenus} from "./AdminNavigation.config.ts"


export default function AdminMenu() {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    const visibleMenus = menus.filter(m => {
        if (m.path === "/admin/users" && isSuperAdmin) return false;
        return !m.permission || hasPermission(m.permission);
    });

    return (
        <nav className="mt-4 px-4">
            {visibleMenus.map((menu) => {
                const Icon = menu.icon;

                return (
                    <NavLink key={menu.path} to={menu.path} end={menu.path === "/admin"}>
                        {({ isActive }) => (
                            <div
                                className={`group relative mb-3 flex items-center gap-4 overflow-hidden rounded-xl px-5 py-4 transition-all duration-300
                                    ${
                                        isActive
                                            ? "bg-accent text-white shadow-lg"
                                            : "text-white/90 hover:bg-accent/80 hover:text-white"
                                    }
                                `}
                            >
                                <Icon
                                    size={22}
                                    className={`
                                        transition-all duration-300
                                        ${
                                            isActive
                                                ? "text-secondary scale-110"
                                                : "group-hover:text-secondary group-hover:scale-110"
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
                    <div className="my-4 border-t border-secondary" />
                    <p className="mb-2 px-5 font-semibold uppercase tracking-wider text-white">
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
                                                    ? "bg-accent text-white shadow-lg"
                                                    : "text-white hover:bg-accent/80 hover:text-secondary"
                                            }
                                        `}
                                    >
                                        <Icon
                                            size={22}
                                            className={`
                                                transition-all duration-300
                                                ${
                                                    isActive
                                                        ? "text-white scale-110"
                                                        : "group-hover:text-secondary group-hover:scale-110"
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
