import { useMemo, useState } from "react";
import { Check, Search, Users, X } from "lucide-react";
import type { ChatUser } from "@/types/message";
import { useMultiSelect } from "@/hooks/useMultiSelect";

interface Props {
    users: ChatUser[];
    onClose: () => void;
    onCreate: (name: string, memberIds: number[]) => void;
}

const CreateGroupModal = ({ users, onClose, onCreate }: Props) => {
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const { selected, toggle } = useMultiSelect<number>([]);

    const filtered = useMemo(() => {
        const value = search.toLowerCase().trim();

        return users.filter((user) => {
            if (user.id === 1) return false;
            return !value || `${user.firstname} ${user.lastname} ${user.email}`.toLowerCase().includes(value);
        });
    }, [users, search]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl border border-secondary/60 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-secondary/60 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 text-primary">
                            <Users size={20} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-primary">Créer un groupe</h2>
                            <p className="text-xs text-primary/40">Ajoutez les membres</p>
                        </div>
                    </div>

                    <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom du groupe" className="h-10 w-full rounded-xl border border-secondary/60 px-3 text-sm outline-none transition-colors placeholder:text-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15" />

                    <div className="flex h-10 items-center gap-2 rounded-xl border border-secondary/60 bg-secondary/20 px-3 transition-colors focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/15">
                        <Search size={17} className="text-primary/40" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un membre..." className="w-full bg-transparent text-sm outline-none placeholder:text-primary/40" />
                    </div>

                    <div className="max-h-64 overflow-y-auto rounded-xl border border-secondary/60">
                        {filtered.map((user) => {
                            const active = selected.includes(user.id);

                            return (
                                <button key={user.id} type="button" onClick={() => toggle(user.id)} className={`flex w-full items-center gap-3 border-b border-secondary/30 px-3 py-3 text-left transition-colors last:border-0 ${active ? "bg-secondary/50" : "hover:bg-secondary/30"}`}>
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-secondary text-primary" : "bg-secondary/50 text-primary/60"}`}>
                                        {user.firstname[0]}
                                        {user.lastname[0]}
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

                        {filtered.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <Search size={28} className="mx-auto text-secondary" />
                                <p className="mt-2 text-sm font-medium text-primary/70">Aucun membre trouvé</p>
                                <p className="mt-1 text-xs text-primary/40">Essayez avec un autre nom ou email.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-secondary/60 px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm text-primary/70 transition-colors hover:bg-secondary/50 hover:text-primary">
                        Annuler
                    </button>

                    <button type="button" disabled={!name.trim() || selected.length === 0} onClick={() => onCreate(name, selected)} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                        Créer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;