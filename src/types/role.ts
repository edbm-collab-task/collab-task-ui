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

export interface Role {
    id: number;
    name: string;
    codeRole: string;
    /** Permissions du rôle, exposées dans leur forme complète par l'API. */
    permissions: Permission[];
}

export interface RoleFormData {
    name: string;
    codeRole: string;
    /** L'API attend les noms de permissions, pas les objets. */
    permissions: string[];
}
