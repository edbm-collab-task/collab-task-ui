import { LayoutDashboard, Users, Building2, FolderKanban, MessageCircle, Bell, Shield, Settings, BarChart2 } from "lucide-react";


interface MenuItem {
    name: string;
    path: string;
    icon: typeof LayoutDashboard;
    permission?: string;
}

// Menu for all users
export const menus: MenuItem[] = [
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


export const superAdminMenus: MenuItem[] = [
    {
        name: "Dashboard Admin",
        path: "/admin/dashboard-admin",
        icon: BarChart2,
    },
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