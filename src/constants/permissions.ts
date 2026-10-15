/**
 * Noms des permissions exposées par l'API (`PermissionResDto.name`).
 *
 * La liste provient de `GET /roles/permissions/actions` : toute permission
 * ajoutée côté backend doit être reportée ici pour rester typable. Utiliser
 * ces constantes plutôt que des chaînes littérales évite les fautes de frappe
 * qui passaient jusque-là inaperçues (redirection silencieuse des guards).
 */
export const PERM = {
    /** Gérer les statuts. */
    MANAGE_STATUSES: "MANAGE_STATUSES",
    /** Gérer les directions. */
    MANAGE_DIRECTIONS: "MANAGE_DIRECTIONS",
    /** Gérer les rôles et permissions. */
    MANAGE_ROLES: "MANAGE_ROLES",
    /** Ajouter et gérer les pièces jointes. */
    MANAGE_ATTACHMENTS: "MANAGE_ATTACHMENTS",
    /** Commenter et gérer les commentaires. */
    MANAGE_COMMENTS: "MANAGE_COMMENTS",
    /** Gérer les contributeurs d'un projet. */
    MANAGE_PROJECT_CONTRIBUTORS: "MANAGE_PROJECT_CONTRIBUTORS",
    /** Créer et gérer les projets. */
    MANAGE_PROJECTS: "MANAGE_PROJECTS",
    /** Créer et gérer les tâches. */
    MANAGE_TASKS: "MANAGE_TASKS",
    /** Voir les rapports et statistiques. */
    VIEW_REPORTS: "VIEW_REPORTS",
    /** Gérer les comptes administrateurs. */
    MANAGE_ADMINS: "MANAGE_ADMINS",
    /** Créer, modifier, supprimer des utilisateurs. */
    MANAGE_USERS: "MANAGE_USERS",
    /** Voir la liste des utilisateurs. */
    VIEW_USERS: "VIEW_USERS"
} as const;

/** Nom d'une permission (`PERM.MANAGE_PROJECTS`, `PERM.VIEW_USERS`, …). */
export type PermissionName = (typeof PERM)[keyof typeof PERM];

/**
 * Libellés lisibles des permissions, destinés à l'affichage.
 *
 * Plus courts que les descriptions renvoyées par l'API, ils remplacent le nom
 * technique (`MANAGE_PROJECTS`…) dans l'interface, où il restait opaque.
 */
export const PERMISSION_LABELS: Record<PermissionName, string> = {
    MANAGE_STATUSES: "Gérer les statuts",
    MANAGE_DIRECTIONS: "Gérer les directions",
    MANAGE_ROLES: "Gérer les rôles",
    MANAGE_ATTACHMENTS: "Gérer les pièces jointes",
    MANAGE_COMMENTS: "Gérer les commentaires",
    MANAGE_PROJECT_CONTRIBUTORS: "Gérer les contributeurs",
    MANAGE_PROJECTS: "Gérer les projets",
    MANAGE_TASKS: "Gérer les tâches",
    VIEW_REPORTS: "Voir les rapports",
    MANAGE_ADMINS: "Gérer les administrateurs",
    MANAGE_USERS: "Gérer les utilisateurs",
    VIEW_USERS: "Voir les utilisateurs"
};

/**
 * Retourne le libellé d'une permission, ou son nom technique en repli
 * (permission ajoutée côté backend et pas encore reportée ici).
 */
export function getPermissionLabel(name: string | null | undefined): string {
    if (!name) return "—";
    return PERMISSION_LABELS[name as PermissionName] ?? name;
}
