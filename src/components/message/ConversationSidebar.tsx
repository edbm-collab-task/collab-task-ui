import { useMemo, useState } from "react";
import {
    Archive,
    MessageSquarePlus,
    Pin,
    Search,
    Users,
} from "lucide-react";

import type {
    Conversation,
    Message,
    ChatUser,
} from "@/types/message";

interface Props {
    conversations: Conversation[];
    users: ChatUser[];
    messages: Message[];
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

const ConversationSidebar = ({
    conversations,
    users,
    messages,
    selectedId,
    onSelect,
    onNewConversation,
    onCreateGroup,
}: Props) => {
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] =
        useState(false);

    const filtered = useMemo(() => {
        const value = search
            .trim()
            .toLowerCase();

        return conversations.filter(
            (conversation) =>
                conversation.archived ===
                    showArchived &&
                (!value ||
                    conversation.name
                        .toLowerCase()
                        .includes(value))
        );
    }, [
        conversations,
        search,
        showArchived,
    ]);

    const lastMessage = (
        conversationId: number
    ) => {
        const list = messages.filter(
            (message) =>
                message.conversationId ===
                conversationId
        );

        const last = list[list.length - 1];

        if (!last) return "Aucun message";

        if (last.deleted) {
            return "Message supprimé";
        }

        if (
            !last.content &&
            last.attachments.length
        ) {
            return "📎 Pièce jointe";
        }

        return last.content;
    };

    const time = (
        conversationId: number
    ) => {
        const list = messages.filter(
            (message) =>
                message.conversationId ===
                conversationId
        );

        const last = list[list.length - 1];

        if (!last) return "";

        return new Date(
            last.createdAt
        ).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const privateUser = (
        conversation: Conversation
    ) => {
        if (conversation.type !== "private") {
            return undefined;
        }

        return users.find(
            (user) =>
                conversation.memberIds.includes(
                    user.id
                ) && user.id !== 1
        );
    };

    return (
        <aside className="flex h-full w-[320px] shrink-0 flex-col border-r border-gray-200 bg-white">
            <div className="flex h-[72px] items-center justify-between border-b border-gray-200 px-4">
                <div>
                    <h1 className="text-lg font-semibold text-blue-800">
                        Messages
                    </h1>

                    <p className="text-xs text-gray-400">
                        {conversations.length}{" "}
                        conversations
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={
                            onNewConversation
                        }
                        title="Nouvelle conversation"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <MessageSquarePlus
                            size={18}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={onCreateGroup}
                        title="Créer un groupe"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Users size={18} />
                    </button>
                </div>
            </div>

            <div className="p-3">
                <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-100">
                    <Search
                        size={17}
                        className="text-gray-400"
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Rechercher..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                </div>

                <div className="mt-2 flex gap-1">
                    <button
                        type="button"
                        onClick={() =>
                            setShowArchived(false)
                        }
                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            !showArchived
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-500 hover:bg-blue-50/50 hover:text-blue-600"
                        }`}
                    >
                        Discussions
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setShowArchived(true)
                        }
                        className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            showArchived
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-500 hover:bg-blue-50/50 hover:text-blue-600"
                        }`}
                    >
                        <Archive size={13} />
                        Archivées
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                {filtered.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                        <p className="text-sm text-gray-500">
                            Aucune conversation
                        </p>

                        <button
                            type="button"
                            onClick={
                                onNewConversation
                            }
                            className="mt-3 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                        >
                            Commencer une discussion
                        </button>
                    </div>
                ) : (
                    filtered.map(
                        (conversation) => {
                            const user =
                                privateUser(
                                    conversation
                                );

                            const active =
                                selectedId ===
                                conversation.id;

                            return (
                                <button
                                    key={
                                        conversation.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        onSelect(
                                            conversation
                                        )
                                    }
                                    className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                                        active
                                            ? "bg-blue-50"
                                            : "hover:bg-blue-50/50"
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${
                                                active
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {conversation.type ===
                                            "group"
                                                ? "G"
                                                : initials(
                                                      conversation.name
                                                  )}
                                        </div>

                                        {user?.online && (
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p
                                                className={`truncate text-sm font-semibold ${
                                                    active
                                                        ? "text-blue-700"
                                                        : "text-gray-800"
                                                }`}
                                            >
                                                {
                                                    conversation.name
                                                }
                                            </p>

                                            {conversation.pinned && (
                                                <Pin
                                                    size={
                                                        12
                                                    }
                                                    className="shrink-0 text-blue-500"
                                                />
                                            )}
                                        </div>

                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <p className="truncate text-xs text-gray-500">
                                                {lastMessage(
                                                    conversation.id
                                                )}
                                            </p>

                                            <span className="shrink-0 text-[10px] text-gray-400">
                                                {time(
                                                    conversation.id
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {conversation.unreadCount >
                                        0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                                            {
                                                conversation.unreadCount
                                            }
                                        </span>
                                    )}
                                </button>
                            );
                        }
                    )
                )}
            </div>
        </aside>
    );
};

export default ConversationSidebar;