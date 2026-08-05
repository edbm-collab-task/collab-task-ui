import type { TableAction } from "@/types/table";


interface Props<T> {

    row: T;

    actions: TableAction<T>[];

    roles: string[];

}


const actionStyles: Record<string, string> = {

    edit: "text-blue-600  border-blue-200 hover:bg-blue-100",

    delete: "text-red-600  border-red-200 hover:bg-red-100",

    view: "text-green-600  border-green-200 hover:bg-green-100",

    create: "text-purple-600  border-purple-200 hover:bg-purple-100",

    default: "text-gray-600  border-gray-200 hover:bg-gray-100"

};


export default function TableActions<T>({
    row,
    actions,
    roles
}: Props<T>) {


    return (

        <div className="flex items-center gap-2">

            {
                actions

                    .filter(action =>
                        !action.roles ||
                        action.roles.some(role => roles.includes(role))
                    )

                    .map(action => (

                        <button
                            key={action.label}
                            title={action.label}
                            onClick={() => action.onClick(row)}
                            className={`flex h-9 w-9 items-center justify-center  border-none transition hover:scale-105 ${actionStyles[action.type] ?? actionStyles.default}`}
                        >
                            {action.icon}
                        </button>

                    ))
            }

        </div>

    );

}