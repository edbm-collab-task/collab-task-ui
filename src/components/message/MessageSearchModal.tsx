import { useMemo, useState } from "react";
import { Search, X, Paperclip } from "lucide-react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl border border-secondary/60 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-secondary/60 px-5 py-4">
                    <h2 className="font-semibold text-primary">
                        Rechercher dans la conversation
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex h-10 items-center gap-2 rounded-xl border border-secondary/60 bg-secondary/20 px-3 transition-colors focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/15">
                        <Search size={17} className="text-primary/40" />

                        <input
                            autoFocus
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Rechercher un message..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-primary/40"
                        />
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto px-4 pb-4">
                    {!search.trim() ? (
                        <p className="py-8 text-center text-sm text-primary/40">
                            Saisissez un terme.
                        </p>
                    ) : results.length === 0 ? (
                        <p className="py-8 text-center text-sm text-primary/40">
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
                                    className="rounded-xl border-b border-secondary/30 px-2 py-3 transition-colors hover:bg-secondary/30"
                                >
                                    <p className="text-xs font-semibold text-accent">
                                        {sender?.firstname ?? "Utilisateur"}{" "}
                                        {sender?.lastname ?? ""}
                                    </p>

                                    {message.content && (
                                        <p className="mt-1 text-sm text-primary">
                                            {message.content}
                                        </p>
                                    )}

                                    {message.attachments?.length > 0 && (
                                        <div className="mt-1 text-xs text-primary/50">
                                            {message.attachments.map(
                                                (attachment) => (
                                                    <p key={attachment.id ?? attachment.name} className="flex items-center gap-1.5">
                                                        <Paperclip size={12} className="text-accent" />
                                                        {attachment.name}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <p className="mt-1 text-[10px] text-primary/40">
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