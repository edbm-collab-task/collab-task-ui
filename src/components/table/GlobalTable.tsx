import TableActions from "./TableActions";

import type {
    Column,
    TableAction
} from "@/types/table";


interface Props<T> {

    data: T[];

    columns: Column<T>[];

    actions?: TableAction<T>[];

    roles?: string[];

    loading?: boolean;

    emptyMessage?: string;

}


export default function GlobalTable<T>({
    data,
    columns,
    actions = [],
    roles = []
}: Props<T>) {

    return (

        <div className="overflow-hidden rounded-2xl border border-secondary/60 bg-white shadow-sm">

            <div className="overflow-x-auto custom-scrollbar">

                <table className="w-full text-sm max-w-full box-border table-auto max-sm:table-fixed">

                    <thead className="sticky top-0 bg-secondary/30">

                        <tr>

                        {
                            columns.map((column, index) => {
                                const isVisibleOnMobile = index === 0 || index === 1 || index === columns.length - 1;

                                return (
                                    <th
                                        key={String(column.key)}
                                        className={`min-w-0 max-w-full wrap-break-word px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-primary ${
                                            isVisibleOnMobile ? "" : "max-sm:hidden"
                                        }`}
                                    >
                                        {column.header}
                                    </th>
                                );
                            })
                        }

                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-primary">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            data.map((row, rowIndex) => (

                                <tr
                                    key={rowIndex}
                                    className={`${rowIndex % 2 === 0 ? "bg-white" : "bg-secondary/10"} transition-colors duration-150 hover:bg-secondary/40`}
                                >

                                    {
                                        columns.map((column, colIndex) => {
                                            const isVisibleOnMobile = colIndex === 0 || colIndex === 1 || colIndex === columns.length - 1;

                                            return (
                                                <td
                                                    key={String(column.key)}
                                                    className={`px-5 py-4 text-primary/80 wrap-break-word max-sm:text-xs ${
                                                        isVisibleOnMobile ? "" : "max-sm:hidden"
                                                    }`}
                                                >
                                                    {
                                                        column.render
                                                            ? column.render(row[column.key as keyof T], row)
                                                            : String(row[column.key as keyof T])
                                                    }
                                                </td>
                                            );
                                        })
                                    }
                                    <td className="px-5 py-4">

                                        <TableActions
                                            row={row}
                                            actions={actions}
                                            roles={roles}
                                        />

                                    </td>

                                </tr>

                            ))
                        }

                        {
                            data.length === 0 && (

                                <tr>

                                    <td
                                        colSpan={columns.length + 1}
                                        className="py-12 text-center text-primary/40"
                                    >
                                        Aucun élément trouvé
                                    </td>

                                </tr>

                            )
                        }

                    </tbody>

                </table>   

            </div>

        </div>

    );

}