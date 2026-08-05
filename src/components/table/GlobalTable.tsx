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

        <div className="rounded-xl border border-gray-200 bg-white">


            <div className="overflow-x-auto">

                <table className="w-full text-sm">


                    <thead>

                        <tr className="border-b bg-gray-50">

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
                                    className="border-b last:border-none transition hover:bg-gray-50"
                                >


                                    {
                                        columns.map(column => (

                                            <td
                                                key={String(column.key)}
                                                className="px-5 py-4 text-gray-700"
                                            >

                                                {
                                                    column.render

                                                    ?

                                                    column.render(
                                                        row[column.key as keyof T],
                                                        row
                                                    )

                                                    :

                                                    String(
                                                        row[column.key as keyof T]
                                                    )
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