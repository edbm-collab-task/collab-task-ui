import { NavLink } from "react-router-dom";
import {LayoutDashboard,Users,Building2,FolderKanban,MessageCircle,Bell} from "lucide-react";

const menus = [
    {
        name: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
    },
    {
        name: "Projets",
        path: "/admin/projects",
        icon: FolderKanban,
    },
    {
        name: "Utilisateurs",
        path: "/admin/users",
        icon: Users,
    },
    {
        name: "Directions",
        path: "/admin/directions",
        icon: Building2
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

export default function AdminMenu() {
    return (
        <nav className="mt-8 px-4">
            {menus.map((menu) => {
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
        </nav>
    );
}