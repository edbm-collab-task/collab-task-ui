import type {
    PermissionWithActionMask,
    Role,
    RoleActionsMap,
    RoleFormData
} from "@/types/role";

/**
 * Vue minimale d'un rôle, utilisée pour alimenter le sélecteur de modèle
 * ({@link RoleSummary} ne porte que ce qu'il faut pour afficher une option :
 * l'identifiant et le nom).
 */
export interface RoleSummary {
    id: number;
    name: string;
}

/**
 * Props du formulaire de rôle {@link RoleForm}.
 *
 * Le formulaire gère son propre état interne ; le parent ne fournit que les
 * données de référence (permissions, modèles disponibles, codes pris) et
 * les callbacks de cycle de vie.
 */
export interface RoleFormProps {
    /**
     * Rôle à modifier, ou `null` pour une création. En création uniquement,
     * le sélecteur de modèle est affiché.
     */
    editingRole: Role | null;
    /** Catalogue complet des permissions (avec leurs actions), regroupées par catégorie à l'affichage. */
    allPermissions: PermissionWithActionMask[];
    /**
     * Actions de chaque rôle (masques `totalActions` / `totalActionsAccordees`),
     * servant au pré-remplissage en édition et via le sélecteur de modèle.
     */
    actionsMap: RoleActionsMap;
    /** Rôles existants proposés comme modèle de création (hors SUPER_ADMIN). */
    sourceRoles: RoleSummary[];
    /** Codes de rôle indisponibles (API + codes système réservés). */
    takenCodes: string[];
    /** Soumission du formulaire, en création comme en modification. */
    onSubmit: (data: RoleFormData) => Promise<void>;
    /** Fermeture du formulaire sans enregistrement. */
    onCancel: () => void;
}
