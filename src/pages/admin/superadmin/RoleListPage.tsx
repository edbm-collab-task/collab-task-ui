import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";
import RoleForm from "@/components/role/RoleForm";
import { ROLE_FORM_LABELS } from "@/components/role/roleForm.constants";

import type { TableAction, HeaderAction } from "@/types/table";
import type { Role, RoleFormData, PermissionWithActionMask, RoleActionsMap } from "@/types/role";
import { roleService } from "@/services/role/role.service";
import { RESERVED_ROLE_CODES } from "@/enum/role.enum";
import { getPermissionLabel } from "@/constants/permissions";
import { normalizeRoleCode } from "@/utils/roleCode";
import usePermissions from "@/hooks/usePermissions";
import { PERM } from "@/constants/permissions";
import { ACT } from "@/constants/actions";

interface RoleTable {
    id: number;
    name: string;
    codeRole: string;
    permissions: string;
}

export default function RoleListPage() {

    const [roles, setRoles] = useState<RoleTable[]>([]);
    const { hasPermission } = usePermissions();
    /**
     * Rôles bruts (avec leurs permissions), conservés pour alimenter le
     * sélecteur de modèle du formulaire sans dépendre de `actions-map`.
     */
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    /**
     * Codes de tous les rôles renvoyés par l'API, y compris ceux masqués au
     * tableau (SUPER_ADMIN). Ils servent de liste de codes pris : un rôle
     * filtré de l'affichage n'a pas moins de code à protéger.
     */
    const [allRoleCodes, setAllRoleCodes] = useState<{ id: number; codeRole: string }[]>([]);
    /**
     * Catalogue complet des permissions (avec leurs actions possibles),
     * transmis au formulaire de rôle.
     */
    const [allPermissions, setAllPermissions] = useState<PermissionWithActionMask[]>([]);
    /**
     * Actions accordées de chaque rôle (masques), pour pré-remplir le
     * formulaire sans un appel par rôle.
     */
    const [actionsMap, setActionsMap] = useState<RoleActionsMap>({});
    const pageSize = 5;

    const loadData = async () => {
        try {
            setLoading(true);
            const [rolesData, permsData, actionsMapData] = await Promise.all([
                roleService.getAll(),
                roleService.getPermissionsWithActionMasks(),
                roleService.getActionsMap()
            ]);

            const filtered = rolesData.filter(r => r.name !== "SUPER_ADMIN");
            const tableData: RoleTable[] = filtered.map(r => ({
                id: r.id,
                name: r.name,
                codeRole: r.codeRole || "—",
                permissions: r.permissions.length > 0
                    ? r.permissions.map(p => getPermissionLabel(p.name)).join(", ")
                    : "Aucune permission"
            }));

            setRoles(tableData);
            setAllRoles(rolesData);
            setAllPermissions(permsData);
            setActionsMap(actionsMapData);
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

    /**
     * Rôles proposés comme modèle de création, avec leurs permissions (noms),
     * hors SUPER_ADMIN.
     */
    const sourceRoles = useMemo(
        () =>
            allRoles
                .filter(r => r.name !== "SUPER_ADMIN")
                .map(r => ({
                    id: r.id,
                    name: r.name,
                    permissions: r.permissions.map(p => p.name)
                })),
        [allRoles]
    );

    /**
     * Soumission du formulaire : création ou mise à jour du rôle, puis
     * enregistrement de ses actions (endpoint dédié). Les actions sont
     * retirées du corps envoyé à `create`/`update`, qui ne les accepte pas.
     */
    const handleSave = async (data: RoleFormData) => {
        try {
            const { actions, ...rolePayload } = data;
            const saved = editingRole
                ? await roleService.update(editingRole.id, rolePayload)
                : await roleService.create(rolePayload);

            await roleService.setActions(saved.id, actions);

            if (editingRole) {
                toast.success("Rôle mis à jour avec succès");
            } else {
                toast.success("Rôle créé avec succès");
            }
            setShowForm(false);
            setEditingRole(null);
            loadData();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            toast.error("Erreur lors de la sauvegarde");
        }
    };

    /**
     * Ouvre le formulaire en édition : le rôle complet (avec ses permissions)
     * est rechargé avant affichage.
     */
    const handleEdit = async (role: RoleTable) => {
        try {
            const fullRole = await roleService.getById(role.id);
            setEditingRole(fullRole);
            setShowForm(true);
        } catch (error) {
            console.error("Erreur lors du chargement du rôle :", error);
            toast.error("Erreur lors du chargement du rôle");
        }
    };

    /**
     * Ouvre le formulaire en création vierge.
     */
    const handleCreate = () => {
        setEditingRole(null);
        setShowForm(true);
    };

    const columns = createColumns(roles, ROLE_FORM_LABELS, [
        "name",
        {
            key: "codeRole",
            header: ROLE_FORM_LABELS.codeRole,
            className: "max-md:hidden"
        },
        "permissions"
    ]);

    /**
     * Actions par ligne. Le masquage se fait ici, selon la permission et
     * l'action requises.
     */
    const actions: TableAction<RoleTable>[] = [];

    /**
     * Modifier un rôle — nécessite `MANAGE_ROLES` + `UPDATE`.
     */
    if (hasPermission(PERM.MANAGE_ROLES, ACT.UPDATE)) {
        actions.push({
            label: "Modifier",
            type: "edit",
            icon: <Pencil size={18} />,
            onClick: (role) => handleEdit(role)
        });
    }

    /**
     * Actions de l'en-tête.
     */
    const headerActions: HeaderAction[] = [];

    /**
     * Ajouter un rôle — nécessite `MANAGE_ROLES` + `INSERT`.
     */
    if (hasPermission(PERM.MANAGE_ROLES, ACT.INSERT)) {
        headerActions.push({
            label: "Ajouter un rôle",
            icon: <Plus size={18} />,
            type: "primary",
            onClick: handleCreate
        });
    }

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
                <RoleForm
                    key={editingRole?.id ?? "create"}
                    editingRole={editingRole}
                    allPermissions={allPermissions}
                    actionsMap={actionsMap}
                    sourceRoles={sourceRoles}
                    takenCodes={takenCodes}
                    onSubmit={handleSave}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingRole(null);
                    }}
                />
            )}

            <GlobalTable<RoleTable>
                data={paginatedRoles}
                columns={columns}
                actions={actions}
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
