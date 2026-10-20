import { ACTION_LABELS, maskToActions } from "@/constants/actions";
import {
    FALLBACK_PERMISSION_CATEGORY
} from "@/constants/permissionCategoryLabels";
import type { PermissionCategory } from "@/constants/permissionCategoryLabels";
import { getPermissionLabel } from "@/constants/permissions";
import type { Permission, PermissionWithActionMask } from "@/types/role";

/**
 * Clé de regroupement d'une permission.
 *
 * Centralisée ici car la clé sert à la fois au groupement et à l'état
 * d'ouverture des accordéons : deux implémentations divergentes du `??`
 * produiraient des catégories qui ne s'ouvrent jamais. Les permissions sans
 * catégorie (base non migrée) retombent dans « Autres ».
 */
export const getPermissionCategoryKey = (perm: Permission): PermissionCategory =>
    perm.categoryPermission ?? FALLBACK_PERMISSION_CATEGORY;

/**
 * Regroupe des permissions par catégorie, en conservant l'ordre d'apparition.
 *
 * L'API renvoie déjà la liste triée par catégorie puis par nom, l'ordre des
 * groupes est donc celui du premier élément de chaque catégorie. La catégorie
 * de repli « Autres » est reléguée en fin de liste pour ne pas parasiter
 * l'affichage des catégories métier.
 */
export const groupPermissionsByCategory = <T extends Permission>(
    allPermissions: T[]
): [PermissionCategory, T[]][] => {
    const groups = new Map<PermissionCategory, T[]>();

    for (const perm of allPermissions) {
        const key = getPermissionCategoryKey(perm);
        const bucket = groups.get(key);
        if (bucket) {
            bucket.push(perm);
        } else {
            groups.set(key, [perm]);
        }
    }

    return Array.from(groups.entries()).sort(
        ([a], [b]) =>
            Number(a === FALLBACK_PERMISSION_CATEGORY) -
            Number(b === FALLBACK_PERMISSION_CATEGORY)
    );
};

/**
 * Catégories contenant au moins une permission sélectionnée.
 *
 * Ce sont les seules catégories à dérouler à l'ouverture du formulaire en
 * édition ou après sélection d'un modèle, pour qu'une permission cochée ne
 * reste pas cachée derrière un accordéon replié.
 */
export const getCategoriesWithSelection = (
    groups: [PermissionCategory, Permission[]][],
    selectedPermissions: string[]
): PermissionCategory[] =>
    groups
        .filter(([, perms]) =>
            perms.some(perm => selectedPermissions.includes(perm.name))
        )
        .map(([category]) => category);

/**
 * Catégories à déplier par défaut : celles qui portent au moins une permission
 * cochée. Si aucune ne l'est, seule la première catégorie est dépliée.
 *
 * Sert à l'état initial (montage, choix d'un modèle) : l'utilisateur reste
 * ensuite libre de replier/déplier manuellement.
 */
export const getDefaultOpenCategories = (
    groups: [PermissionCategory, Permission[]][],
    selectedPermissions: string[]
): PermissionCategory[] => {
    const withSelection = getCategoriesWithSelection(groups, selectedPermissions);
    if (withSelection.length > 0) return withSelection;

    return groups.length > 0 ? [groups[0][0]] : [];
};

/**
 * Résultat d'une recherche de permissions : la permission retenue, sa
 * catégorie (pour l'affichage en liste plate) et les actions dont le libellé
 * correspond à la requête (mises en évidence dans le résultat).
 */
export interface PermissionSearchResult<T extends Permission> {
    perm: T;
    category: PermissionCategory;
    matchedActions: string[];
}

/**
 * Filtre les permissions selon une requête libre, en cherchant dans le libellé
 * et le nom technique de la permission, sa description, et les libellés de ses
 * actions.
 *
 * Une permission est retenue dès qu'un de ces champs contient la requête (sans
 * tenir compte de la casse). Les actions correspondantes sont collectées dans
 * `matchedActions` : elles servent à surligner, dans la liste plate, les
 * actions qui ont motivé le résultat.
 *
 * Une requête vide renvoie un tableau vide : l'appelant conserve alors
 * l'affichage groupé par catégorie.
 */
export const filterPermissionsByQuery = <T extends PermissionWithActionMask>(
    allPermissions: T[],
    query: string
): PermissionSearchResult<T>[] => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const results: PermissionSearchResult<T>[] = [];

    for (const perm of allPermissions) {
        const actions = maskToActions(perm.totalActions);
        const matchedActions = actions.filter((action) => {
            const label = ACTION_LABELS[action] ?? action;
            return (
                label.toLowerCase().includes(needle) ||
                action.toLowerCase().includes(needle)
            );
        });

        const matches =
            getPermissionLabel(perm.name).toLowerCase().includes(needle) ||
            perm.name.toLowerCase().includes(needle) ||
            (perm.description ?? "").toLowerCase().includes(needle) ||
            matchedActions.length > 0;

        if (matches) {
            results.push({
                perm,
                category: getPermissionCategoryKey(perm),
                matchedActions,
            });
        }
    }

    return results;
};
