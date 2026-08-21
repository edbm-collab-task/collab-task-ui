import { useEffect, useState } from "react";
import { Plus, Pencil, Trash, Check } from "lucide-react";
import toast from "react-hot-toast";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";
import { confirmDelete } from "@/components/modal/confirmDelete";

import type { TableAction, HeaderAction } from "@/types/table";
import type { Role, Permission } from "@/types/role";
import { roleService } from "@/services/role/role.service";

const roleTr = {
    name: "Nom",
    permissions: "Permissions",
};

interface RoleTable {
    id: number;
    name: string;
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
    const pageSize = 5;

    const loadData = async () => {
        try {
            setLoading(true);
            const [rolesData, permsData] = await Promise.all([
                roleService.getAll(),
                roleService.getAllPermissions()
            ]);

            const tableData: RoleTable[] = rolesData.map(r => ({
                id: r.id,
                name: r.name,
                permissions: r.permissions.length > 0
                    ? r.permissions.join(", ")
                    : "Aucune permission"
            }));

            setRoles(tableData);
            setAllPermissions(permsData);
        } catch (error) {
            console.error("Erreur lors du chargement :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async () => {
        if (!roleName.trim()) {
            toast.error("Le nom du rôle est requis");
            return;
        }

        try {
            if (editingRole) {
                await roleService.update(editingRole.id, {
                    name: editingRole.name,
                    permissions: selectedPermissions
                });
                toast.success("Rôle mis à jour avec succès");
            } else {
                await roleService.create({
                    name: roleName,
                    permissions: selectedPermissions
                });
                toast.success("Rôle créé avec succès");
            }
            setShowForm(false);
            setEditingRole(null);
            setRoleName("");
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
            setSelectedPermissions(fullRole.permissions);
            setShowForm(true);
        } catch (error) {
            toast.error("Erreur lors du chargement du rôle");
        }
    };

    const handleDelete = async (role: RoleTable) => {
        if (role.name === "SUPER_ADMIN" || role.name === "ADMIN" || role.name === "USER") {
            toast.error("Impossible de supprimer un rôle système");
            return;
        }
        const confirmed = await confirmDelete("rôle");
        if (!confirmed) return;
        try {
            await roleService.delete(role.id);
            toast.success("Rôle supprimé");
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const togglePermission = (permName: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permName)
                ? prev.filter(p => p !== permName)
                : [...prev, permName]
        );
    };

    const columns = createColumns(roles, roleTr, [
        "name",
        "permissions"
    ]);

    const actions: TableAction<RoleTable>[] = [
        {
            label: "Modifier",
            type: "edit",
            icon: <Pencil size={18} />,
            roles: ["SUPER_ADMIN"],
            onClick: (role) => handleEdit(role)
        },
        {
            label: "Supprimer",
            type: "delete",
            icon: <Trash size={18} />,
            roles: ["SUPER_ADMIN"],
            onClick: (role) => handleDelete(role)
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
                setSelectedPermissions([]);
                setShowForm(true);
            }
        }
    ];

    const filteredRoles = roles.filter(item => {
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
                            onChange={(e) => setRoleName(e.target.value)}
                            disabled={editingRole !== null}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                            placeholder="Ex: MANAGER"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Permissions
                        </label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {allPermissions.map((perm) => (
                                <label
                                    key={perm.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                                        selectedPermissions.includes(perm.name)
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(perm.name)}
                                        onChange={() => togglePermission(perm.name)}
                                        className="hidden"
                                    />
                                    <div
                                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                                            selectedPermissions.includes(perm.name)
                                                ? "border-blue-500 bg-blue-500"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        {selectedPermissions.includes(perm.name) && (
                                            <Check size={12} className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{perm.name}</p>
                                        <p className="text-xs text-gray-500">{perm.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {editingRole ? "Mettre à jour" : "Créer"}
                        </button>
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setEditingRole(null);
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Annuler
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
