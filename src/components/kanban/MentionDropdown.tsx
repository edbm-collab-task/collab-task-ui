import type { UserResponse } from "@/types/user";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { getInitialsFromParts } from "@/utils/avatar";

interface Props {
    users: UserResponse[];
    query: string;
    onSelect: (user: UserResponse) => void;
    onClose: () => void;
}

export default function MentionDropdown({ users, query, onSelect, onClose }: Props) {
    const ref = useClickOutside<HTMLDivElement>(onClose);
    useEscapeKey(onClose);

    const filtered = users.filter(u => {
        const q = query.toLowerCase();
        return (
            u.firstname.toLowerCase().includes(q) ||
            u.lastname.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
    }).slice(0, 8);

    if (filtered.length === 0) return null;

    return (
        <div
            ref={ref}
            className="absolute bottom-full left-0 z-20 mb-1 w-64 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg custom-scrollbar"
        >
            {filtered.map(user => {
                const initials = getInitialsFromParts(user.firstname, user.lastname);
                return (
                    <button
                        key={user.id}
                        type="button"
                        onClick={() => onSelect(user)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-blue-50"
                    >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                            {initials}
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
