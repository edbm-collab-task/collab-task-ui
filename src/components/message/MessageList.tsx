import { useEffect, useRef, useState } from "react";

import MessageItem from "./MessageItem";

import type { Message, ChatUser } from "@/types/message";

import { userService } from "@/services/user/user.service";

interface Props {
    messages: Message[];
    users: ChatUser[];
    currentUserId: number;
    onReply: (message: Message) => void;
    onDelete: (messageId: number) => void;
    onCopy: (content: string) => void;
}

const MessageList = ({
    messages,
    users,
    currentUserId: _currentUserId,
    onReply,
    onDelete,
    onCopy,
}: Props) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

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

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const getUserById = (userId: number): ChatUser => {
        const user = loadedUsers.find(
            (item) => item.id === userId
        );

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
        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5">
            <div className="mx-auto max-w-5xl">
                {messages.length === 0 ? (
                    <div className="flex min-h-[400px] items-center justify-center text-center">
                        <div>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                                💬
                            </div>

                            <p className="mt-3 text-sm font-medium text-gray-700">
                                Aucun message
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
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
                                ? messages.find(
                                      (item) =>
                                          item.id ===
                                          message.replyToId
                                  )
                                : undefined;

                        return (
                            <div key={message.id}>
                                {showDate && (
                                    <div className="my-5 flex justify-center">
                                        <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-xs font-medium text-blue-600">
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

                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default MessageList;