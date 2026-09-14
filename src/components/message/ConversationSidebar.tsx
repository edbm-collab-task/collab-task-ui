import { useMemo, useState } from "react";
import { Archive, MessageSquarePlus, Pin, Search, Users } from "lucide-react";
import type { Conversation, ChatUser, Message } from "@/types/message";
import { API_CONFIG, API_ENDPOINTS } from "@/api/constants";

interface Props {
    conversations: Conversation[];
    users: ChatUser[];
    messages: Message[];
    currentUserId: number;
    selectedId: number | null;
    onSelect: (conversation: Conversation) => void;
    onNewConversation: () => void;
    onCreateGroup: () => void;
}

const initials = (name: string) => name.split(" ").filter(Boolean).map((item) => item[0]).join("").slice(0, 2).toUpperCase();

const getUserImageUrl = (userId: number, avatar: string | null | undefined): string | null => {
    if (!avatar || avatar.trim() === "") return null;
    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/image`;
};

const ConversationSidebar = ({ conversations, users, messages, currentUserId, selectedId, onSelect, onNewConversation, onCreateGroup }: Props) => {
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);

    const filtered = useMemo(() => {
        const value = search.trim().toLowerCase();

        return conversations.filter((conversation) => {
            const user = conversation.type === "private" ? users.find((item) => conversation.memberIds.includes(item.id) && item.id !== currentUserId) : undefined;

            const displayName = conversation.type === "group"
                ? conversation.name || "Groupe"
                : user
                    ? `${user.firstname} ${user.lastname}`
                    : conversation.name || "Conversation";

            return conversation.archived === showArchived && (!value || displayName.toLowerCase().includes(value));
        });
    }, [conversations, users, currentUserId, search, showArchived]);

    const privateUser = (conversation: Conversation): ChatUser | undefined => {
        if (conversation.type !== "private") return undefined;
        return users.find((user) => conversation.memberIds.includes(user.id) && user.id !== currentUserId);
    };

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        event.currentTarget.style.display = "none";
        const fallback = event.currentTarget.nextElementSibling;
        if (fallback instanceof HTMLElement) fallback.style.display = "flex";
    };

    return (
        <aside className="flex h-full w-[320px] shrink-0 flex-col border-r border-gray-200 bg-white">
            <div className="flex h-[72px] items-center justify-between border-b border-gray-200 px-4">
                <div>
                    <h1 className="text-lg font-semibold text-blue-800">Messages</h1>
                    <p className="text-xs text-gray-400">{conversations.length} conversations</p>
                </div>

                <div className="flex items-center gap-1">
                    <button type="button" onClick={onNewConversation} title="Nouvelle conversation" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600">
                        <MessageSquarePlus size={18} />
                    </button>

                    <button type="button" onClick={onCreateGroup} title="Créer un groupe" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600">
                        <Users size={18} />
                    </button>
                </div>
            </div>

            <div className="p-3">
                <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-100">
                    <Search size={17} className="text-gray-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher..." className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400" />
                </div>

                <div className="mt-2 flex gap-1">
                    <button type="button" onClick={() => setShowArchived(false)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${!showArchived ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-blue-50/50 hover:text-blue-600"}`}>
                        Discussions
                    </button>

                    <button type="button" onClick={() => setShowArchived(true)} className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${showArchived ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-blue-50/50 hover:text-blue-600"}`}>
                        <Archive size={13} />
                        Archivées
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                {filtered.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                        <p className="text-sm text-gray-500">Aucune conversation</p>
                        <button type="button" onClick={onNewConversation} className="mt-3 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline">
                            Commencer une discussion
                        </button>
                    </div>
                ) : (
                    filtered.map((conversation) => {
                        const user = privateUser(conversation);
                        const active = selectedId === conversation.id;

                        const displayName = conversation.type === "group"
                            ? conversation.name || "Groupe"
                            : user
                                ? `${user.firstname} ${user.lastname}`
                                : conversation.name || "Conversation";

                        const imageUrl = conversation.type === "private" && user ? getUserImageUrl(user.id, user.avatar) : null;
                        const last = conversation.lastMessage;

                        let lastMessageText = "Commencez à discuter...";

                        if (last) {
                            if (last.deleted) {
                                lastMessageText = "Message supprimé";
                            } else if (!last.content && last.attachments.length > 0) {
                                lastMessageText = "📎 Pièce jointe";
                            } else {
                                lastMessageText = last.content;
                            }
                        }

                        const lastMessageTime = last
                            ? new Date(last.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                            : "";

                        return (
                            <button key={conversation.id} type="button" onClick={() => onSelect(conversation)} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${active ? "bg-blue-50" : "hover:bg-blue-50/50"}`}>
                                <div className="relative shrink-0">
                                    <div className="h-11 w-11 overflow-hidden rounded-full">
                                        {imageUrl ? (
                                            <>
                                                <img src={imageUrl} alt={displayName} className="h-full w-full object-cover" onError={handleImageError} />
                                                <div className={`hidden h-full w-full items-center justify-center text-sm font-semibold ${active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                                    {conversation.type === "group" ? "G" : initials(displayName)}
                                                </div>
                                            </>
                                        ) : (
                                            <div className={`flex h-full w-full items-center justify-center text-sm font-semibold ${active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                                {conversation.type === "group" ? "G" : initials(displayName)}
                                            </div>
                                        )}
                                    </div>

                                    {conversation.type === "private" && user?.online && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                                        {conversation.pinned && <Pin size={12} className="shrink-0 text-blue-500" />}
                                    </div>

                                    <div className="mt-1 flex items-center justify-between gap-2">
                                        <p className="truncate text-xs text-gray-500">{lastMessageText}</p>
                                        <span className="shrink-0 text-[10px] text-gray-400">{lastMessageTime}</span>
                                    </div>
                                </div>

                                {conversation.unreadCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                                        {conversation.unreadCount}
                                    </span>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </aside>
    );
};

export default ConversationSidebar;