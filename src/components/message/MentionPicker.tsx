import type { ChatUser } from "@/types/message";

interface Props {
    users: ChatUser[];
    onSelect: (user: ChatUser) => void;
}

const MentionPicker = ({ users, onSelect }: Props) => {
    return (
        <div className="absolute bottom-12 left-10 z-30 w-64 animate-fade-in overflow-hidden rounded-xl border border-primary/20 bg-white shadow-lg">
            <div className="border-b border-secondary/40 px-3 py-2 text-xs font-semibold text-primary/50">Mentionner un membre</div>

            <div className="max-h-52 overflow-y-auto">
                {users.map((user) => (
                    <button key={user.id} onClick={() => onSelect(user)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary/40 transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                            {user.firstname[0]}{user.lastname[0]}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-primary">{user.firstname} {user.lastname}</p>
                            <p className="truncate text-[11px] text-primary/40">{user.email}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MentionPicker;