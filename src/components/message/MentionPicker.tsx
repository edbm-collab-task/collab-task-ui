import type { ChatUser } from "@/types/message";

interface Props {
    users: ChatUser[];
    onSelect: (user: ChatUser) => void;
}

const MentionPicker = ({ users, onSelect }: Props) => {
    return (
        <div className="absolute bottom-12 left-10 z-30 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-400">Mentionner un membre</div>

            <div className="max-h-52 overflow-y-auto">
                {users.map((user) => (
                    <button key={user.id} onClick={() => onSelect(user)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                            {user.firstname[0]}{user.lastname[0]}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-700">{user.firstname} {user.lastname}</p>
                            <p className="truncate text-[11px] text-gray-400">{user.email}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MentionPicker;