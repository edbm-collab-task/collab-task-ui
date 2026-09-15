import { Archive, Check, Pin, Trash2, X } from "lucide-react";

interface Props {
    pinned: boolean;
    archived: boolean;
    group: boolean;
    onClose: () => void;
    onMarkRead: () => void;
    onPin: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onLeave: () => void;
}

const ConversationMenu = ({ pinned, archived, group, onClose, onMarkRead, onPin, onArchive, onDelete, onLeave }: Props) => {
    return (
        <div className="fixed inset-0 z-40">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="absolute right-5 top-[65px] z-50 w-56 animate-fade-in overflow-hidden rounded-xl border border-secondary/60 bg-white py-1 shadow-lg">
                <button type="button" onClick={onMarkRead} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-primary transition-colors hover:bg-secondary/50">
                    <Check size={16} />
                    Marquer comme lu
                </button>

                <button type="button" onClick={onPin} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-primary transition-colors hover:bg-secondary/50">
                    <Pin size={16} />
                    {pinned ? "Désépingler" : "Épingler"}
                </button>

                <button type="button" onClick={onArchive} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-primary transition-colors hover:bg-secondary/50">
                    <Archive size={16} />
                    {archived ? "Désarchiver" : "Archiver"}
                </button>

                {group && (
                    <button type="button" onClick={onLeave} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-accent transition-colors hover:bg-accent/10">
                        <X size={16} />
                        Quitter le groupe
                    </button>
                )}

                <button type="button" onClick={onDelete} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
                    <Trash2 size={16} />
                    Supprimer
                </button>
            </div>
        </div>
    );
};

export default ConversationMenu;