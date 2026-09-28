/**
 * Catégories d'appartenance des permissions.
 * La clé = la valeur renvoyée par l'API dans `permission.categoryPermission`
 * (PermissionCategoryType côté back).
 */
export const PERMISSION_CATEGORY = {
    UTILISATEURS: "UTILISATEURS",
    PROJETS: "PROJETS",
    ORGANISATION: "ORGANISATION",
    RAPPORTS: "RAPPORTS",
    AUTRES: "AUTRES"
} as const;

export type PermissionCategory =
    (typeof PERMISSION_CATEGORY)[keyof typeof PERMISSION_CATEGORY];

/** Catégorie de repli pour une permission héritée d'une base non migrée. */
export const FALLBACK_PERMISSION_CATEGORY: PermissionCategory =
    PERMISSION_CATEGORY.AUTRES;

/** Libellés lisibles pour chaque catégorie de permission. */
export const PERMISSION_CATEGORY_LABELS: Record<PermissionCategory, string> = {
    [PERMISSION_CATEGORY.UTILISATEURS]: "Utilisateurs",
    [PERMISSION_CATEGORY.PROJETS]: "Projets",
    [PERMISSION_CATEGORY.ORGANISATION]: "Organisation",
    [PERMISSION_CATEGORY.RAPPORTS]: "Rapports",
    [PERMISSION_CATEGORY.AUTRES]: "Autres"
};

/**
 * Retourne le libellé de la catégorie, ou la clé brute en fallback
 * (catégorie inconnue ajoutée côté back).
 */
export function getPermissionCategoryLabel(
    category: string | null | undefined
): string {
    if (!category) return PERMISSION_CATEGORY_LABELS[FALLBACK_PERMISSION_CATEGORY];
    return (
        PERMISSION_CATEGORY_LABELS[category as PermissionCategory] ?? category
    );
}
