import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import type { Message, ChatUser } from "@/types/message";

interface Props {
    messages: Message[];
    users: ChatUser[];
    onClose: () => void;
}

const MessageSearchModal = ({
    messages,
    users,
    onClose,
}: Props) => {
    const [search, setSearch] = useState("");

    const results = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return [];
        }

        return messages.filter(
            (message) =>
                message.content
                    ?.toLowerCase()
                    .includes(value) ||
                message.attachments?.some(
                    (attachment) =>
                        attachment.name
                            ?.toLowerCase()
                            .includes(value)
                )
        );
    }, [messages, search]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h2 className="font-semibold text-gray-900">
                        Rechercher dans la conversation
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-100">
                        <Search size={17} className="text-gray-400" />

                        <input
                            autoFocus
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Rechercher un message..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto px-4 pb-4">
                    {!search.trim() ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                            Saisissez un terme.
                        </p>
                    ) : results.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                            Aucun résultat.
                        </p>
                    ) : (
                        results.map((message) => {
                            const sender = users.find(
                                (user) =>
                                    user.id ===
                                    message.senderId
                            );

                            return (
                                <div
                                    key={message.id}
                                    className="rounded-lg border-b border-gray-100 px-2 py-3 transition-colors hover:bg-blue-50/50"
                                >
                                    <p className="text-xs font-semibold text-blue-600">
                                        {sender?.firstname ?? "Utilisateur"}{" "}
                                        {sender?.lastname ?? ""}
                                    </p>

                                    {message.content && (
                                        <p className="mt-1 text-sm text-gray-700">
                                            {message.content}
                                        </p>
                                    )}

                                    {message.attachments?.length > 0 && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            {message.attachments.map(
                                                (attachment) => (
                                                    <p key={attachment.id ?? attachment.name}>
                                                        📎 {attachment.name}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <p className="mt-1 text-[10px] text-gray-400">
                                        {new Date(
                                            message.createdAt
                                        ).toLocaleString("fr-FR")}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageSearchModal;