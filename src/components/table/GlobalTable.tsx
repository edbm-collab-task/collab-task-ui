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

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="overflow-x-auto custom-scrollbar">

                <table className="min-w-full text-sm">

                    <thead className="sticky top-0 bg-gray-50">

                        <tr>

                            {
                                columns.map(column => (

                                    <th
                                        key={String(column.key)}
                                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                    >
                                        {column.header}
                                    </th>

                                ))
                            }

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            data.map((row, index) => (

                                <tr
                                    key={index}
                                    className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} transition-colors duration-200 hover:bg-blue-50`}
                                >

                                    {
                                        columns.map(column => (

                                            <td
                                                key={String(column.key)}
                                                className="px-5 py-4 text-gray-700"
                                            >

                                                {
                                                    column.render
                                                        ? column.render(
                                                            row[column.key as keyof T],
                                                            row
                                                        )
                                                        : String(row[column.key as keyof T])
                                                }

                                            </td>

                                        ))
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
                                        className="py-12 text-center text-gray-400"
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