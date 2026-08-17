import {
    MoreVertical,
    Phone,
    Search,
    UserPlus,
    Users,
    Video,
} from "lucide-react";

import type {
    Conversation,
    ChatUser,
} from "@/types/message";

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

const ChatHeader = ({
    conversation,
    users,
    currentUserId,
    onSearch,
    onAudioCall,
    onVideoCall,
    onMembers,
    onMenu,
}: Props) => {
    const user =
        conversation.type === "private"
            ? users.find(
                  (item) =>
                      conversation.memberIds.includes(
                          item.id
                      ) &&
                      item.id !== currentUserId
              )
            : undefined;

    const name =
        conversation.type === "group"
            ? conversation.name || "Groupe"
            : user
              ? `${user.firstname} ${user.lastname}`
              : "Conversation";

    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((item) => item[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {conversation.type === "private" &&
                    user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                        {name}
                    </p>

                    {conversation.type === "group" ? (
                        <button
                            type="button"
                            onClick={onMembers}
                            className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-blue-600"
                        >
                            <Users size={13} />

                            {conversation.memberIds.length}{" "}
                            membres
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    user?.online
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                }`}
                            />

                            {user?.online
                                ? "En ligne"
                                : "Hors ligne"}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                {conversation.type === "group" && (
                    <button
                        type="button"
                        onClick={onMembers}
                        title="Membres"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <UserPlus size={18} />
                    </button>
                )}

                <button
                    type="button"
                    onClick={onAudioCall}
                    title="Appel audio"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                    <Phone size={18} />
                </button>

                <button
                    type="button"
                    onClick={onVideoCall}
                    title="Appel vidéo"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                    <Video size={18} />
                </button>

                <button
                    type="button"
                    onClick={onSearch}
                    title="Rechercher"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                    <Search size={18} />
                </button>

                <button
                    type="button"
                    onClick={onMenu}
                    title="Plus"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                    <MoreVertical size={18} />
                </button>
            </div>
        </header>
    );
};

export default ChatHeader;