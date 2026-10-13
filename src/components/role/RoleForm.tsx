import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import RoleTemplateSelect from "@/components/role/RoleTemplateSelect";
import { ROLE_CODE_MESSAGES } from "@/components/role/roleForm.constants";
import {
    getCategoriesWithSelection,
    groupPermissionsByCategory
} from "@/components/role/rolePermissions";
import type { RoleFormProps } from "@/components/role/roleForm.types";
import { getPermissionCategoryLabel } from "@/constants/permissionCategoryLabels";
import type { PermissionCategory } from "@/constants/permissionCategoryLabels";
import { RESERVED_ROLE_CODES } from "@/enum/role.enum";
import type { Permission } from "@/types/role";
import { roleService } from "@/services/role/role.service";
import {
    ROLE_CODE_PATTERN,
    generateRoleCode,
    isRoleCodeTaken,
    normalizeRoleCode
} from "@/utils/roleCode";

/**
 * Formulaire de création / modification d'un rôle.
 *
 * Composant étatique autonome : il porte la saisie du nom, du code, des
 * permissions et du modèle de création. Le parent ({@link RoleListPage}) se
 * limite à fournir les données de référence et à traiter la soumission via
 * `onSubmit`.
 *
 * En création, un sélecteur permet de partir d'un rôle existant :
 * seules les permissions sont alors pré-remplies, le nom et le code déjà
 * saisis (ou vides) sont laissés intacts.
 */
export default function RoleForm({
    editingRole,
    allPermissions,
    sourceRoles,
    takenCodes,
    onSubmit,
    onCancel,
}: RoleFormProps) {
    const isEditing = editingRole !== null;

    const [roleName, setRoleName] = useState(editingRole?.name ?? "");
    const [codeRole, setCodeRole] = useState(editingRole?.codeRole ?? "");
    /**
     * Passe à true dès que le code est saisi à la main : l'auto-remplissage
     * déclenché par le nom est alors figé jusqu'au clic sur « Régénérer ».
     */
    const [codeTouched, setCodeTouched] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        editingRole?.permissions.map((p) => p.name) ?? []
    );
    /** Identifiant du rôle modèle choisi, ou `null` pour une création vierge. */
    const [templateRoleId, setTemplateRoleId] = useState<number | null>(null);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [saving, setSaving] = useState(false);
    /**
     * Catégories dépliées. Synchronisées à chaque montage plutôt que dérivées
     * de `selectedPermissions` : sinon un repli manuel serait annulé dès la
     * prochaine permission cochée/décochée.
     */
    const [openCategories, setOpenCategories] = useState<PermissionCategory[]>([]);

    const ownCode = normalizeRoleCode(editingRole?.codeRole ?? "");

    /**
     * Permissions regroupées par catégorie pour l'affichage du formulaire.
     */
    const permissionsByCategory = useMemo(
        () => groupPermissionsByCategory(allPermissions),
        [allPermissions]
    );

    /**
     * Catégories contenant au moins une permission cochée, à déplier
     * automatiquement pour ne pas masquer une permission déjà attribuée.
     */
    const categoriesWithSelection = useMemo(
        () => getCategoriesWithSelection(permissionsByCategory, selectedPermissions),
        [permissionsByCategory, selectedPermissions]
    );

    /**
     * Déploiement initial des catégories : celles qui portent une sélection en
     * édition/modèle, toutes en création vierge. Les dépendances sont
     * volontairement omises : l'effet ne doit s'exécuter qu'au montage, pas à
     * chaque permission cochée/décochée (ce qui écraserait les replis manuels).
     */
    useEffect(() => {
        setOpenCategories(
            isEditing
                ? categoriesWithSelection
                : permissionsByCategory.map(([category]) => category)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Message d'erreur du champ code, ou null s'il est valide. `force` sert à
     * la soumission : sans lui, un code vide ne serait signalé qu'une fois
     * touché, et le formulaire pourrait partir avec un code manquant.
     */
    const validateCode = (force = false): string | null => {
        if (!codeRole) {
            return force || codeTouched ? ROLE_CODE_MESSAGES.required : null;
        }
        if (!ROLE_CODE_PATTERN.test(codeRole)) return ROLE_CODE_MESSAGES.format;
        if (codeRole === ownCode) return null;
        if (isRoleCodeTaken(codeRole, RESERVED_ROLE_CODES)) return ROLE_CODE_MESSAGES.reserved;
        if (isRoleCodeTaken(codeRole, takenCodes)) return ROLE_CODE_MESSAGES.duplicate;

        return null;
    };

    const codeError = validateCode();

    /**
     * Sélection d'un rôle modèle : charge ses permissions et les coche.
     * Le nom et le code ne sont jamais modifiés (voir {@link RoleTemplateSelect}).
     */
    const handleTemplateChange = async (id: number | null) => {
        setTemplateRoleId(id);

        if (id === null) {
            setSelectedPermissions([]);
            return;
        }

        try {
            setLoadingTemplate(true);
            const template = await roleService.getById(id);
            setSelectedPermissions(template.permissions.map((p) => p.name));
            setOpenCategories(
                getCategoriesWithSelection(
                    permissionsByCategory,
                    template.permissions.map((p) => p.name)
                )
            );
        } catch (error) {
            console.error("Erreur lors du chargement du rôle modèle :", error);
            toast.error("Erreur lors du chargement du rôle modèle");
        } finally {
            setLoadingTemplate(false);
        }
    };

    const togglePermission = (permName: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permName)
                ? prev.filter((p) => p !== permName)
                : [...prev, permName]
        );
    };

    /**
     * Ouvre ou replie une catégorie de permissions.
     * L'état est un tableau de clés plutôt qu'un objet boolean : le nombre de
     * catégories reste faible et figé côté API.
     */
    const toggleCategory = (category: PermissionCategory) => {
        setOpenCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleSave = async () => {
        if (!roleName.trim()) {
            toast.error("Le nom du rôle est requis");
            return;
        }

        const codeIssue = validateCode(true);
        if (codeIssue) {
            toast.error(codeIssue);
            return;
        }

        try {
            setSaving(true);
            await onSubmit({
                name: roleName,
                codeRole: normalizeRoleCode(codeRole),
                permissions: selectedPermissions,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
                {isEditing ? "Modifier le rôle" : "Créer un rôle"}
            </h3>

            <div className="sm:flex w-full gap-6">
                {/* Nom role */}
                <div className="mb-4 sm:w-full">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nom du rôle
                    </label>
                    <input
                        type="text"
                        value={roleName}
                        onChange={(e) => {
                            setRoleName(e.target.value);
                            if (!codeTouched) {
                                setCodeRole(generateRoleCode(e.target.value, takenCodes));
                            }
                        }}
                        disabled={isEditing}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-gray-100"
                        placeholder="Ex: MANAGER"
                    />
                </div>

                {/* Code role */}
                <div className="mb-4 sm:w-full">
                    <div className="mb-1 flex items-center justify-between gap-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Code du rôle
                        </label>
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCodeRole(generateRoleCode(roleName, takenCodes));
                                    setCodeTouched(false);
                                }}
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                                <RefreshCw size={14} />
                                Régénérer
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        value={codeRole}
                        onChange={(e) => {
                            setCodeRole(normalizeRoleCode(e.target.value));
                            setCodeTouched(true);
                        }}
                        disabled={isEditing}
                        aria-invalid={codeError !== null}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none disabled:bg-gray-100 ${
                            codeError
                                ? "border-red-400 focus:border-red-500"
                                : "border-gray-300 focus:border-primary"
                        }`}
                        placeholder="Généré automatiquement depuis le nom du rôle"
                    />
                    {codeError && (
                        <p className="mt-1 text-sm font-medium text-red-500">
                            {codeError}
                        </p>
                    )}
                </div>
            </div>

            {/* Modèle de création : uniquement à la création d'un rôle */}
            {!isEditing && (
                <RoleTemplateSelect
                    roles={sourceRoles}
                    value={templateRoleId}
                    onChange={handleTemplateChange}
                    disabled={loadingTemplate}
                />
            )}

            {/* Permissions */}
            <div className="mb-4">
                <label className="mb-2 block font-medium">
                    Permissions
                </label>
                {permissionsByCategory.map(([category, perms]) => {
                    const label = getPermissionCategoryLabel(category);
                    const isOpen = openCategories.includes(category);
                    const panelId = `permissions-${category}`;
                    // Compteur affiché même catégorie repliée, sinon
                    // l'utilisateur ne voit pas qu'elle contient des
                    // permissions déjà attribuées au rôle.
                    const selectedCount = perms.filter((perm) =>
                        selectedPermissions.includes(perm.name)
                    ).length;

                    return (
                        <div key={category} className="m-2 mb-4 last:mb-0">
                            {/*
                                Pattern disclosure : le bouton porte
                                aria-expanded/aria-controls, le panneau porte
                                l'id référencé. `type="button"` évite la
                                soumission implicite du formulaire parent.
                            */}
                            <button
                                type="button"
                                onClick={() => toggleCategory(category)}
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                className="mb-2 flex w-full items-center gap-2 text-left"
                            >
                                <span className="flex items-center gap-2 text-xs uppercase tracking-wide">
                                    {label}
                                    <span className="rounded-full bg-primary/70 px-2 py-0.5 font-medium normal-case tracking-normal text-white">
                                        {selectedCount}/{perms.length}
                                    </span>
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`shrink-0 text-gray-400 transition-transform ${
                                        isOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {isOpen && (
                                <div
                                    id={panelId}
                                    role="group"
                                    aria-label={label}
                                    className="grid grid-cols-1 gap-2"
                                >
                                    {perms.map((perm: Permission) => {
                                        const isChecked = selectedPermissions.includes(perm.name);

                                        return (
                                            <label
                                                key={perm.id}
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                                                    isChecked
                                                        ? "border-0 bg-accent/10"
                                                        : "border-0 hover:border hover:border-accent"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => togglePermission(perm.name)}
                                                    className="hidden"
                                                />
                                                <div
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                                        isChecked ? "bg-primary" : "border-gray-300"
                                                    }`}
                                                >
                                                    {isChecked && <Check size={12} className="text-white" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">{perm.name}</p>
                                                    <p className="text-xs text-gray-500">{perm.description}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-secondary hover:text-white"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isEditing ? "Mettre à jour" : "Créer"}
                </button>
            </div>
        </div>
    );
}
