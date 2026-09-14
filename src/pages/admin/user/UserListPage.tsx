import { useEffect, useState } from "react";
import { Eye, Pencil, Trash, Plus } from "lucide-react";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";
import { confirmDelete } from "@/components/modal/confirmDelete";
import TableFilter from "@/components/table/TableFilter";

import {
    userTr,
    type UserTable,
    type UserDetails
} from "@/types/user";

import type { TableAction, HeaderAction } from "@/types/table";

import { DetailModal } from "@/components/details/globalDetail";
import { userDetailFields } from "@/components/details/userDetails";

import { userService } from "@/services/user/user.service";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function UserListPage() {

    const [users, setUsers] = useState<UserTable[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    type StatusFilter = "all" | "active" | "disable";
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
    const pageSize = 5;

    const navigate = useNavigate();

    // Utilisateur actuellement connecté
    const { user: currentUser } = useAuth();

    const loadUsers = async (status: StatusFilter) => {

        try {

            setLoading(true);

            let response: UserTable[];

            switch (status) {

                case "active":
                    response = await userService.getAllActive();
                    break;

                case "disable":
                    response = await userService.getAllDisable();
                    break;

                case "all":
                default:
                    response = await userService.getAll();
                    break;
            }

            setUsers(response);

        } catch (error) {

            console.error(
                "Erreur lors du chargement des utilisateurs :",
                error
            );

            setUsers([]);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => { loadUsers(statusFilter); }, [statusFilter]);

    const columns = createColumns(users, userTr, [
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
            roles: ["ADMIN"],

            onClick: async (user) => {

                try {

                    const details = await userService.getById(user.id);

                    setSelectedUser(details);
                    setDetailModalOpen(true);

                } catch (error) {

                    console.error(
                        "Erreur lors du chargement des détails de l'utilisateur :",
                        error
                    );

                }

            },
        },

        {
            label: "Modifier",
            type: "edit",
            icon: <Pencil size={18} />,
            roles: ["ADMIN"],

            onClick: (user) => {
                navigate("/admin/users/edit-role", {
                    state: {
                        email: user.email
                    }
                });
            }

        },

        {
            label: "Désactiver",
            type: "delete",
            icon: <Trash size={18} />,
            roles: ["ADMIN"],

            onClick: async (user) => {

                const confirmed = await confirmDelete("utilisateur");

                if (!confirmed) {
                    return;
                }

                try {

                    await userService.updateAccountStatus(
                        user.email,
                        false
                    );

                    setUsers(prev =>
                        prev.filter(u => u.id !== user.id)
                    );

                } catch (error) {

                    console.error(
                        "Erreur lors de la désactivation :",
                        error
                    );

                }

            }
        }
    ];


    const headerActions: HeaderAction[] = [

        {
            label: "Ajouter",
            icon: <Plus size={18} />,
            type: "primary",
            roles: ["USER", "ADMIN"],

            onClick: () => {

                navigate("/admin/users/create");

            }

        }

    ];


    /*
     * 1. On enlève l'utilisateur connecté
     * 2. On applique la recherche
     */
    const filteredUsers = users
        .filter(item => item.email !== currentUser?.email)
        .filter(item => {

            const value = search.toLowerCase();

            return Object.values(item)
                .some(field =>
                    String(field)
                        .toLowerCase()
                        .includes(value)
                );

        });


    const totalPages = Math.ceil(
        filteredUsers.length / pageSize
    );


    const paginatedUsers = filteredUsers.slice(
        (page - 1) * pageSize,
        page * pageSize
    );


    return (

        <div className="space-y-6">

            <DetailModal<UserDetails>
                open={detailModalOpen}
                data={selectedUser}
                title="Détails de l'utilisateur"
                description="Informations du compte utilisateur"
                fields={userDetailFields}
                onClose={() => {

                    setDetailModalOpen(false);
                    setSelectedUser(null);

                }}
            />


            <TableHeader
                title="Liste des utilisateurs"
                search={search}
                onSearch={setSearch}
                actions={headerActions}
            />

            <TableFilter<StatusFilter>
                value={statusFilter}
                options={[
                    {
                        label: "Tous",
                        value: "all"
                    },
                    {
                        label: "Actifs",
                        value: "active"
                    },
                    {
                        label: "Désactivés",
                        value: "disable"
                    }
                ]}
                onChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                }}
            />

            <GlobalTable<UserTable>
                data={paginatedUsers}
                columns={columns}
                actions={actions}
                roles={["ADMIN"]}
                loading={loading}
                emptyMessage="Aucun utilisateur trouvé"
            />


            <TablePagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
            />

        </div>

    );

}