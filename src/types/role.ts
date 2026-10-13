import type { PermissionCategory } from "@/constants/permissionCategoryLabels";

export interface AttacheRole {
    email: string;
    role: string;
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    /** Catégorie d'appartenance, servant au regroupement dans l'UI. */
    categoryPermission: PermissionCategory | null;
}

/**
 * Permission enrichie de ses actions disponibles.
 *
 * Renvoyée par `GET /roles/permissions/actions`. Chaque permission expose la
 * liste des actions qu'il est possible d'accorder (SELECT, INSERT, UPDATE…).
 */
export interface PermissionWithActions extends Permission {
    actions: string[];
}

/**
 * Actions attribuées à un rôle, regroupées par nom de permission.
 *
 * `permissions` associe un nom de permission (`MANAGE_USERS`…) à la liste des
 * actions accordées pour celle-ci.
 */
export interface RoleActions {
    label: string;
    permissions: Record<string, string[]>;
}

export interface Role {
    id: number;
    name: string;
    codeRole: string;
    /** Permissions du rôle, exposées dans leur forme complète par l'API. */
    permissions: Permission[];
}

/**
 * Corps attendu par la création / mise à jour d'un rôle (`RoleReqDto`).
 * L'API attend les noms de permissions, pas les objets, et n'accepte pas
 * d'actions : celles-ci passent par `PUT /roles/{id}/actions`.
 */
export interface RoleBody {
    name: string;
    codeRole: string;
    permissions: string[];
}

/**
 * Données produites par le formulaire de rôle.
 *
 * Étend {@link RoleBody} avec les actions sélectionnées, destinées à
 * l'endpoint dédié `PUT /roles/{id}/actions`.
 */
export interface RoleFormData extends RoleBody {
    /**
     * Actions sélectionnées par permission, telles qu'attendues par
     * `PUT /roles/{id}/actions`. Vide en l'absence d'action cochée.
     */
    actions: Record<string, string[]>;
}
