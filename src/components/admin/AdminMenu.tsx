import { NavLink } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";
import { menus, superAdminMenus } from "./AdminNavigation.config.ts"


interface Props {
    collapsed: boolean;
    expand: () => void;
}

export default function AdminMenu({ collapsed, expand }: Props) {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    const visibleMenus = menus.filter(m => {
        if (m.path === "/admin/users" && isSuperAdmin) return false;
        return !m.permission || hasPermission(m.permission);
    });

    return (
        <nav className={`mt-4 flex-1 overflow-y-auto transition-all duration-300 ${
            collapsed ? "px-2 lg:group-hover/sb:px-4" : "px-4"
        }`}>
            {visibleMenus.map((menu) => {
                const Icon = menu.icon;

                return (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        end={menu.path === "/admin"}
                        onClick={() => {
                            if (collapsed) expand();
                        }}
                        title={collapsed ? menu.name : undefined}
                    >
                        {({ isActive }) => (
                            <div
                                className={`group relative mb-3 flex items-center gap-4 overflow-hidden rounded-xl px-5 py-4 transition-all duration-300
                                    ${
                                        collapsed
                                            ? "lg:justify-center lg:gap-0 lg:px-0 lg:group-hover/sb:justify-start lg:group-hover/sb:gap-4 lg:group-hover/sb:px-5"
                                            : ""
                                    }
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

                                <span className={`whitespace-nowrap font-medium tracking-wide transition-all duration-300 ${
                                    collapsed
                                        ? "lg:max-w-0 lg:opacity-0 lg:group-hover/sb:max-w-48 lg:group-hover/sb:opacity-100"
                                        : "lg:max-w-48 lg:opacity-100"
                                }`}>
                                    {menu.name}
                                </span>
                            </div>
                        )}
                    </NavLink>
                );
            })}

            {isSuperAdmin && (
                <>
                    <div className={`my-4 border-t border-secondary transition-all duration-300 ${
                        collapsed ? "lg:mx-2 lg:group-hover/sb:mx-0" : ""
                    }`} />
                    {superAdminMenus.map((menu) => {
                        const Icon = menu.icon;

                        return (
                            <NavLink
                                key={menu.path}
                                to={menu.path}
                                onClick={() => {
                                    if (collapsed) expand();
                                }}
                                title={collapsed ? menu.name : undefined}
                            >
                                {({ isActive }) => (
                                    <div
                                        className={`group relative mb-3 flex items-center gap-4 overflow-hidden rounded-xl px-5 py-4 transition-all duration-300
                                            ${
                                                collapsed
                                                ? "lg:justify-center lg:gap-0 lg:px-0 lg:group-hover/sb:justify-start lg:group-hover/sb:gap-4 lg:group-hover/sb:px-5"
                                                    : ""
                                            }
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

                                        <span className={`whitespace-nowrap font-medium tracking-wide transition-all duration-300 ${
                                            collapsed
                                                 ? "lg:max-w-0 lg:opacity-0 lg:group-hover/sb:max-w-48 lg:group-hover/sb:opacity-100"
                                                : "lg:max-w-48 lg:opacity-100"
                                        }`}>
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