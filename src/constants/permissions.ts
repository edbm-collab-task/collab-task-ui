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
    /**
     * Consulter et exporter les rapports globaux de la plateforme
     * (tableau de bord super administrateur).
     */
    MANAGE_GLOBAL_REPORTS: "MANAGE_GLOBAL_REPORTS",
    /** Gérer les comptes administrateurs. */
    MANAGE_ADMINS: "MANAGE_ADMINS",
    /** Créer, modifier, supprimer des utilisateurs. */
    MANAGE_USERS: "MANAGE_USERS"
} as const;

/** Nom d'une permission (`PERM.MANAGE_PROJECTS`, `PERM.MANAGE_USERS`, …). */
export type PermissionName = (typeof PERM)[keyof typeof PERM];

/**
 * Source minimale pour résoudre le libellé d'une permission.
 *
 * Satisfaite par les objets renvoyés par l'API (`Permission`,
 * `PermissionWithActionMask`), qui portent toujours `name` et `description`.
 */
export interface PermissionLabelSource {
    /** Nom technique de la permission (`MANAGE_PROJECTS`). */
    name: string;
    /** Description de la permission, telle que renvoyée par l'API. */
    description?: string | null;
}

/**
 * Retourne le libellé d'une permission : **la description fournie par le
 * backend fait foi**.
 *
 * L'API expose pour chaque permission une `description` rédigée (« Consulter
 * et exporter les rapports globaux de la plateforme… », « Gérer les
 * directions », …) : c'est elle qui est affichée, de sorte que le libellé ne
 * peut pas diverger de celui du backend — notamment pour une permission
 * ajoutée côté API, qui n'a pas de libellé écrit à la main ici.
 *
 * Le nom technique (`MANAGE_PROJECTS`) ne sert que de repli, pour une
 * permission dépourvue de description.
 */
export function getPermissionLabel(
    perm: PermissionLabelSource | null | undefined
): string {
    if (!perm) return "—";
    return perm.description?.trim() || perm.name;
}
