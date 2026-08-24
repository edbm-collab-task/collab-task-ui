import { useEffect, useState } from "react";
import { Eye, Pencil, Trash, Plus } from "lucide-react";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";
import { confirmDelete } from "@/components/modal/confirmDelete";

import { type UserTable, type UserDetails } from "@/types/user";

import type { TableAction, HeaderAction } from "@/types/table";

import { DetailModal } from "@/components/details/globalDetail";
import { userDetailFields } from "@/components/details/userDetails";

import { userService } from "@/services/user/user.service";
import { useNavigate } from "react-router-dom";

const adminTr = {
    firstname: "Prénom",
    lastname: "Nom",
    email: "Email",
    role: "Rôle",
};

export default function AdminListPage() {

    const [admins, setAdmins] = useState<UserTable[]>([]);
    const [selectedAdmin, setSelectedAdmin] = useState<UserDetails | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const navigate = useNavigate();

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const response = await userService.getAdmins();
            setAdmins(response);
        } catch (error) {
            console.error("Erreur lors du chargement des administrateurs :", error);
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAdmins(); }, []);

    const columns = createColumns(admins, adminTr, [
        "firstname",
        "lastname",
        "email",
        "role"
    ]);

    const actions: TableAction<UserTable>[] = [
        {
            label: "Voir plus",
            type: "view",
            icon: <Eye size={18} />,
            roles: ["SUPER_ADMIN"],
            onClick: async (admin) => {
                try {
                    const details = await userService.getById(admin.id);
                    setSelectedAdmin(details);
                    setDetailModalOpen(true);
                } catch (error) {
                    console.error("Erreur lors du chargement des détails :", error);
                }
            },
        },
        {
            label: "Modifier le rôle",
            type: "edit",
            icon: <Pencil size={18} />,
            roles: ["SUPER_ADMIN"],
            onClick: (admin) => {
                navigate("/admin/users/edit-role", {
                    state: { email: admin.email }
                });
            }
        },
        {
            label: "Désactiver",
            type: "delete",
            icon: <Trash size={18} />,
            roles: ["SUPER_ADMIN"],
            onClick: async (admin) => {
                const confirmed = await confirmDelete("administrateur");
                if (!confirmed) return;
                try {
                    await userService.updateAccountStatus(admin.email, false);
                    setAdmins(prev => prev.filter(a => a.id !== admin.id));
                } catch (error) {
                    console.error("Erreur lors de la désactivation :", error);
                }
            }
        }
    ];

    const headerActions: HeaderAction[] = [
        {
            label: "Ajouter un admin",
            icon: <Plus size={18} />,
            type: "primary",
            roles: ["SUPER_ADMIN"],
            onClick: () => {
                navigate("/admin/users/create");
            }
        }
    ];

    const filteredAdmins = admins
        .filter(item => {
            const value = search.toLowerCase();
            return Object.values(item)
                .some(field =>
                    String(field).toLowerCase().includes(value)
                );
        });

    const totalPages = Math.ceil(filteredAdmins.length / pageSize);
    const paginatedAdmins = filteredAdmins.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div className="space-y-6">
            <DetailModal<UserDetails>
                open={detailModalOpen}
                data={selectedAdmin}
                title="Détails de l'administrateur"
                description="Informations du compte administrateur"
                fields={userDetailFields}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedAdmin(null);
                }}
            />

            <TableHeader
                title="Gestion des administrateurs"
                search={search}
                onSearch={setSearch}
                actions={headerActions}
            />

            <GlobalTable<UserTable>
                data={paginatedAdmins}
                columns={columns}
                actions={actions}
                roles={["SUPER_ADMIN"]}
                loading={loading}
                emptyMessage="Aucun administrateur trouvé"
            />

            <TablePagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
            />
        </div>
    );
}
