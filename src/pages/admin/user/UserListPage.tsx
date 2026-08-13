import { useEffect, useState } from "react";
import { Pencil, Trash, Plus } from "lucide-react";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";

import { userTr, type UserResponse, type UserTable } from "@/types/user";
import type {
    TableAction,
    HeaderAction
} from "@/types/table";

import { userService } from "@/services/user/user.service";
import { useNavigate } from "react-router-dom";
import { toUserTable } from "@/mappers/user.mapper";

export default function UserListPage() {

    const [users, setUsers] = useState<UserTable[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const navigate = useNavigate();

    useEffect(() => {

        const loadUsers = async () => {

            try {

                setLoading(true);

                const response = await userService.getAll();

                const userMapToUserTable = (user: UserResponse) => ({
                   ...toUserTable(user)
                });


                setUsers(response.map(userMapToUserTable));

            } catch (error) {

                console.error("Erreur lors du chargement des utilisateurs :", error);

            } finally {

                setLoading(false);

            }

        };

        loadUsers();

    }, []);

    const columns = createColumns(users, userTr);

    
    const actions: TableAction<UserTable>[] = [


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

            onClick: async (user) => {
                await userService.delete(user.id);
                setUsers(users.filter(u => u.id !== user.id));
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