import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Check, ChevronDown, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";

import {
    FALLBACK_PERMISSION_CATEGORY,
    getPermissionCategoryLabel
} from "@/constants/permissionCategoryLabels";
import type { PermissionCategory } from "@/constants/permissionCategoryLabels";
import type { TableAction, HeaderAction } from "@/types/table";
import type { Role, Permission } from "@/types/role";
import { roleService } from "@/services/role/role.service";
import { RESERVED_ROLE_CODES } from "@/enum/role.enum";
import {
    ROLE_CODE_PATTERN,
    generateRoleCode,
    isRoleCodeTaken,
    normalizeRoleCode
} from "@/utils/roleCode";

const roleTr = {
    name: "Nom",
    codeRole: "Code rôle",
    permissions: "Permissions",
};

const codeRoleMessages = {
    required: "Le code du rôle est requis",
    format: "Le code ne peut contenir que des lettres, des chiffres et des tirets bas",
    reserved: "Ce code est réservé aux rôles système",
    duplicate: "Ce code de rôle existe déjà"
} as const;

interface RoleTable {
    id: number;
    name: string;
    codeRole: string;
    permissions: string;
}

export default function RoleListPage() {

    const [roles, setRoles] = useState<RoleTable[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [roleName, setRoleName] = useState("");
    const [codeRole, setCodeRole] = useState(""); // Nouveau : code du rôle
    /**
     * Codes de tous les rôles renvoyés par l'API, y compris ceux masqués au
     * tableau (SUPER_ADMIN). Ils servent de liste de codes pris : un rôle
     * filtré de l'affichage n'a pas moins de code à protéger.
     */
    const [allRoleCodes, setAllRoleCodes] = useState<{ id: number; codeRole: string }[]>([]);
    /**
     * Passe à true dès que le code est saisi à la main : l'auto-remplissage
     * déclenché par le nom est alors figé jusqu'au clic sur « Régénérer ».
     */
    const [codeTouched, setCodeTouched] = useState(false);
    /**
     * Catégories dépliées dans le formulaire. Volontairement synchronisé à
     * chaque ouverture du formulaire plutôt que dérivé de `selectedPermissions` :
     * sinon un repli manuel serait annulé dès la prochaine permission
     * cochée/décochée, ce qui est le pire irritant pour l'utilisateur.
     */
    const [openCategories, setOpenCategories] = useState<PermissionCategory[]>([]);
    const pageSize = 5;

    const loadData = async () => {
        try {
            setLoading(true);
            const [rolesData, permsData] = await Promise.all([
                roleService.getAll(),
                roleService.getAllPermissions()
            ]);

            const filtered = rolesData.filter(r => r.name !== "SUPER_ADMIN");
            const tableData: RoleTable[] = filtered.map(r => ({
                id: r.id,
                name: r.name,
                codeRole: r.codeRole || "—",
                permissions: r.permissions.length > 0
                    ? r.permissions.map(p => p.name).join(", ")
                    : "Aucune permission"
            }));

            setRoles(tableData);
            setAllPermissions(permsData);
            setAllRoleCodes(
                rolesData.map(r => ({ id: r.id, codeRole: r.codeRole ?? "" }))
            );
        } catch (error) {
            console.error("Erreur lors du chargement :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    /**
     * Codes indisponibles : ceux renvoyés par l'API, plus les codes système
     * réservés, moins ceux du rôle en cours d'édition — sans cette exclusion,
     * ouvrir un rôle existant le déclarerait en collision avec lui-même.
     */
    const takenCodes = useMemo(() => {
        const fromApi = allRoleCodes
            .filter(role => role.id !== editingRole?.id)
            .map(role => role.codeRole);
        const reserved = RESERVED_ROLE_CODES.filter(
            code => code !== normalizeRoleCode(editingRole?.codeRole ?? "")
        );

        return [...fromApi, ...reserved];
    }, [allRoleCodes, editingRole]);

    const ownCode = normalizeRoleCode(editingRole?.codeRole ?? "");

    /**
     * Message d'erreur du champ code, ou null s'il est valide. `force` sert à
     * la soumission : sans lui, un code vide ne serait signalé qu'une fois
     * touché, et le formulaire pourrait partir avec un code manquant.
     */
    const validateCode = (force = false): string | null => {
        if (!codeRole) {
            return force || codeTouched ? codeRoleMessages.required : null;
        }
        if (!ROLE_CODE_PATTERN.test(codeRole)) return codeRoleMessages.format;
        if (codeRole === ownCode) return null;
        if (isRoleCodeTaken(codeRole, RESERVED_ROLE_CODES)) return codeRoleMessages.reserved;
        if (isRoleCodeTaken(codeRole, takenCodes)) return codeRoleMessages.duplicate;

        return null;
    };

    const codeError = validateCode();

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

        const submittedCode = normalizeRoleCode(codeRole);

        try {
            if (editingRole) {
                await roleService.update(editingRole.id, {
                    name: roleName,
                    codeRole: submittedCode,
                    permissions: selectedPermissions
                });
                toast.success("Rôle mis à jour avec succès");
            } else {
                await roleService.create({
                    name: roleName,
                    codeRole: submittedCode,
                    permissions: selectedPermissions
                });
                toast.success("Rôle créé avec succès");
            }
            setShowForm(false);
            setEditingRole(null);
            setRoleName("");
            setCodeRole(""); // Nouveau : reset codeRole
            setCodeTouched(false);
            setSelectedPermissions([]);
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde");
        }
    };

    const handleEdit = async (role: RoleTable) => {
        try {
            const fullRole = await roleService.getById(role.id);
            setEditingRole(fullRole);
            setRoleName(fullRole.name);
            setCodeRole(fullRole.codeRole || "");
            setSelectedPermissions(fullRole.permissions.map(p => p.name));
            setShowForm(true);
        } catch (error) {
            toast.error("Erreur lors du chargement du rôle");
        }
    };

    const togglePermission = (permName: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permName)
                ? prev.filter(p => p !== permName)
                : [...prev, permName]
        );
    };

    /**
     * Ouvre ou replie une catégorie de permissions.
     * L'état est un tableau de clés plutôt qu'un objet boolean : le nombre de
     * catégories reste faible et figé côté API, un Set serait overkill ici.
     */
    const toggleCategory = (category: PermissionCategory) => {
        setOpenCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    /**
     * Clé de regroupement d'une permission. Centralisée ici car la clé sert à la
     * fois au groupement et à l'état d'ouverture : deux implémentations
     * divergentes du `??` produiraient des catégories qui ne s'ouvrent jamais.
     * Les permissions sans catégorie (base non migrée) retombent dans « Autres ».
     */
    const getCategoryKey = (perm: Permission): PermissionCategory =>
        perm.categoryPermission ?? FALLBACK_PERMISSION_CATEGORY;

    /**
     * Permissions regroupées par catégorie pour l'affichage du formulaire.
     * L'API renvoie déjà la liste triée par catégorie puis par nom, l'ordre des
     * groupes est donc celui du premier élément de chaque catégorie.
     */
    const permissionsByCategory = useMemo(() => {
        const groups = new Map<PermissionCategory, Permission[]>();
        for (const perm of allPermissions) {
            const key = getCategoryKey(perm);
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
    }, [allPermissions]);

    /**
     * Catégories contenant au moins une permission cochée : ce sont les seules
     * catégories à dérouler à l'ouverture du formulaire, pour qu'un rôle en
     * édition n'ait pas ses permissions sélectionnées cachées derrière un
     * accordéon replié. En création, l'ensemble est vide et tout reste replié.
     */
    const categoriesWithSelection = useMemo(
        () =>
            permissionsByCategory
                .filter(([, perms]) =>
                    perms.some(perm => selectedPermissions.includes(perm.name))
                )
                .map(([category]) => category),
        [permissionsByCategory, selectedPermissions]
    );

    /**
     * Déploiement automatique à l'ouverture du formulaire.
     * `categoriesWithSelection` est volontairement absent des dépendances :
     * l'inclure relancerait l'effet à chaque permission cochée/décochée et
     * écraserait les replis manuels. La valeur lue est celle du rendu où
     * `showForm` bascule — les deux setters de `handleEdit` sont groupés par
     * React dans le même lot, donc les permissions sont déjà à jour ici.
     */
    useEffect(() => {
        if (showForm) {
            setOpenCategories(
                editingRole
                    ? categoriesWithSelection
                    : permissionsByCategory.map(([category]) => category)
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showForm]);

    const columns = createColumns(roles, roleTr, [
        "name",
        "codeRole",
        "permissions"
    ]);

    const actions: TableAction<RoleTable>[] = [
        {
            label: "Modifier",
            type: "edit",
            icon: <Pencil size={18} />,
            roles: ["SUPER_ADMIN"],
            onClick: (role) => handleEdit(role)
        }
    ];

    const headerActions: HeaderAction[] = [
        {
            label: "Ajouter un rôle",
            icon: <Plus size={18} />,
            type: "primary",
            roles: ["SUPER_ADMIN"],
            onClick: () => {
                setEditingRole(null);
                setRoleName("");
                setCodeRole("");
                setCodeTouched(false);
                setSelectedPermissions([]);
                setShowForm(true);
            }
        }
    ];

    const filteredRoles = roles.filter(r => r.name !== "SUPER_ADMIN").filter(item => {
        const value = search.toLowerCase();
        return Object.values(item)
            .some(field =>
                String(field).toLowerCase().includes(value)
            );
    });

    const totalPages = Math.ceil(filteredRoles.length / pageSize);
    const paginatedRoles = filteredRoles.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div className="space-y-6">
            <TableHeader
                title="Gestion des rôles et permissions"
                search={search}
                onSearch={setSearch}
                actions={headerActions}
            />

            {showForm && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                        {editingRole ? "Modifier le rôle" : "Créer un rôle"}
                    </h3>

                    <div className="mb-4">
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
                            disabled={editingRole !== null}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-gray-100"
                            placeholder="Ex: MANAGER"
                        />
                    </div>

                    <div className="mb-4">
                        <div className="mb-1 flex items-center justify-between gap-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Code du rôle
                            </label>
                            {editingRole === null && (
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
                            disabled={editingRole !== null}
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

                    <div className="mb-4">
                        <label className="mb-2 block  font-medium">
                            Permissions
                        </label>
                        {permissionsByCategory.map(([category, perms]) => {
                            const label = getPermissionCategoryLabel(category);
                            const isOpen = openCategories.includes(category);
                            const panelId = `permissions-${category}`;
                            // Compteur affiché même catégorie repliée, sinon
                            // l'utilisateur ne voit pas qu'elle contient des
                            // permissions déjà attribuées au rôle.
                            const selectedCount = perms.filter(perm =>
                                selectedPermissions.includes(perm.name)
                            ).length;

                            return (
                                <div key={category} className="m-2 mb-4 last:mb-0 ">
                                    {/*
                                        Pattern disclosure : le bouton porte
                                        aria-expanded/aria-controls, le panneau
                                        porte l'id référencé. `type="button"`
                                        évite la soumission implicite du
                                        formulaire parent.
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
                                            <span className="rounded-full bg-primary/70 text-white px-2 py-0.5 font-medium normal-case tracking-normal ">
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
                                            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                                        >
                                            {perms.map((perm) => {
                                                const isChecked = selectedPermissions.includes(perm.name);

                                                return (
                                                    <label
                                                        key={perm.id}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                                                            isChecked
                                                                ? "border-0 bg-accent/10"
                                                                : "border-0 hover:border-accent hover:border"
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
                            onClick={() => {
                                setShowForm(false);
                                setEditingRole(null);
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-secondary hover:text-white"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent"
                        >
                            {editingRole ? "Mettre à jour" : "Créer"}
                        </button>
                    </div>
                </div>
            )}

            <GlobalTable<RoleTable>
                data={paginatedRoles}
                columns={columns}
                actions={actions}
                roles={["SUPER_ADMIN"]}
                loading={loading}
                emptyMessage="Aucun rôle trouvé"
            />

            <TablePagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
            />
        </div>
    );
}
