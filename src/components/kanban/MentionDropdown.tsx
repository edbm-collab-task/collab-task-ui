import { useEffect, useRef } from "react";
import type { UserResponse } from "@/types/user";

interface Props {
    users: UserResponse[];
    query: string;
    onSelect: (user: UserResponse) => void;
    onClose: () => void;
}

export default function MentionDropdown({ users, query, onSelect, onClose }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    const filtered = users.filter(u => {
        const q = query.toLowerCase();
        return (
            u.firstname.toLowerCase().includes(q) ||
            u.lastname.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
    }).slice(0, 8);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    if (filtered.length === 0) return null;

    return (
        <div
            ref={ref}
            className="absolute bottom-full left-0 z-20 mb-1 w-64 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg custom-scrollbar"
        >
            {filtered.map(user => {
                const initials = (user.firstname?.[0] ?? "") + (user.lastname?.[0] ?? "");
                return (
                    <button
                        key={user.id}
                        type="button"
                        onClick={() => onSelect(user)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-blue-50"
                    >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                            {initials.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                                {user.firstname} {user.lastname}
                            </p>
                            <p className="truncate text-xs text-gray-400">{user.email}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
