import { LayoutDashboard, Users, Building2, FolderKanban, MessageCircle, Bell, Shield, Settings, BarChart2 } from "lucide-react";
import type { PermissionName } from "@/constants/permissions";
import { PERM } from "@/constants/permissions";
import type { ActionName } from "@/constants/actions";

/**
 * Élément de navigation de la barre latérale.
 *
 * La visibilité est pilotée par un couple **permission + action** : `AdminMenu`
 * n'affiche l'élément que si l'utilisateur possède `permission` **et** le bit
 * `action` sur son masque accordé (`usePermissions().hasPermission`).
 *
 * - `permission` et `action` vont de pair : dès qu'une permission est déclarée,
 *   l'action l'est aussi (l'entrée ouvre une page, donc `SELECT`).
 * - Une entrée sans `permission` est toujours visible (fonction personnelle).
 *
 * `action` porte le **nom** de l'action (et non son code binaire) : ce module
 * est évalué au chargement, avant l'hydratation du catalogue `ACT` depuis
 * l'API. `AdminMenu` résout le nom en code au moment du filtrage.
 */
interface MenuItem {
    name: string;
    path: string;
    icon: typeof LayoutDashboard;
    /** Permission requise pour afficher l'élément (absente = toujours visible). */
    permission?: PermissionName;
    /**
     * Nom de l'action exigée sur {@link MenuItem.permission} (`SELECT`, …).
     * Requise dès qu'une permission est déclarée ; ignorée lorsqu'il n'y a
     * pas de permission.
     */
    action?: ActionName;
}

/**
 * Menu principal, visible selon les permissions de l'utilisateur.
 *
 * Une entrée sans `permission` (Dashboard, Message, Notifications) s'affiche
 * pour tout utilisateur connecté.
 */
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
        permission: PERM.MANAGE_PROJECTS,
        action: "SELECT",
    },
    {
        name: "Utilisateurs",
        path: "/admin/users",
        icon: Users,
        permission: PERM.MANAGE_USERS,
        action: "SELECT",
    },
    {
        name: "Directions",
        path: "/admin/directions",
        icon: Building2,
        permission: PERM.MANAGE_DIRECTIONS,
        action: "SELECT",
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


/**
 * Menu d'administration, filtré par **permission + action** (plus par rôle).
 *
 * Le `SUPER_ADMIN` y accède via le bypass de `usePermissions` ; tout rôle doté
 * de la permission et de l'action correspondantes le voit aussi. Doit rester
 * synchrone avec les guards de `router/index.tsx`.
 */
export const superAdminMenus: MenuItem[] = [
    {
        name: "Dashboard Admin",
        path: "/admin/dashboard-admin",
        icon: BarChart2,
        permission: PERM.VIEW_REPORTS,
        action: "SELECT",
    },
    {
        name: "Administrateurs",
        path: "/admin/admins",
        icon: Shield,
        permission: PERM.MANAGE_ADMINS,
        action: "SELECT",
    },
    {
        name: "Rôles & Permissions",
        path: "/admin/roles",
        icon: Settings,
        permission: PERM.MANAGE_ROLES,
        action: "SELECT",
    },
];
