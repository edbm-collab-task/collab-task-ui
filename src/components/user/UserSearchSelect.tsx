import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

import type { UserResponse } from "@/types/user";
import { useClickOutside } from "@/hooks/useClickOutside";

interface Props {
    users: UserResponse[];
    value: number | null;
    onChange: (userId: number | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    allowClear?: boolean;
}

const fullName = (user: UserResponse) =>
    `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();

export default function UserSearchSelect({
    users,
    value,
    onChange,
    placeholder = "Sélectionner…",
    searchPlaceholder = "Rechercher…",
    allowClear = true,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useClickOutside<HTMLDivElement>(() => {
        setOpen(false);
        setQuery("");
    });
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = users.find(u => u.id === value) ?? null;

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u =>
            fullName(u).toLowerCase().includes(q)
            || (u.email ?? "").toLowerCase().includes(q)
        );
    }, [users, query]);

    const openDropdown = () => {
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleSelect = (id: number) => {
        onChange(id);
        setOpen(false);
        setQuery("");
    };

    const handleClear = (event: ReactMouseEvent) => {
        event.stopPropagation();
        onChange(null);
        setQuery("");
    };

    return (
        <div ref={containerRef} className="relative w-full flex-1">
            {open ? (
                <>
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-xl border border-primary px-9 py-2 text-sm text-gray-800 outline-none ring-1 ring-primary/30"
                    />
                </>
            ) : (
                <button
                    type="button"
                    onClick={openDropdown}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-300 px-3 py-2 text-left text-sm transition hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                    <span className={`truncate ${selected ? "text-gray-800" : "text-gray-400"}`}>
                        {selected ? `${fullName(selected)} (${selected.email})` : placeholder}
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                        {allowClear && selected && (
                            <X
                                size={14}
                                className="text-gray-400 transition hover:text-accent"
                                onClick={handleClear}
                            />
                        )}
                        <ChevronDown size={15} className="text-gray-400" />
                    </span>
                </button>
            )}

            {open && (
                <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg custom-scrollbar">
                    {results.length > 0 ? (
                        results.map(u => (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelect(u.id)}
                                className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-secondary/40"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary">
                                    {u.firstname?.[0]}{u.lastname?.[0]}
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium text-gray-700">{fullName(u)}</span>
                                    <span className="block truncate text-[11px] text-gray-400">{u.email}</span>
                                </span>
                                {u.id === value && <Check size={15} className="ml-auto shrink-0 text-accent" />}
                            </button>
                        ))
                    ) : (
                        <p className="px-3 py-2 text-xs text-gray-400">Aucun résultat.</p>
                    )}
                </div>
            )}
        </div>
    );
}