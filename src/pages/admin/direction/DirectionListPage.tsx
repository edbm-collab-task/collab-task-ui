import { useEffect, useState } from "react";
import { Trash, Plus } from "lucide-react";

import GlobalTable from "@/components/table/GlobalTable";
import TableHeader from "@/components/table/TableHeader";
import { createColumns } from "@/components/table/createColumns";
import TablePagination from "@/components/table/TablePagination";
import type {
    TableAction,
    HeaderAction
} from "@/types/table";

import { useNavigate } from "react-router-dom";
import  { directionTr, type DirectionRes } from "@/types/direction";
import { directionService } from "@/services/direction/direction.service";
import usePermissions from "@/hooks/usePermissions";
import { PERM } from "@/constants/permissions";
import { ACT } from "@/constants/actions";

export default function DirectionsListPage() {

    const [directions, setDirections] = useState<DirectionRes[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    useEffect(() => {

        const loadDirections = async () => {

            try {

                setLoading(true);

                const response = await directionService.getAll();

                setDirections(response);

            } catch (error) {

                console.error("Erreur lors du chargement des utilisateurs :", error);

            } finally {

                setLoading(false);

            }

        };

        loadDirections();

    }, []);

    const columns = createColumns(directions, directionTr);

    /**
     * Actions par ligne. Le masquage se fait ici, selon la permission et
     * l'action requises.
     */
    const actions: TableAction<DirectionRes>[] = [];

    /**
     * Supprimer une direction — nécessite `MANAGE_DIRECTIONS` + `DELETE`.
     */
    if (hasPermission(PERM.MANAGE_DIRECTIONS, ACT.DELETE)) {

        actions.push({

            label: "Supprimer",

            type: "delete",

            icon: <Trash size={18} />,

            onClick: async (direction) => {
                await directionService.delete(direction.directionId);
                setDirections(directions.filter(u => u.directionId !== direction.directionId));
            }

        });
    }

    /**
     * Actions de l'en-tête.
     */
    const headerActions: HeaderAction[] = [];

    /**
     * Ajouter une direction — nécessite `MANAGE_DIRECTIONS` + `INSERT`.
     */
    if (hasPermission(PERM.MANAGE_DIRECTIONS, ACT.INSERT)) {

        headerActions.push({

            label: "Ajouter",

            icon: <Plus size={18} />,

            type: "primary",

            onClick: () => {
                navigate("/admin/directions/create");
            }

        });
    }

    const filteredDirections = directions.filter(direction => {

        const value = search.toLowerCase();

        return Object.values(direction)
            .some(field =>
                String(field)
                    .toLowerCase()
                    .includes(value)
            );

    });

    const totalPages = Math.ceil(filteredDirections.length / pageSize);

    const paginatedDirections = filteredDirections.slice((page - 1) * pageSize, page * pageSize);

    return (

        <div className="mx-auto w-full max-w-7xl space-y-6">

            <TableHeader
                title="Liste des directions"
                search={search}
                onSearch={setSearch}
                actions={headerActions}
            />

            <GlobalTable<DirectionRes>
                data={paginatedDirections}
                columns={columns}
                actions={actions}
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