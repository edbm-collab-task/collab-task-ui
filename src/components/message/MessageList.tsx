import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { LoaderCircle, MessageCircle } from "lucide-react";

import MessageItem from "./MessageItem";

import type { Message, ChatUser } from "@/types/message";

import { userService } from "@/services/user/user.service";

interface Props {
    messages: Message[];
    users: ChatUser[];
    currentUserId: number;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    onLoadOlder?: () => void;
    scrollToBottomSignal?: number;
    onReply: (message: Message) => void;
    onDelete: (messageId: number) => void;
    onCopy: (content: string) => void;
}

// Défilement suffisant vers le haut pour déclencher le chargement de la page
// précédente.
const LOAD_OLDER_THRESHOLD_PX = 120;

// Distance au bas tolérée pour considérer l'utilisateur « collé » au bas.
const NEAR_BOTTOM_THRESHOLD_PX = 120;

const MessageList = ({
    messages,
    users,
    currentUserId: _currentUserId,
    hasMore = false,
    isLoadingMore = false,
    onLoadOlder,
    scrollToBottomSignal = 0,
    onReply,
    onDelete,
    onCopy,
}: Props) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Relevé de la position avant un préfixe, pour la restituer ensuite.
    const anchorRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);

    const isNearBottomRef = useRef(true);
    const lastConversationIdRef = useRef<number | null>(null);
    const isFirstBottomSignalRef = useRef(true);

    const [loadedUsers, setLoadedUsers] = useState<ChatUser[]>(users);
    const loadingUserIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        setLoadedUsers((previousUsers) => {
            const usersMap = new Map<number, ChatUser>();

            previousUsers.forEach((user) => {
                usersMap.set(user.id, user);
            });

            users.forEach((user) => {
                usersMap.set(user.id, user);
            });

            return Array.from(usersMap.values());
        });
    }, [users]);

    useEffect(() => {
        const loadMissingUsers = async () => {
            const senderIds = [
                ...new Set(
                    messages.map(
                        (message) => message.senderId
                    )
                ),
            ];

            const missingUserIds = senderIds.filter(
                (id) =>
                    !loadedUsers.some(
                        (user) => user.id === id
                    ) &&
                    !loadingUserIds.current.has(id)
            );

            if (missingUserIds.length === 0) {
                return;
            }

            missingUserIds.forEach((id) => {
                loadingUserIds.current.add(id);
            });

            const results = await Promise.all(
                missingUserIds.map(async (id) => {
                    try {
                        return await userService.getById(id);
                    } catch (error) {
                        console.error(
                            `Impossible de récupérer l'utilisateur ${id}`,
                            error
                        );

                        return null;
                    } finally {
                        loadingUserIds.current.delete(id);
                    }
                })
            );

            const newUsers: ChatUser[] = results
                .filter(
                    (
                        user
                    ): user is NonNullable<typeof user> =>
                        user !== null
                )
                .map((user) => ({
                    id: user.id,
                    firstname: user.firstname ?? "",
                    lastname: user.lastname ?? "",
                    email: user.email ?? "",
                    avatar: user.imagePath ?? null,
                    online: user.status ?? false,
                }));

            if (newUsers.length === 0) {
                return;
            }

            setLoadedUsers((previousUsers) => {
                const usersMap = new Map<number, ChatUser>();

                previousUsers.forEach((user) => {
                    usersMap.set(user.id, user);
                });

                newUsers.forEach((user) => {
                    usersMap.set(user.id, user);
                });

                return Array.from(usersMap.values());
            });
        };

        void loadMissingUsers();
    }, [messages, users, loadedUsers]);

    // Recherche d'un message ou d'un utilisateur par identifiant : évite un
    // parcours linéaire de la liste pour chaque message rendu.
    const messagesById = useMemo(
        () => new Map(messages.map((message) => [message.id, message])),
        [messages]
    );

    const usersById = useMemo(() => {
        const map = new Map<number, ChatUser>();

        loadedUsers.forEach((user) => {
            map.set(user.id, user);
        });

        return map;
    }, [loadedUsers]);

    const scrollToBottom = (smooth: boolean) => {
        const element = containerRef.current;

        if (!element) {
            return;
        }

        isNearBottomRef.current = true;

        if (smooth) {
            element.scrollTo({
                top: element.scrollHeight,
                behavior: "smooth",
            });
            return;
        }

        element.scrollTop = element.scrollHeight;
    };

    const handleScroll = () => {
        const element = containerRef.current;

        if (!element) {
            return;
        }

        const distanceToBottom =
            element.scrollHeight -
            element.scrollTop -
            element.clientHeight;

        isNearBottomRef.current =
            distanceToBottom <= NEAR_BOTTOM_THRESHOLD_PX;

        if (
            distanceToBottom <= NEAR_BOTTOM_THRESHOLD_PX ||
            element.scrollTop > LOAD_OLDER_THRESHOLD_PX ||
            !hasMore ||
            isLoadingMore ||
            !onLoadOlder
        ) {
            return;
        }

        /*
         * Le relevé est effectué avant l'appel afin de capturer la hauteur
         * réelle du contenu au moment où l'utilisateur a déclenché le
         * chargement.
         */
        anchorRef.current = {
            scrollHeight: element.scrollHeight,
            scrollTop: element.scrollTop,
        };

        onLoadOlder();
    };

    /*
     * Deux cas au rendu d'une nouvelle page de messages.
     *
     * - conversation changée : on se positionne au bas, comme à l'ouverture.
     * - page plus ancienne préfixée : on restitue l'offset pour que le
     *   message sous le curseur reste visuellement immobile.
     * - sinon : on ne bouge que si l'utilisateur était déjà en bas, pour ne
     *   pas interrompre la lecture de l'historique lors d'un message reçu par
     *   WebSocket.
     */
    useLayoutEffect(() => {
        const element = containerRef.current;

        if (!element) {
            return;
        }

        const conversationId = messages[0]?.conversationId ?? null;
        const conversationChanged =
            conversationId !== lastConversationIdRef.current;

        lastConversationIdRef.current = conversationId;

        if (conversationChanged) {
            anchorRef.current = null;
            scrollToBottom(false);
            return;
        }

        const anchor = anchorRef.current;

        if (anchor) {
            anchorRef.current = null;
            element.scrollTop =
                anchor.scrollTop +
                (element.scrollHeight - anchor.scrollHeight);
            return;
        }

        if (isNearBottomRef.current) {
            scrollToBottom(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    /*
     * Signal émis après l'envoi d'un message : l'utilisateur doit voir son
     * message même s'il avait fait défiler vers le haut.
     */
    useLayoutEffect(() => {
        if (isFirstBottomSignalRef.current) {
            isFirstBottomSignalRef.current = false;
            return;
        }

        scrollToBottom(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollToBottomSignal]);

    const getUserById = (userId: number): ChatUser => {
        const user = usersById.get(userId);

        if (user) {
            return user;
        }

        return {
            id: userId,
            firstname: "Utilisateur",
            lastname: "",
            email: "",
            avatar: null,
            online: false,
        };
    };

    let previousDate = "";

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/*
                * Ce chargeur est placé en frère du conteneur défilant et non
                * à l'intérieur : s'il prenait de la place dans le flux, il
                * gonflerait scrollHeight et fausserait le calcul d'ancrage du
                * scroll.
                */}
            {isLoadingMore && (
                <div className="flex shrink-0 items-center justify-center gap-2 py-2 text-xs text-primary/50">
                    <LoaderCircle
                        size={14}
                        className="animate-spin"
                    />

                    Chargement des messages plus anciens
                </div>
            )}

        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 sm:px-6"
        >
            <div className="mx-auto max-w-5xl">
                {messages.length === 0 ? (
                    <div className="flex min-h-[400px] items-center justify-center text-center">
                        <div>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                                <MessageCircle size={24} />
                            </div>

                            <p className="mt-3 text-sm font-medium text-primary">
                                Aucun message
                            </p>

                            <p className="mt-1 text-xs text-primary/50">
                                Envoyez le premier message.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => {
                        const messageSender = getUserById(
                            message.senderId
                        );

                        const date = new Date(
                            message.createdAt
                        );

                        const label =
                            date.toLocaleDateString(
                                "fr-FR",
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }
                            );

                        const showDate =
                            label !== previousDate;

                        previousDate = label;

                        const replyMessage =
                            message.replyToId
                                ? messagesById.get(
                                      message.replyToId
                                  )
                                : undefined;

                        return (
                            <div key={message.id}>
                                {showDate && (
                                    <div className="my-6 flex justify-center">
                                        <span className="rounded-full border border-secondary/60 bg-secondary/40 px-4 py-1 text-xs font-medium text-primary/70">
                                            {label}
                                        </span>
                                    </div>
                                )}

                                <MessageItem
                                    message={message}
                                    sender={messageSender}
                                    replyMessage={replyMessage}
                                    onReply={onReply}
                                    onDelete={onDelete}
                                    onCopy={onCopy}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
        </div>
    );
};

export default MessageList;