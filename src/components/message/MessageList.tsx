import { useEffect, useRef } from "react";

import MessageItem from "./MessageItem";

import type {
    Message,
    ChatUser,
} from "@/types/message";

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
    currentUserId,
    onReply,
    onDelete,
    onCopy,
}: Props) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

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
                        const sender = users.find(
                            (user) =>
                                user.id === message.senderId
                        );

                        const fallbackSender: ChatUser = {
                            id: message.senderId,
                            firstname: "Utilisateur",
                            lastname: "",
                            email: "",
                            avatar: null,
                            online: false,
                        };

                        const messageSender =
                            sender ?? fallbackSender;

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
                                    currentUserId={
                                        currentUserId
                                    }
                                    replyMessage={
                                        replyMessage
                                    }
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