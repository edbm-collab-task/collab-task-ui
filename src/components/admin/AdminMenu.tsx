import { NavLink } from "react-router-dom";
import usePermissions from "@/hooks/usePermissions";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";
import { PERM } from "@/constants/permissions";
import { ACT } from "@/constants/actions";
import { menus, superAdminMenus } from "./AdminNavigation.config.ts"


interface Props {
    /** État replié de la barre latérale (icônes seules). */
    collapsed: boolean;
    /** Redéploie la barre latérale après un clic sur une entrée (mode replié). */
    expand: () => void;
}

/**
 * Menu latéral de l'espace d'administration.
 *
 * La visibilité des entrées est pilotée par **permission + action** (via
 * `usePermissions().hasPermission`) et non plus par le rôle brut : le
 * `SUPER_ADMIN` voit tout grâce au bypass de `usePermissions`, mais tout rôle
 * doté des permissions/actions correspondantes voit aussi les entrées
 * concernées. Une entrée sans permission (Dashboard, Message, Notifications)
 * reste visible pour tout utilisateur connecté.
 */
export default function AdminMenu({ collapsed, expand }: Props) {
    const { hasPermission } = usePermissions();
    const unreadMessages = useUnreadMessageCount();

    /**
     * Entrées principales visibles.
     *
     * « Utilisateurs » est masqué dès que l'utilisateur peut gérer les
     * administrateurs (`MANAGE_ADMINS` + `SELECT`) : la page `/admin/admins`,
     * plus large, est celle vers laquelle `UserListPage` le redirige déjà.
     */
    const visibleMenus = menus.filter((m) => {
        if (m.path === "/admin/users" && hasPermission(PERM.MANAGE_ADMINS, ACT.SELECT)) {
            return false;
        }
        return !m.permission || hasPermission(m.permission, m.action);
    });

    /**
     * Entrées d'administration visibles (permission + action). La section n'est
     * rendue que si au moins une entrée subsiste après filtrage.
     */
    const visibleSuperAdminMenus = superAdminMenus.filter((m) =>
        !m.permission || hasPermission(m.permission, m.action)
    );

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

                                {menu.path === "/admin/messages" && unreadMessages > 0 && (
                                    <span
                                        className={`absolute right-3 top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold shadow-sm ring-2 ${
                                            isActive
                                                ? "bg-white text-accent ring-primary/40"
                                                : "bg-accent text-white ring-primary"
                                        }`}
                                    >
                                        {unreadMessages > 9 ? "9+" : unreadMessages}
                                    </span>
                                )}
                            </div>
                        )}
                    </NavLink>
                );
            })}

            {visibleSuperAdminMenus.length > 0 && (
                <>
                    <div className={`my-4 border-t border-secondary transition-all duration-300 ${
                        collapsed ? "lg:mx-2 lg:group-hover/sb:mx-0" : ""
                    }`} />
                    {visibleSuperAdminMenus.map((menu) => {
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