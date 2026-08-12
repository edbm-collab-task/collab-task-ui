import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface FilterOption<T = string> {
    label: string;
    value: T;
    icon?: React.ReactNode;
    onSelect?: (value: T) => void;
}

interface TableFilterProps<T = string> {
    value: T;
    options: FilterOption<T>[];
    onChange?: (value: T) => void;
    placeholder?: string;
}

export default function TableFilter<T = string>({
    value,
    options,
    onChange,
    placeholder = "Filtrer",
}: TableFilterProps<T>) {

    const [open, setOpen] = useState(false);

    const selected = options.find(
        option => option.value === value
    );

    const handleSelect = (option: FilterOption<T>) => {
        onChange?.(option.value);
        option.onSelect?.(option.value);
        setOpen(false);
    };

    return (
        <div className="relative w-40">

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-10 w-full items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
                <span className="flex items-center gap-2">
                    {selected?.icon}
                    {selected?.label ?? placeholder}
                </span>

                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-lg bg-white p-1 shadow-lg ring-1 ring-gray-200">

                    {options.map((option) => {
                        const isSelected = option.value === value;

                        return (
                            <button
                                key={String(option.value)}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                                    isSelected
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {option.icon}
                                    {option.label}
                                </span>

                                {isSelected && (
                                    <Check size={16} />
                                )}
                            </button>
                        );
                    })}

                </div>
            )}

        </div>
    );
}