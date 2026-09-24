import { useMemo, useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import type { Conversation, ChatUser } from "@/types/message";
import { useMultiSelect } from "@/hooks/useMultiSelect";

interface Props {
    conversation: Conversation;
    users: ChatUser[];
    onClose: () => void;
    onAdd: (ids: number[]) => void;
}

const GroupMembersModal = ({ conversation, users, onClose, onAdd }: Props) => {
    const [search, setSearch] = useState("");
    const { selected, toggle } = useMultiSelect<number>([]);

    const members = users.filter((user) => conversation.memberIds.includes(user.id));

    const available = useMemo(() => {
        const value = search.toLowerCase().trim();

        return users.filter((user) => {
            if (conversation.memberIds.includes(user.id)) return false;
            return !value || `${user.firstname} ${user.lastname} ${user.email}`.toLowerCase().includes(value);
        });
    }, [users, conversation.memberIds, search]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl border border-secondary/60 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-secondary/60 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-primary">Membres du groupe</h2>
                        <p className="text-xs text-primary/40">{members.length} membres</p>
                    </div>

                    <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-5">
                    <p className="mb-2 text-xs font-semibold uppercase text-primary/40">Membres actuels</p>

                    <div className="mb-5 space-y-1">
                        {members.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-secondary/40">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/70 text-xs font-semibold text-primary">
                                    {user.firstname[0]}{user.lastname[0]}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-primary">{user.firstname} {user.lastname}</p>
                                    <p className="text-xs text-primary/40">{user.id === 1 ? "Vous" : user.email}</p>
                                </div>

                                <Check size={16} className="text-accent" />
                            </div>
                        ))}
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase text-primary/40">Ajouter des membres</p>

                    <div className="mb-3 flex h-10 items-center gap-2 rounded-xl border border-secondary/60 bg-secondary/20 px-3 transition-colors focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/15">
                        <Search size={17} className="text-primary/40" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher..." className="w-full bg-transparent text-sm outline-none placeholder:text-primary/40" />
                    </div>

                    <div className="rounded-xl border border-secondary/60">
                        {available.map((user) => {
                            const active = selected.includes(user.id);

                            return (
                                <button key={user.id} type="button" onClick={() => toggle(user.id)} className={`flex w-full items-center gap-3 border-b border-secondary/30 px-3 py-3 text-left transition-colors last:border-0 ${active ? "bg-secondary/50" : "hover:bg-secondary/30"}`}>
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-secondary text-primary" : "bg-secondary/50 text-primary/60"}`}>
                                        {user.firstname[0]}{user.lastname[0]}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-primary">{user.firstname} {user.lastname}</p>
                                        <p className="text-xs text-primary/40">{user.email}</p>
                                    </div>

                                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${active ? "border-primary bg-primary text-white" : "border-secondary/60 text-transparent"}`}>
                                        {active && <Check size={14} />}
                                    </span>
                                </button>
                            );
                        })}

                        {available.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <Search size={28} className="mx-auto text-secondary" />
                                <p className="mt-2 text-sm font-medium text-primary/70">Aucun utilisateur trouvé</p>
                                <p className="mt-1 text-xs text-primary/40">Essayez avec un autre nom ou email.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-secondary/60 px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm text-primary/70 transition-colors hover:bg-secondary/50 hover:text-primary">
                        Fermer
                    </button>

                    <button type="button" disabled={selected.length === 0} onClick={() => onAdd(selected)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                        <UserPlus size={15} />
                        Ajouter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupMembersModal;