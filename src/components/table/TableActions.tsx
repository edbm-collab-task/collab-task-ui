import type { ReactNode } from "react";
import type { TableAction } from "@/types/table";

interface Props<T> {
    row: T;
    actions: TableAction<T>[];
    roles: string[];
}

const actionStyles: Record<string, string> = {
    edit: "text-primary hover:bg-secondary/60 hover:text-primary",
    delete: "text-red-600 hover:bg-red-50",
    view: "text-emerald-600 hover:bg-emerald-50",
    create: "text-accent hover:bg-accent/10",
    default: "text-primary/50 hover:bg-secondary/40 hover:text-primary"
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
                    .map(action => {

                        const icon = action.icon as ReactNode | ((row: T) => ReactNode);

                        return (
                            <button
                                key={action.label}
                                title={action.label}
                                onClick={() => action.onClick(row)}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm transition-colors duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${actionStyles[action.type] ?? actionStyles.default}`}
                            >
                                {
                                    typeof icon === "function"
                                        ? icon(row)
                                        : icon
                                }
                            </button>
                        );
                    })
            }

        </div>

    );
}