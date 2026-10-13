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
import type { Role, RoleFormData, PermissionWithActions } from "@/types/role";
import { roleService } from "@/services/role/role.service";
import { RESERVED_ROLE_CODES } from "@/enum/role.enum";
import { normalizeRoleCode } from "@/utils/roleCode";

interface RoleTable {
    id: number;
    name: string;
    codeRole: string;
    permissions: string;
}

export default function RoleListPage() {

    const [roles, setRoles] = useState<RoleTable[]>([]);
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
     * Catalogue complet des permissions (avec leurs actions), transmis au
     * formulaire de rôle.
     */
    const [allPermissions, setAllPermissions] = useState<PermissionWithActions[]>([]);
    const pageSize = 5;

    const loadData = async () => {
        try {
            setLoading(true);
            const [rolesData, permsData] = await Promise.all([
                roleService.getAll(),
                roleService.getPermissionsWithActions()
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
            onClick: handleCreate
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
                <RoleForm
                    key={editingRole?.id ?? "create"}
                    editingRole={editingRole}
                    allPermissions={allPermissions}
                    sourceRoles={roles.map(r => ({ id: r.id, name: r.name }))}
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
