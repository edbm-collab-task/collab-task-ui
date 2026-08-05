import { useEffect, useState } from "react";
import { Eye, Pencil, Trash, Plus } from "lucide-react";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";

import { userTr, type UserResponse } from "@/types/user";
import type {
    TableAction,
    HeaderAction
} from "@/types/table";

import { userService } from "@/services/user/user.service";

export default function UserListPage() {

    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {

        const loadUsers = async () => {

            try {

                setLoading(true);

                const response = await userService.getAll();

                setUsers(response);

            } catch (error) {

                console.error("Erreur lors du chargement des utilisateurs :", error);

            } finally {

                setLoading(false);

            }

        };

        loadUsers();

    }, []);

    const columns = createColumns(users, userTr);

    const actions: TableAction<UserResponse>[] = [


        {
            label: "Modifier",
            type: "edit",
            icon: <Pencil size={18} />,
            roles: ["ADMIN"],

            onClick: (user) => {

                console.log("Modifier :", user);

            }

        },

        {
            label: "Supprimer",
            type: "delete",
            icon: <Trash size={18} />,
            roles: ["ADMIN"],

            onClick: (user) => {

                console.log("Supprimer :", user);

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

                console.log("Créer utilisateur");

            }

        }

    ];

    const filteredUsers = users.filter(user => {

        const value = search.toLowerCase();

        return Object.values(user)
            .some(field =>
                String(field)
                    .toLowerCase()
                    .includes(value)
            );

    });

    const totalPages = Math.ceil(filteredUsers.length / pageSize);

    const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

    return (

        <div className="space-y-6">

            <TableHeader
                title="Liste des utilisateurs"
                search={search}
                onSearch={setSearch}
                actions={headerActions}
            />

            <GlobalTable<UserResponse>
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