import { MoreVertical, Phone, Search, UserPlus, Users, Video } from "lucide-react";
import type { Conversation, ChatUser } from "@/types/message";
import { API_CONFIG, API_ENDPOINTS } from "@/api/constants";

interface Props {
    conversation: Conversation;
    users: ChatUser[];
    currentUserId: number;
    onSearch: () => void;
    onAudioCall: () => void;
    onVideoCall: () => void;
    onMembers: () => void;
    onMenu: () => void;
}

const getUserImageUrl = (userId: number, avatar: string | null | undefined): string | null => {
    if (!avatar || avatar.trim() === "") return null;
    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/image`;
};

const ChatHeader = ({ conversation, users, currentUserId, onSearch, onAudioCall, onVideoCall, onMembers, onMenu }: Props) => {
    const user = conversation.type === "private" ? users.find((item) => conversation.memberIds.includes(item.id) && item.id !== currentUserId) : undefined;

    const name = conversation.type === "group" ? conversation.name || "Groupe" : user ? `${user.firstname} ${user.lastname}` : "Conversation";

    const getInitials = (currentUser: ChatUser) => `${currentUser.firstname?.charAt(0) ?? ""}${currentUser.lastname?.charAt(0) ?? ""}`.toUpperCase();

    const initials = user ? getInitials(user) : name.split(" ").filter(Boolean).map((item) => item[0]).join("").slice(0, 2).toUpperCase();

    const imageUrl = conversation.type === "private" && user ? getUserImageUrl(user.id, user.avatar) : null;

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        event.currentTarget.style.display = "none";
        const fallback = event.currentTarget.nextElementSibling;
        if (fallback instanceof HTMLElement) fallback.style.display = "flex";
    };

    const isOnline = conversation.type === "private" && user?.online === true;

    return (
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-secondary/60 bg-white px-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" onError={handleImageError} /> : null}
                    <div className={`h-full w-full items-center justify-center bg-secondary/70 text-sm font-semibold text-primary ${imageUrl ? "hidden" : "flex"}`}>{initials || "U"}</div>
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">{name}</p>

                    {conversation.type === "group" ? (
                        <button type="button" onClick={onMembers} className="flex items-center gap-1 text-xs text-primary/60 transition-colors hover:text-primary">
                            <Users size={13} />
                            {conversation.memberIds.length} membres
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs text-primary/60">
                            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-primary/20"}`} />
                            {isOnline ? "En ligne" : "Hors ligne"}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                {conversation.type === "group" && (
                    <button type="button" onClick={onMembers} title="Membres" className="flex h-9 w-9 items-center justify-center rounded-xl text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                        <UserPlus size={18} />
                    </button>
                )}

                <button type="button" onClick={onAudioCall} title="Appel audio" className="flex h-9 w-9 items-center justify-center rounded-xl text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                    <Phone size={18} />
                </button>

                <button type="button" onClick={onVideoCall} title="Appel vidéo" className="flex h-9 w-9 items-center justify-center rounded-xl text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                    <Video size={18} />
                </button>

                <button type="button" onClick={onSearch} title="Rechercher" className="flex h-9 w-9 items-center justify-center rounded-xl text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                    <Search size={18} />
                </button>

                <button type="button" onClick={onMenu} title="Plus" className="flex h-9 w-9 items-center justify-center rounded-xl text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                    <MoreVertical size={18} />
                </button>
            </div>
        </header>
    );
};

export default ChatHeader;