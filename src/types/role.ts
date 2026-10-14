import type { ActionName } from "@/constants/actions";
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
 * Actions d'une permission sous forme de masques binaires (voir
 * `@/constants/actions`).
 *
 * Forme **future** de l'objet `actions` renvoyé par l'API : chaque action
 * ayant un code binaire, les actions possibles et les actions accordées sont
 * transmises sous forme d'entiers plutôt que de listes de noms.
 */
export interface ActionGrants {
    /** Masque de toutes les actions possibles pour la permission (ex. `3`). */
    correspondant: number;
    /**
     * Masque des actions accordées. Absent lorsque l'appel n'est pas
     * contextualisé par un rôle (`GET /roles/permissions/actions`), présent
     * lorsqu'il l'est (`GET /roles/{id}/actions`).
     */
    accorde?: number;
}

/**
 * Permission accompagnée de ses actions sous forme de masques binaires.
 *
 * Forme **future** de la réponse `GET /roles/permissions/actions`, en
 * remplacement de {@link PermissionWithActions} dont `actions` est encore une
 * liste de noms tant que le backend n'est pas migré.
 */
export interface PermissionActions extends Permission {
    actions: ActionGrants;
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

/**
 * Action du catalogue backend (`ActionResDto`, `GET /roles/actions`).
 *
 * Chaque action porte son code binaire (`codeAction`), son nom technique
 * (`INSERT`, `SELECT`…) et un libellé lisible destiné à l'affichage.
 */
export interface Action {
    codeAction: number;
    name: ActionName;
    label: string;
}

/**
 * Permission enrichie du masque de ses actions possibles (`totalActions`).
 *
 * Renvoyée par `GET /roles/permissions/actions` (`PermissionActionsResDto`).
 * Le masque remplace la liste `actions` historique : les actions possibles se
 * déduisent via `maskToActions` (voir `@/constants/actions`).
 */
export interface PermissionWithActionMask extends Permission {
    /** Masque binaire des actions possibles pour la permission (ex. `3`). */
    totalActions: number;
}

/**
 * Actions d'une permission pour un rôle (`RolePermissionActionsResDto`).
 *
 * `totalActions` désigne les actions possibles, `totalActionsAccordees` les
 * actions effectivement accordées au rôle. Les deux sont des masques binaires.
 */
export interface RolePermissionActions {
    totalActions: number;
    totalActionsAccordees: number;
}

/**
 * Actions d'un rôle, regroupées par nom de permission (`RoleActionsResDto`).
 *
 * Renvoyé par `GET /roles/{id}/actions` et, pour tous les rôles à la fois, par
 * `GET /roles/actions-map`.
 */
export interface RoleActionsMapEntry {
    label: string;
    permissions: Record<string, RolePermissionActions>;
}

/**
 * Réponse de `GET /roles/actions-map` : les actions de chaque rôle, indexées
 * par identifiant de rôle.
 */
export type RoleActionsMap = Record<number, RoleActionsMapEntry>;
