import { useEffect, useState } from "react";
import { Eye, Pencil, Plus } from "lucide-react";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";
import { createAccountStatusAction } from "@/components/admin/AccountStatusAction";
import TableFilter from "@/components/table/TableFilter";

import { type UserTable, type UserDetails } from "@/types/user";
import type { TableAction, HeaderAction } from "@/types/table";
import type { Role } from "@/types/role";

import { DetailModal } from "@/components/details/globalDetail";
import { userDetailFields } from "@/components/details/userDetails";

import { userService } from "@/services/user/user.service";
import { roleService } from "@/services/role/role.service";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const adminTr = {
    firstname: "Prénom",
    lastname: "Nom",
    email: "Email",
    role: "Rôle",
    codeRole: "Rôle",
};

export default function AdminListPage() {

    const [admins, setAdmins] = useState<UserTable[]>([]);
    const [selectedAdmin, setSelectedAdmin] = useState<UserDetails | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [roles, setRoles] = useState<Role[]>([]);

    type StatusFilter = "all" | "active" | "disable";
    type RoleFilter = "all" | string;

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

    const pageSize = 5;

    const navigate = useNavigate();
    const { user: currentUser } = useAuth();


    /**
     * Charge tous les rôles pour le filtre.
     */
    const loadRoles = async () => {
        try {
            const rolesData = await roleService.getAll();
            // Filtrer SUPER_ADMIN si on veut, ou le garder
            setRoles(rolesData.filter(r => r.name !== "SUPER_ADMIN"));
        } catch (error) {
            console.error("Erreur lors du chargement des rôles :", error);
        }
    };

    /**
     * Charge tous les utilisateurs pour le SUPER_ADMIN (users, admins, super_admins)
     * selon le filtre de statut sélectionné.
     */
    const loadAdmins = async (status: StatusFilter) => {

        try {

            setLoading(true);

            let response: UserTable[];

            switch (status) {

                case "disable":
                    response = await userService.getAllDisable();
                    break;

                case "all":
                    response = await userService.getAll();
                    break;

                case "active":
                default:
                    response = await userService.getAllActive();
                    break;
            }

            setAdmins(response);

        } catch (error) {

            console.error(
                "Erreur lors du chargement des administrateurs :",
                error
            );

            setAdmins([]);

        } finally {

            setLoading(false);
        }
    };


    /**
     * Recharge les administrateurs lorsque le filtre de statut change.
     */
    useEffect(() => {

        loadAdmins(statusFilter);

    }, [statusFilter]);

    /**
     * Charge les rôles au montage pour le filtre.
     */
    useEffect(() => {
        loadRoles();
    }, []);


    /**
     * Création des colonnes.
     */
    const columns = createColumns(
        admins,
        adminTr,
        [
            "firstname",
            "lastname",
            "email",
            "codeRole"
        ]
    );


    /**
     * Actions disponibles pour chaque administrateur.
     */
    const actions: TableAction<UserTable>[] = [

        /**
         * Voir plus.
         */
        {
            label: "Voir plus",

            type: "view",

            icon: <Eye size={18} className="text-secondary hover:text-primary " />,

            roles: ["SUPER_ADMIN"],

            onClick: async (admin) => {

                try {

                    const details =
                        await userService.getById(admin.id);

                    setSelectedAdmin(details);

                    setDetailModalOpen(true);

                } catch (error) {

                    console.error(
                        "Erreur lors du chargement des détails :",
                        error
                    );
                }
            },
        },


        /**
         * Modifier le rôle.
         */
        {
            label: "Modifier le rôle",

            type: "edit",

            icon: (
                <Pencil
                    size={18}
                    className="text-accent/80 hover:text-accent"
                />
            ),

            roles: ["SUPER_ADMIN"],

            onClick: (admin) => {

                navigate(
                    "/admin/users/edit-role",
                    {
                        state: {
                            email: admin.email
                        }
                    }
                );
            }
        },


        createAccountStatusAction<UserTable, StatusFilter>({
            label: (sf) => (sf === "disable" ? "Activer" : "Désactiver"),
            roles: ["SUPER_ADMIN"],
            statusFilter,
            onReload: loadAdmins,
        })
    ];


    /**
     * Actions de l'en-tête.
     */
    const headerActions: HeaderAction[] = [

        {
            label: "Ajouter un utilisateur",

            icon: <Plus size={18} />,

            type: "primary",

            roles: ["SUPER_ADMIN"],

            onClick: () => {

                navigate(
                    "/admin/users/create"
                );
            }
        }
    ];


    /**
     * Filtrage par statut + recherche.
     *
     * Le statut est filtré localement
     * à partir de isActive.
     */
    const filteredAdmins = admins

        .filter(admin => admin.email !== currentUser?.email)

        .filter(admin => {

            if (statusFilter === "active") {
                return admin.isActive;
            }

            if (statusFilter === "disable") {
                return !admin.isActive;
            }

            return true;
        })

        .filter(admin => {
            if (roleFilter === "all") return true;
            return admin.codeRole === roleFilter;
        })

        .filter(admin => {

            const value =
                search.toLowerCase();

            return Object.values(admin)
                .some(field =>
                    String(field)
                        .toLowerCase()
                        .includes(value)
                );
        });


    /**
     * Nombre total de pages.
     */
    const totalPages = Math.ceil(
        filteredAdmins.length / pageSize
    );


    /**
     * Administrateurs de la page actuelle.
     */
    const paginatedAdmins =
        filteredAdmins.slice(
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

                title="Gestion des administrateurs et utilisateurs"

                search={search}

                onSearch={setSearch}

                actions={headerActions}
            />


            <div className="flex flex-wrap gap-3">
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

                <TableFilter<RoleFilter>

                    value={roleFilter}

                    options={[
                        {
                            label: "Tous les rôles",
                            value: "all"
                        },
                        ...roles.map(role => ({
                            label: role.name,
                            value: role.codeRole
                        }))
                    ]}

                    onChange={(value) => {

                        setRoleFilter(value);

                        setPage(1);
                    }}
                />
            </div>


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