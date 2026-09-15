import TableSearch from "./TableSearch";
import type { HeaderAction } from "@/types/table";

interface Props {
    title: string;
    search: string;
    onSearch: (value: string) => void;
    actions: HeaderAction[];
    filters?: React.ReactNode;
}

export default function TableHeader({
    title,
    search,
    onSearch,
    actions,
    filters,
}: Props) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-secondary/60 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <h2 className="text-xl font-semibold text-primary sm:text-2xl">
                {title}
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                <TableSearch
                    value={search}
                    onChange={onSearch}
                />

                {filters}

                {actions.map((action) => (
                    <button
                        key={action.label}
                        type="button"
                        onClick={action.onClick}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-300 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        {action.icon}
                        {action.label}
                    </button>
                ))}

            </div>
        </div>
    );
}