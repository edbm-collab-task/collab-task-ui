import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";

import RoleTemplateSelect from "@/components/role/RoleTemplateSelect";
import { ROLE_CODE_MESSAGES } from "@/components/role/roleForm.constants";
import {
    filterPermissionsByQuery,
    getDefaultOpenCategories,
    groupPermissionsByCategory
} from "@/components/role/rolePermissions";
import type { RoleFormProps } from "@/components/role/roleForm.types";
import TableSearch from "@/components/table/TableSearch";
import { ACTION_LABELS, ACT, maskToActions } from "@/constants/actions";
import { getPermissionCategoryLabel } from "@/constants/permissionCategoryLabels";
import type { PermissionCategory } from "@/constants/permissionCategoryLabels";
import { getPermissionLabel, PERM } from "@/constants/permissions";
import Allow from "@/components/common/Allow";
import { RESERVED_ROLE_CODES } from "@/enum/role.enum";
import type { PermissionWithActionMask, RoleActionsMapEntry } from "@/types/role";
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
    actionsMap,
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
    /**
     * Actions cochées par permission. La clé est le nom de la permission, la
     * valeur la liste des actions accordées. Une permission sans action
     * sélectionnée est absente de la map.
     */
    const [selectedActions, setSelectedActions] = useState<Record<string, string[]>>({});
    /**
     * Permissions dont l'action « Voir » (`SELECT`) a été cochée
     * automatiquement parce qu'une autre action a été sélectionnée. Permet de
     * ne retirer ce `SELECT` que s'il n'a pas été choisi manuellement.
     */
    const [autoView, setAutoView] = useState<Set<string>>(() => new Set());
    /** Identifiant du rôle modèle choisi, ou `null` pour une création vierge. */
    const [templateRoleId, setTemplateRoleId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    /**
     * Catégories dépliées. Synchronisées à chaque montage plutôt que dérivées
     * de `selectedPermissions` : sinon un repli manuel serait annulé dès la
     * prochaine permission cochée/décochée.
     */
    const [openCategories, setOpenCategories] = useState<PermissionCategory[]>([]);
    /**
     * Requête de recherche des permissions. Vide : affichage groupé par
     * catégorie ; non vide : liste plate des permissions correspondantes.
     */
    const [permSearch, setPermSearch] = useState("");

    const ownCode = normalizeRoleCode(editingRole?.codeRole ?? "");

    /**
     * Permissions regroupées par catégorie pour l'affichage du formulaire.
     */
    const permissionsByCategory = useMemo(
        () => groupPermissionsByCategory(allPermissions),
        [allPermissions]
    );

    /**
     * Permissions correspondant à la recherche courante (vide si aucune
     * requête). Chaque résultat porte sa catégorie et les actions ayant
     * motivé le match.
     */
    const permissionSearchResults = useMemo(
        () => filterPermissionsByQuery(allPermissions, permSearch),
        [allPermissions, permSearch]
    );

    const isSearching = permSearch.trim() !== "";

    /**
     * Convertit les actions accordées d'un rôle (masques `totalActionsAccordees`)
     * en la map `permission → actions` attendue par les cases à cocher. Les
     * permissions sans action accordée sont omises, comme après une saisie.
     */
    const toSelectedActions = (
        entry: RoleActionsMapEntry | undefined
    ): Record<string, string[]> => {
        const result: Record<string, string[]> = {};
        if (!entry) return result;

        for (const [name, grants] of Object.entries(entry.permissions)) {
            const actions = maskToActions(grants.totalActionsAccordees);
            if (actions.length > 0) result[name] = actions;
        }
        return result;
    };

    /**
     * À partir des permissions d'un rôle et des masques d'actions accordées,
     * résout l'ensemble des permissions à cocher et les actions associées.
     *
     * Les permissions dont le masque accordé vaut `0` sont écartées (une
     * permission cochée sans aucune action n'a pas de sens). Celles absentes de
     * la map (permission non exposée par `GET /roles/actions-map`) sont
     * conservées, pour ne pas les détacher silencieusement du rôle.
     */
    const resolveRoleSelection = (
        entry: RoleActionsMapEntry | undefined,
        permissionNames: string[]
    ): { kept: string[]; actions: Record<string, string[]> } => {
        const kept = permissionNames.filter((name) => {
            const grants = entry?.permissions[name];
            return grants === undefined || grants.totalActionsAccordees > 0;
        });

        const allActions = toSelectedActions(entry);
        const actions: Record<string, string[]> = {};
        for (const name of kept) {
            if (allActions[name]) actions[name] = allActions[name];
        }

        return { kept, actions };
    };

    /**
     * Applique les permissions et actions d'un rôle au formulaire. Les
     * permissions proviennent du rôle lui-même (`editingRole.permissions` ou
     * permissions du modèle) et non des clés de `actionsMap`, qui diverge.
     * Sans entrée (rôle introuvable), l'état courant est conservé.
     */
    const applyRoleGrants = (
        entry: RoleActionsMapEntry | undefined,
        permissionNames: string[]
    ) => {
        if (permissionNames.length === 0 && !entry) return;
        const { kept, actions } = resolveRoleSelection(entry, permissionNames);
        setSelectedPermissions(kept);
        setSelectedActions(actions);
        setAutoView(new Set());
    };

    /**
     * Déploiement initial des catégories : celles qui portent une permission
     * cochée, ou la première catégorie si aucune ne l'est. Les dépendances sont
     * volontairement omises : l'effet ne doit s'exécuter qu'au montage, pas à
     * chaque permission cochée/décochée (ce qui écraserait les replis manuels).
     */
    useEffect(() => {
        setOpenCategories(
            getDefaultOpenCategories(permissionsByCategory, selectedPermissions)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * En édition, pré-remplit les permissions et actions déjà accordées au rôle
     * depuis `actionsMap` (masques). Les dépendances sont volontairement omises :
     * l'identifiant du rôle édité ne change pas pendant la vie du formulaire.
     */
    useEffect(() => {
        if (editingRole === null) return;
        const entry = actionsMap[editingRole.id];
        const permissionNames = editingRole.permissions.map((p) => p.name);
        applyRoleGrants(entry, permissionNames);
        setOpenCategories(
            getDefaultOpenCategories(
                permissionsByCategory,
                resolveRoleSelection(entry, permissionNames).kept
            )
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
     * Sélection d'un rôle modèle : pré-remplit permissions et actions depuis
     * `actionsMap` (masques). Le nom et le code restent à saisir (voir
     * {@link RoleTemplateSelect}).
     */
    const handleTemplateChange = (id: number | null) => {
        setTemplateRoleId(id);

        if (id === null) {
            setSelectedPermissions([]);
            setSelectedActions({});
            setAutoView(new Set());
            setOpenCategories(getDefaultOpenCategories(permissionsByCategory, []));
            return;
        }

        const template = sourceRoles.find((r) => r.id === id);
        const entry = actionsMap[id];
        const permissionNames =
            template?.permissions ?? (entry ? Object.keys(entry.permissions) : []);
        const { kept } = resolveRoleSelection(entry, permissionNames);

        applyRoleGrants(entry, permissionNames);
        setOpenCategories(getDefaultOpenCategories(permissionsByCategory, kept));
    };

    /**
     * Coche / décoche la permission parente.
     *
     * Le parent agit comme un « tout cocher / tout décocher » de ses propres
     * actions : si toutes les actions de la permission sont déjà cochées, elles
     * sont toutes retirées (ainsi que la permission) ; sinon elles sont toutes
     * cochées (et la permission ajoutée). Portée limitée à cette permission.
     */
    const togglePermission = (perm: PermissionWithActionMask) => {
        const actions = maskToActions(perm.totalActions);
        const current = selectedActions[perm.name] ?? [];
        const allChecked =
            actions.length > 0 && actions.every((a) => current.includes(a));

        if (allChecked) {
            setSelectedActions((prev) => {
                const rest = { ...prev };
                delete rest[perm.name];
                return rest;
            });
            setSelectedPermissions((prev) => prev.filter((p) => p !== perm.name));
            setAutoView((prev) => {
                const next = new Set(prev);
                next.delete(perm.name);
                return next;
            });
            return;
        }

        setSelectedActions((prev) => ({ ...prev, [perm.name]: [...actions] }));
        setSelectedPermissions((prev) =>
            prev.includes(perm.name) ? prev : [...prev, perm.name]
        );
        setAutoView((prev) => {
            const next = new Set(prev);
            next.delete(perm.name);
            return next;
        });
    };

    /**
     * Coche / décoche une action pour une permission donnée.
     *
     * Règle « Voir » (`SELECT`) : toute autre action implique le droit de voir.
     * - cocher une action non-`SELECT` ajoute automatiquement `SELECT` (marqué
     *   comme auto-ajouté) ;
     * - décocher `SELECT` déclenche une cascade : toutes les actions de la
     *   permission sont retirées ;
     * - retirer la dernière action non-`SELECT` retire le `SELECT` uniquement
     *   s'il avait été auto-ajouté (un `SELECT` choisi manuellement est
     *   conservé).
     *
     * La permission et ses actions restent synchronisées : elle est retirée
     * dès qu'elle ne porte plus aucune action.
     */
    const toggleAction = (perm: PermissionWithActionMask, action: string) => {
        const available = maskToActions(perm.totalActions);
        const hasView = available.includes("SELECT");
        const current = selectedActions[perm.name] ?? [];

        const removePermission = () => {
            setSelectedActions((prev) => {
                const rest = { ...prev };
                delete rest[perm.name];
                return rest;
            });
            setSelectedPermissions((prev) => prev.filter((p) => p !== perm.name));
        };

        const clearAutoView = () => {
            setAutoView((prev) => {
                if (!prev.has(perm.name)) return prev;
                const next = new Set(prev);
                next.delete(perm.name);
                return next;
            });
        };

        // Cas du « Voir » lui-même
        if (action === "SELECT") {
            if (current.includes("SELECT")) {
                // Décocher Voir : cascade, on retire toutes les actions.
                removePermission();
                clearAutoView();
                return;
            }

            // Cocher Voir manuellement : ce choix ne sera plus auto-retiré.
            setSelectedActions((prev) => ({ ...prev, [perm.name]: [...current, "SELECT"] }));
            setSelectedPermissions((prev) =>
                prev.includes(perm.name) ? prev : [...prev, perm.name]
            );
            clearAutoView();
            return;
        }

        // Décocher une autre action
        if (current.includes(action)) {
            let next = current.filter((a) => a !== action);
            const noOtherAction = next.every((a) => a === "SELECT");
            const isAuto = autoView.has(perm.name);

            if (noOtherAction && isAuto) {
                next = next.filter((a) => a !== "SELECT");
            }

            setSelectedActions((prev) => {
                if (next.length === 0) {
                    const rest = { ...prev };
                    delete rest[perm.name];
                    return rest;
                }
                return { ...prev, [perm.name]: next };
            });
            setSelectedPermissions((prev) => {
                if (next.length === 0) return prev.filter((p) => p !== perm.name);
                return prev.includes(perm.name) ? prev : [...prev, perm.name];
            });
            if (noOtherAction && isAuto) clearAutoView();
            return;
        }

        // Cocher une autre action
        const autoAddView = hasView && !current.includes("SELECT");
        const next = autoAddView ? [...current, action, "SELECT"] : [...current, action];

        setSelectedActions((prev) => ({ ...prev, [perm.name]: next }));
        setSelectedPermissions((prev) =>
            prev.includes(perm.name) ? prev : [...prev, perm.name]
        );

        if (autoAddView) {
            setAutoView((prev) => new Set(prev).add(perm.name));
        }
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
            /**
             * Seules les actions des permissions effectivement accordées sont
             * transmises : une action cochée sous une permission décochée n'a
             * pas de sens pour le rôle.
             */
            const actionsForSelection = Object.fromEntries(
                Object.entries(selectedActions).filter(([permName]) =>
                    selectedPermissions.includes(permName)
                )
            );

            await onSubmit({
                name: roleName,
                codeRole: normalizeRoleCode(codeRole),
                permissions: selectedPermissions,
                actions: actionsForSelection,
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
                />
            )}

            {/* Permissions */}
            <div className="mb-4">
                <label className="mb-2 block font-medium">
                    Permissions
                </label>

                {/* SearcBar */}
                <div className="mb-3 flex items-center gap-2">
                    <TableSearch value={permSearch} onChange={setPermSearch} />
                    {isSearching && (
                        <button
                            type="button"
                            onClick={() => setPermSearch("")}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                            <X size={14} />
                            Réinitialiser
                        </button>
                    )}
                </div>

                {isSearching ? (
                    <div className="m-2 grid grid-cols-1 gap-2">
                        {permissionSearchResults.length === 0 && (
                            <p className="py-4 text-sm text-gray-500">
                                Aucune permission ne correspond à « {permSearch.trim()} ».
                            </p>
                        )}
                        {permissionSearchResults.map(({ perm, category, matchedActions }) => {
                            const isChecked = selectedPermissions.includes(perm.name);
                            const selectedForPerm = selectedActions[perm.name] ?? [];
                            const availableActions = maskToActions(perm.totalActions);

                            return (
                                <div
                                    key={perm.id}
                                    className={`rounded-lg p-3 transition-all ${
                                        isChecked ? "bg-accent/10" : ""
                                    }`}
                                >
                                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                                        {getPermissionCategoryLabel(category)}
                                    </p>
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => togglePermission(perm)}
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
                                            <p className="text-sm font-medium text-gray-700">{getPermissionLabel(perm)}</p>
                                        </div>
                                    </label>

                                    {availableActions.length > 0 && (
                                        <div className="mt-2 grid grid-flow-col grid-rows-3 gap-1.5 pl-8 max-sm:grid-flow-row max-sm:grid-rows-none max-sm:grid-cols-2">
                                            {availableActions.map((action) => {
                                                const isActionChecked = selectedForPerm.includes(action);
                                                const isMatched = matchedActions.includes(action);

                                                return (
                                                    <label
                                                        key={action}
                                                        className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary/40 ${
                                                            isMatched ? "bg-secondary/30" : ""
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isActionChecked}
                                                            onChange={() => toggleAction(perm, action)}
                                                            className="hidden"
                                                        />
                                                        <span
                                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                                                isActionChecked ? "bg-primary" : "border-gray-300"
                                                            }`}
                                                        >
                                                            {isActionChecked && (
                                                                <Check size={10} className="text-white" />
                                                            )}
                                                        </span>
                                                        <span className="text-gray-600">{ACTION_LABELS[action]}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    permissionsByCategory.map(([category, perms]) => {
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

                            {/* Category permission */}
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
                                    className="grid grid-cols-3 max-md:grid-cols-1 gap-2"
                                >
                                    {perms.map((perm: PermissionWithActionMask) => {
                                        const isChecked = selectedPermissions.includes(perm.name);
                                        const selectedForPerm = selectedActions[perm.name] ?? [];
                                        const availableActions = maskToActions(perm.totalActions);

                                        return (
                                            <div
                                                key={perm.id}
                                                className={`rounded-lg p-3 transition-all${
                                                    isChecked ? "bg-accent/10" : ""
                                                }`}
                                            >
                                                <label className="flex cursor-pointer items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => togglePermission(perm)}
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
                                                        <p className="text-sm font-medium text-gray-700">{getPermissionLabel(perm)}</p>
                                                    </div>
                                                </label>

                                                {/*
                                                    Actions offertes par la permission : 3 lignes
                                                    et autant de colonnes que nécessaire (flux par
                                                    colonne). Sous le breakpoint `sm`, bascule sur
                                                    2 colonnes et autant de lignes que nécessaire.
                                                */}
                                                <div className="mt-2 grid gap-1.5 pl-8 max-sm:grid-flow-row max-sm:grid-rows-none max-sm:grid-cols-2">
                                                    {availableActions.map((action) => {
                                                        const isActionChecked = selectedForPerm.includes(action);

                                                        return (
                                                            <label
                                                                key={action}
                                                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary/40"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isActionChecked}
                                                                    onChange={() => toggleAction(perm, action)}
                                                                    className="hidden"
                                                                />
                                                                <span
                                                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                                                        isActionChecked ? "bg-primary" : "border-gray-300"
                                                                    }`}
                                                                >
                                                                    {isActionChecked && (
                                                                        <Check size={10} className="text-white" />
                                                                    )}
                                                                </span>
                                                                <span className="text-gray-600">{ACTION_LABELS[action]}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })
                )}
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-secondary hover:text-white"
                >
                    Annuler
                </button>
                <Allow perm={PERM.MANAGE_ROLES} action={isEditing ? ACT.UPDATE : ACT.INSERT}>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isEditing ? "Mettre à jour" : "Créer"}
                    </button>
                </Allow>
            </div>
        </div>
    );
}
