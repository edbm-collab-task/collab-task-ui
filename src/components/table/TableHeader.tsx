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
        <div className="flex flex-col gap-4 rounded-lg border-none p-5 sm:flex-row sm:items-center sm:justify-between">

            <h2 className="text-xl font-semibold text-gray-800">
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
                        className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 hover:shadow-md"
                    >
                        {action.icon}
                        {action.label}
                    </button>
                ))}

            </div>
        </div>
    );
}