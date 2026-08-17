import {
    Copy,
    Download,
    FileText,
    MoreHorizontal,
    Reply,
    Trash2,
} from "lucide-react";

import type {
    Message,
    ChatUser,
} from "@/types/message";

interface Props {
    message: Message;
    sender: ChatUser;
    currentUserId: number;
    replyMessage?: Message;
    onReply: (message: Message) => void;
    onDelete: (messageId: number) => void;
    onCopy: (content: string) => void;
}

const MessageItem = ({
    message,
    sender,
    currentUserId,
    replyMessage,
    onReply,
    onDelete,
    onCopy,
}: Props) => {
    const mine =
        message.senderId === currentUserId;

    const time = new Date(
        message.createdAt
    ).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    if (message.deleted) {
        return (
            <div className="mb-4 flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-400">
                    {sender.firstname[0]}
                    {sender.lastname[0]}
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                            {sender.firstname}{" "}
                            {sender.lastname}
                        </span>

                        <span className="text-[11px] text-gray-400">
                            {time}
                        </span>
                    </div>

                    <p className="mt-1 text-sm italic text-gray-400">
                        Ce message a été supprimé.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="group mb-5 flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {sender.firstname[0]}
                {sender.lastname[0]}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                        {sender.firstname}{" "}
                        {sender.lastname}
                    </span>

                    <span className="text-[11px] text-gray-400">
                        {time}
                    </span>

                    <div className="ml-auto hidden items-center gap-1 group-hover:flex">
                        <button
                            onClick={() =>
                                onReply(message)
                            }
                            title="Répondre"
                            className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Reply size={14} />
                        </button>

                        <button
                            onClick={() =>
                                onCopy(
                                    message.content
                                )
                            }
                            title="Copier"
                            className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Copy size={14} />
                        </button>

                        {mine && (
                            <button
                                onClick={() =>
                                    onDelete(
                                        message.id
                                    )
                                }
                                title="Supprimer"
                                className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}

                        <button
                            title="Plus"
                            className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                            <MoreHorizontal
                                size={14}
                            />
                        </button>
                    </div>
                </div>

                {replyMessage && (
                    <div className="mt-2 rounded-lg border-l-2 border-blue-400 bg-blue-50/50 px-3 py-2">
                        <p className="text-[11px] font-semibold text-blue-600">
                            Réponse
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                            {replyMessage.content ||
                                "Pièce jointe"}
                        </p>
                    </div>
                )}

                {message.content && (
                    <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                        {message.content
                            .split("\n")
                            .map(
                                (
                                    line,
                                    index
                                ) => {
                                    const link =
                                        /^https?:\/\//.test(
                                            line
                                        );

                                    return (
                                        <span
                                            key={
                                                index
                                            }
                                        >
                                            {link ? (
                                                <a
                                                    href={
                                                        line
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 underline hover:text-blue-700"
                                                >
                                                    {
                                                        line
                                                    }
                                                </a>
                                            ) : (
                                                line
                                            )}

                                            {index <
                                                message.content.split(
                                                    "\n"
                                                )
                                                    .length -
                                                    1 && (
                                                <br />
                                            )}
                                        </span>
                                    );
                                }
                            )}
                    </div>
                )}

                {message.attachments.length >
                    0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachments.map(
                            (attachment) => {
                                const image =
                                    attachment.type.startsWith(
                                        "image/"
                                    );

                                if (image) {
                                    return (
                                        <div
                                            key={
                                                attachment.id
                                            }
                                            className="overflow-hidden rounded-lg border border-gray-200"
                                        >
                                            <img
                                                src={
                                                    attachment.url
                                                }
                                                alt={
                                                    attachment.name
                                                }
                                                className="max-h-60 max-w-sm object-cover"
                                            />

                                            <div className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2">
                                                <span className="max-w-[180px] truncate text-xs text-gray-600">
                                                    {
                                                        attachment.name
                                                    }
                                                </span>

                                                <a
                                                    href={
                                                        attachment.url
                                                    }
                                                    download={
                                                        attachment.name
                                                    }
                                                    className="text-gray-500 transition-colors hover:text-blue-600"
                                                >
                                                    <Download
                                                        size={
                                                            15
                                                        }
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <a
                                        key={
                                            attachment.id
                                        }
                                        href={
                                            attachment.url
                                        }
                                        download={
                                            attachment.name
                                        }
                                        className="flex max-w-xs items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-blue-100 hover:bg-blue-50"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                            <FileText
                                                size={
                                                    18
                                                }
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-medium text-gray-700">
                                                {
                                                    attachment.name
                                                }
                                            </p>

                                            <p className="text-[10px] text-gray-400">
                                                {(
                                                    attachment.size /
                                                    1024
                                                ).toFixed(
                                                    1
                                                )}{" "}
                                                KB
                                            </p>
                                        </div>

                                        <Download
                                            size={15}
                                            className="text-gray-400 transition-colors group-hover:text-blue-600"
                                        />
                                    </a>
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageItem;