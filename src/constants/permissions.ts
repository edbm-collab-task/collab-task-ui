/**
 * Noms des permissions exposées par l'API (`PermissionResDto.name`).
 *
 * La liste provient de `GET /roles/permissions/actions` : toute permission
 * ajoutée côté backend doit être reportée ici pour rester typable. Utiliser
 * ces constantes plutôt que des chaînes littérales évite les fautes de frappe
 * qui passaient jusque-là inaperçues (redirection silencieuse des guards).
 */
export const PERM = {
    /** Envoyer et gérer les messages. */
    MANAGE_MESSAGES: "MANAGE_MESSAGES",
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
