import { useEffect, useState } from "react";
import { Search, X, Paperclip, LoaderCircle } from "lucide-react";

import type { Message, ChatUser } from "@/types/message";

import { messageService } from "@/services/message/message.service";
import { useDebounce } from "@/hooks/useDebounce";

// En deçà de ce nombre de caractères la requête est jugée trop large.
const MIN_QUERY_LENGTH = 2;

const SEARCH_PAGE_SIZE = 20;

interface Props {
    conversationId: number;
    users: ChatUser[];
    onClose: () => void;
}

const MessageSearchModal = ({
    conversationId,
    users,
    onClose,
}: Props) => {
    const [search, setSearch] = useState("");

    const [results, setResults] = useState<Message[]>([]);

    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearch = useDebounce(search);

    const trimmedSearch = search.trim();
    const isTooShort = trimmedSearch.length < MIN_QUERY_LENGTH;

    useEffect(() => {
        /*
         * La requête est annulée si le champ change avant la fin de
         * l'appel, afin d'éviter qu'une réponse tardive n'écrase les
         * résultats d'une frappe plus récente.
         */
        let cancelled = false;

        if (debouncedSearch.trim().length < MIN_QUERY_LENGTH) {
            setResults([]);
            setIsSearching(false);

            return;
        }

        const loadResults = async () => {
            setIsSearching(true);

            try {
                const page = await messageService.searchMessages(
                    conversationId,
                    debouncedSearch.trim(),
                    { limit: SEARCH_PAGE_SIZE }
                );

                if (cancelled) {
                    return;
                }

                setResults(page.items);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Erreur lors de la recherche de messages :",
                    error
                );

                setResults([]);
            } finally {
                if (!cancelled) {
                    setIsSearching(false);
                }
            }
        };

        loadResults();

        return () => {
            cancelled = true;
        };
    }, [conversationId, debouncedSearch]);

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
                    {isTooShort ? (
                        <p className="py-8 text-center text-sm text-primary/40">
                            Saisissez au moins{" "}
                            {MIN_QUERY_LENGTH} caractères.
                        </p>
                    ) : isSearching && results.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-primary/40">
                            <LoaderCircle
                                size={15}
                                className="animate-spin"
                            />

                            Recherche en cours...
                        </div>
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

                            const hasContent =
                                message.content?.trim();

                            return (
                                <div
                                    key={message.id}
                                    className="rounded-xl border-b border-secondary/30 px-2 py-3 transition-colors hover:bg-secondary/30"
                                >
                                    <p className="text-xs font-semibold text-accent">
                                        {sender?.firstname ?? "Utilisateur"}{" "}
                                        {sender?.lastname ?? ""}
                                    </p>

                                    {hasContent && (
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