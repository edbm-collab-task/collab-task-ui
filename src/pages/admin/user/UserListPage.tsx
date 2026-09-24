import { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";
import { confirmDelete } from "@/components/modal/confirmDelete";
import TableFilter from "@/components/table/TableFilter";

import { userTr, type UserTable, type UserDetails } from "@/types/user";
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

    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (currentUser?.role === "SUPER_ADMIN") {
            navigate("/admin/admins", { replace: true });
        }
    }, [currentUser, navigate]);

    if (currentUser?.role === "SUPER_ADMIN") {
        return null;
    }


    /**
     * Charge les utilisateurs selon le filtre sélectionné.
     */
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


    /**
     * Recharge les utilisateurs lorsque le filtre change.
     */
    useEffect(() => {

        loadUsers(statusFilter);

    }, [statusFilter]);


    /**
     * Création des colonnes du tableau.
     */
    const columns = createColumns(
        users,
        userTr,
        ["firstname", "lastname", "email", "role"]
    );


    /**
     * Actions disponibles pour chaque utilisateur.
     */
    const actions: TableAction<UserTable>[] = [

        /**
          * Voir les détails.
          */
        {
            label: "Voir plus",

            type: "view",

            icon: <Eye size={18} />,

            roles: ["ADMIN"],

            onClick: async (user) => {

                try {

                    const details =
                        await userService.getById(user.id);

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


        /**
         * Activer / Désactiver.
         *
         * Le switch dépend maintenant de user.isActive.
         */
        {
            label: "Activer / Désactiver",

            type: "delete",

            icon: (user) => (
                <div className={`relative w-12 h-6 max-sm:w-8 max-sm:h-4 rounded-full transition-colors duration-200 ${user.isActive ? "bg-primary" : "bg-gray-400"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 max-sm:w-3 max-sm:h-3 rounded-full bg-white shadow-md transition-all duration-200 ${user.isActive ? "right-0.5" : "left-0.5"}`} />
                </div>
            ),

            roles: ["ADMIN"],

            onClick: async (user) => {

                /**
                 * Le nouveau statut est l'inverse
                 * du statut actuel.
                 *
                 * true  -> false : désactivation
                 * false -> true  : activation
                 */
                const newStatus = !user.isActive;


                /**
                 * Demande de confirmation.
                 */
                const confirmed = await confirmDelete(
                    newStatus
                        ? "activer ce compte"
                        : "desactiver ce compte"
                );


                /**
                 * L'utilisateur a annulé.
                 */
                if (!confirmed) {
                    return;
                }


                try {

                    /**
                     * Modification du statut.
                     */
                    await userService.updateAccountStatus(
                        user.email,
                        newStatus
                    );


                    /**
                     * Recharge la liste actuelle.
                     */
                    await loadUsers(statusFilter);

                } catch (error) {

                    console.error(
                        newStatus
                            ? "Erreur lors de l'activation :"
                            : "Erreur lors de la désactivation :",
                        error
                    );
                }
            }
        }
    ];


    /**
     * Actions de l'en-tête.
     */
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


    /**
     * Filtrage local - n'afficher que les USER normaux.
     */
    const filteredUsers = users

        .filter(item => item.role === "USER")

        .filter(
            item =>
                item.email !== currentUser?.email
        )

        .filter(item => {

            const value =
                search.toLowerCase();

            return Object.values(item).some(field =>
                String(field)
                    .toLowerCase()
                    .includes(value)
            );
        });


    /**
     * Nombre total de pages.
     */
    const totalPages = Math.ceil(
        filteredUsers.length / pageSize
    );


    /**
     * Utilisateurs de la page actuelle.
     */
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * pageSize,
        page * pageSize
    );


    return (

        <div className="space-y-6">

            {/* Détails utilisateur */}
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


            {/* En-tête */}
            <TableHeader

                title="Liste des utilisateurs"

                search={search}

                onSearch={setSearch}

                actions={headerActions}
            />


            {/* Filtre */}
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


            {/* Tableau */}
            <GlobalTable<UserTable>

                data={paginatedUsers}

                columns={columns}

                actions={actions}

                roles={["ADMIN"]}

                loading={loading}

                emptyMessage="Aucun utilisateur trouvé"
            />


            {/* Pagination */}
            <TablePagination

                page={page}

                totalPages={totalPages}

                onChange={setPage}
            />

        </div>
    );
}