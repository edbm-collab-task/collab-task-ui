import { useMemo, useState } from "react";
import {
    Archive,
    Inbox,
    MessageSquarePlus,
    Paperclip,
    Pin,
    Search,
    Users,
} from "lucide-react";
import DOMPurify from "dompurify";

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

const initials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((item) => item[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const getUserImageUrl = (
    userId: number,
    avatar: string | null | undefined
): string | null => {
    if (!avatar || avatar.trim() === "") {
        return null;
    }

    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/image`;
};

const ConversationSidebar = ({
    conversations,
    users,
    messages: _messages,
    currentUserId,
    selectedId,
    onSelect,
    onNewConversation,
    onCreateGroup,
}: Props) => {
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);

    const filtered = useMemo(() => {
        const value = search.trim().toLowerCase();

        return conversations.filter((conversation) => {
            const user =
                conversation.type === "private"
                    ? users.find(
                          (item) =>
                              conversation.memberIds.includes(item.id) &&
                              item.id !== currentUserId
                      )
                    : undefined;

            const displayName =
                conversation.type === "group"
                    ? conversation.name || "Groupe"
                    : user
                      ? `${user.firstname} ${user.lastname}`
                      : conversation.name || "Conversation";

            return (
                conversation.archived === showArchived &&
                (!value || displayName.toLowerCase().includes(value))
            );
        });
    }, [
        conversations,
        users,
        currentUserId,
        search,
        showArchived,
    ]);

    const privateUser = (
        conversation: Conversation
    ): ChatUser | undefined => {
        if (conversation.type !== "private") {
            return undefined;
        }

        return users.find(
            (user) =>
                conversation.memberIds.includes(user.id) &&
                user.id !== currentUserId
        );
    };

    const handleImageError = (
        event: React.SyntheticEvent<HTMLImageElement>
    ) => {
        event.currentTarget.style.display = "none";

        const fallback = event.currentTarget.nextElementSibling;

        if (fallback instanceof HTMLElement) {
            fallback.style.display = "flex";
        }
    };

    /**
     * Même logique que MessageItem :
     * on autorise uniquement les balises nécessaires au formatage.
     */
    const renderLastMessage = (message: Message | null | undefined) => {
        if (!message) {
            return (
                <span className="text-xs text-gray-400">
                    Commencez à discuter...
                </span>
            );
        }

        if (message.deleted) {
            return (
                <span className="text-xs italic text-gray-400">
                    Message supprimé
                </span>
            );
        }

        if (
            !message.content &&
            message.attachments &&
            message.attachments.length > 0
        ) {
            return (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Paperclip size={12} className="shrink-0" />
                    Pièce jointe
                </span>
            );
        }

        if (!message.content) {
            return null;
        }

        const sanitizedContent = DOMPurify.sanitize(
            message.content,
            {
                ALLOWED_TAGS: [
                    "b",
                    "strong",
                    "i",
                    "em",
                    "u",
                    "br",
                ],
                ALLOWED_ATTR: [],
            }
        );

        return (
            <span
                className="truncate text-xs text-gray-500 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline"
                dangerouslySetInnerHTML={{
                    __html: sanitizedContent,
                }}
            />
        );
    };

    return (
        <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-secondary/60 bg-bg sm:w-[320px]">
            {/* Header */}
            <div className="flex h-[72px] items-center justify-between border-b border-secondary/60 px-3 sm:px-4">
                <div>
                    <h1 className="text-lg font-semibold text-primary">
                        Messages
                    </h1>

                    <p className="text-xs text-primary/50">
                        {conversations.length} conversations
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onNewConversation}
                        title="Nouvelle conversation"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <MessageSquarePlus size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={onCreateGroup}
                        title="Créer un groupe"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <Users size={18} />
                    </button>
                </div>
            </div>

            {/* Recherche */}
            <div className="p-3">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-secondary/60 bg-white px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                    <Search
                        size={17}
                        className="text-primary/40"
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Rechercher..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                </div>

                <div className="mt-2 flex gap-1">
                    <button
                        type="button"
                        onClick={() => setShowArchived(false)}
                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            !showArchived
                                ? "bg-secondary text-primary"
                                : "text-primary/60 hover:bg-secondary/50 hover:text-primary"
                        }`}
                    >
                        Discussions
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowArchived(true)}
                        className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            showArchived
                                ? "bg-secondary text-primary"
                                : "text-primary/60 hover:bg-secondary/50 hover:text-primary"
                        }`}
                    >
                        <Archive size={13} />
                        Archivées
                    </button>
                </div>
            </div>

            {/* Conversations */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                {filtered.length === 0 ? (
                    <div className="px-4 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
                            <Inbox size={22} />
                        </div>

                        <p className="mt-3 text-sm font-medium text-primary">
                            Aucune conversation
                        </p>

                        <button
                            type="button"
                            onClick={onNewConversation}
                            className="mt-2 text-xs font-medium text-accent transition-colors hover:text-primary hover:underline"
                        >
                            Commencer une discussion
                        </button>
                    </div>
                ) : (
                    filtered.map((conversation) => {
                        const user = privateUser(conversation);
                        const active =
                            selectedId === conversation.id;

                        const displayName =
                            conversation.type === "group"
                                ? conversation.name || "Groupe"
                                : user
                                  ? `${user.firstname} ${user.lastname}`
                                  : conversation.name ||
                                    "Conversation";

                        const imageUrl =
                            conversation.type === "private" &&
                            user
                                ? getUserImageUrl(
                                      user.id,
                                      user.avatar
                                  )
                                : null;

                        const last = conversation.lastMessage;

                        const lastMessageTime = last
                            ? new Date(
                                  last.createdAt
                              ).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "";

                        return (
                            <button
                                key={conversation.id}
                                type="button"
                                onClick={() =>
                                    onSelect(conversation)
                                }
                                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                                    active
                                        ? "bg-secondary"
                                        : "hover:bg-secondary/50"
                                }`}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className="h-11 w-11 overflow-hidden rounded-full">
                                        {imageUrl ? (
                                            <>
                                                <img
                                                    src={imageUrl}
                                                    alt={displayName}
                                                    className="h-full w-full object-cover"
                                                    onError={
                                                        handleImageError
                                                    }
                                                />

                                                <div
                                                    className={`hidden h-full w-full items-center justify-center text-sm font-semibold ${
                                                        active
                                                            ? "bg-primary/15 text-primary"
                                                            : "bg-secondary/70 text-primary"
                                                    }`}
                                                >
                                                    {conversation.type ===
                                                    "group"
                                                        ? "G"
                                                        : initials(
                                                              displayName
                                                          )}
                                                </div>
                                            </>
                                        ) : (
                                            <div
                                                className={`flex h-full w-full items-center justify-center text-sm font-semibold ${
                                                    active
                                                        ? "bg-primary/15 text-primary"
                                                        : "bg-secondary/70 text-primary"
                                                }`}
                                            >
                                                {conversation.type ===
                                                "group"
                                                    ? "G"
                                                    : initials(
                                                          displayName
                                                      )}
                                            </div>
                                        )}
                                    </div>

                                    {conversation.type ===
                                        "private" &&
                                        user?.online && (
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                                        )}
                                </div>

                                {/* Informations */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-primary">
                                            {displayName}
                                        </p>

                                        {conversation.pinned && (
                                            <Pin
                                                size={12}
                                                className="shrink-0 text-accent"
                                            />
                                        )}
                                    </div>

                                    <div className="mt-1 flex items-center justify-between gap-2">
                                        {/* DERNIER MESSAGE AVEC FORMATAGE */}
                                        <div className="min-w-0 flex-1 truncate">
                                            {renderLastMessage(last)}
                                        </div>

                                        <span className="shrink-0 text-[10px] text-primary/40">
                                            {lastMessageTime}
                                        </span>
                                    </div>
                                </div>

                                {/* Messages non lus */}
                                {conversation.unreadCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                                        {
                                            conversation.unreadCount
                                        }
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
