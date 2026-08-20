import { Copy, Download, File, FileImage, FileText, MoreHorizontal, Reply, Trash2 } from "lucide-react";
import type { Message, ChatUser } from "@/types/message";
import { API_CONFIG, API_ENDPOINTS } from "@/api/constants";
import useAuth from "@/hooks/useAuth";

interface Props {
    message: Message;
    sender: ChatUser;
    replyMessage?: Message;
    onReply: (message: Message) => void;
    onDelete: (messageId: number) => void;
    onCopy: (content: string) => void;
}

const getUserImageUrl = (userId: number, avatar: string | null | undefined): string | null => {
    if (!avatar || avatar.trim() === "") {
        return null;
    }

    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/image`;
};

const getAttachmentUrl = (url: string): string => {
    if (!url) {
        return "";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("blob:") ||
        url.startsWith("data:")
    ) {
        return url;
    }

    const baseUrl = API_CONFIG.BASE_URL?.replace(/\/$/, "");
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;

    return `${baseUrl}${cleanUrl}`;
};

const formatFileSize = (size: number): string => {
    if (!size || size <= 0) {
        return "0 B";
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const isImageAttachment = (attachment: Message["attachments"][number]): boolean => {
    return attachment.type?.startsWith("image/") ?? false;
};

const getFileIcon = (type: string) => {
    if (type?.startsWith("image/")) {
        return <FileImage size={22} className="text-blue-500" />;
    }

    if (type === "application/pdf") {
        return <FileText size={22} className="text-white-500" />;
    }

    if (type?.includes("word") || type?.includes("document")) {
        return <FileText size={22} className="text-blue-600" />;
    }

    return <File size={22} className="text-gray-500" />;
};

const MessageItem = ({ message, sender, replyMessage, onReply, onDelete, onCopy }: Props) => {
    const { user } = useAuth();

    const isMine =
        Boolean(user?.email) &&
        Boolean(sender?.email) &&
        user.email.trim().toLowerCase() === sender.email.trim().toLowerCase();

    const fullName = `${sender.firstname ?? ""} ${sender.lastname ?? ""}`.trim();

    const initials = `${sender.firstname?.charAt(0) ?? ""}${sender.lastname?.charAt(0) ?? ""}`.toUpperCase();

    const imageUrl = getUserImageUrl(sender.id, sender.avatar);

    const messageTime = new Date(message.createdAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const handleCopy = () => {
        if (message.content) {
            onCopy(message.content);
        }
    };

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        event.currentTarget.style.display = "none";

        const fallback = event.currentTarget.nextElementSibling;

        if (fallback instanceof HTMLElement) {
            fallback.style.display = "flex";
        }
    };

    const handleDownload = (attachment: Message["attachments"][number]) => {
        const url = getAttachmentUrl(attachment.url);

        if (!url) {
            return;
        }

        const link = document.createElement("a");

        link.href = url;
        link.download = attachment.name;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const avatar = (
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
            {imageUrl ? (
                <>
                    <img
                        src={imageUrl}
                        alt={fullName || "Utilisateur"}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                    />

                    <div className="hidden h-full w-full items-center justify-center bg-gray-200 text-xs font-semibold text-gray-700">
                        {initials || "U"}
                    </div>
                </>
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs font-semibold text-gray-700">
                    {initials || "U"}
                </div>
            )}
        </div>
    );

    const attachments = message.attachments ?? [];

    const renderAttachments = (mine: boolean) => {
        if (message.deleted || attachments.length === 0) {
            return null;
        }

        return (
            <div className={`mt-2 flex max-w-full flex-col gap-2 ${mine ? "items-end" : "items-start"}`}>
                {attachments.map((attachment) => {
                    const url = getAttachmentUrl(attachment.url);

                    if (isImageAttachment(attachment)) {
                        return (
                            <div
                                key={attachment.id ?? `${attachment.name}-${attachment.url}`}
                                className="overflow-hidden rounded-xl border border-black/10 bg-white"
                            >
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={attachment.name}
                                >
                                    <img
                                        src={url}
                                        alt={attachment.name}
                                        className="max-h-80 max-w-[320px] cursor-pointer object-contain transition hover:opacity-90"
                                        onError={(event) => {
                                            event.currentTarget.style.display = "none";
                                        }}
                                    />
                                </a>

                                <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-medium text-gray-700">
                                            {attachment.name}
                                        </p>

                                        <p className="text-[10px] text-gray-400">
                                            {formatFileSize(attachment.size)}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDownload(attachment)}
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-blue-600"
                                        title="Télécharger"
                                    >
                                        <Download size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={attachment.id ?? `${attachment.name}-${attachment.url}`}
                            className={`flex w-[280px] max-w-full items-center gap-3 rounded-xl border px-3 py-3 ${
                                mine
                                    ? "border-blue-400/40 bg-blue-400/40"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                                {getFileIcon(attachment.type)}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p
                                    className={`truncate text-sm font-medium ${
                                        mine ? "text-white" : "text-gray-800"
                                    }`}
                                    title={attachment.name}
                                >
                                    {attachment.name}
                                </p>

                                <p
                                    className={`mt-0.5 text-[11px] ${
                                        mine ? "text-blue-100" : "text-gray-400"
                                    }`}
                                >
                                    {formatFileSize(attachment.size)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDownload(attachment)}
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition ${
                                    mine
                                        ? "text-white hover:bg-white/10"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                                }`}
                                title="Télécharger"
                            >
                                <Download size={17} />
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderMessageContent = (mine: boolean) => {
        if (message.deleted) {
            return (
                <p className="whitespace-pre-wrap break-words text-sm italic opacity-70">
                    Ce message a été supprimé.
                </p>
            );
        }

        return (
            <>
                {message.content && (
                    <p className="whitespace-pre-wrap break-words text-sm">
                        {message.content}
                    </p>
                )}

                {renderAttachments(mine)}
            </>
        );
    };

    return (
        <div className={`group mb-4 flex w-full ${isMine ? "justify-end" : "justify-start"}`}>
            {!isMine && (
                <div className="flex max-w-[75%] items-end gap-2">
                    {avatar}

                    <div className="flex min-w-0 flex-col items-start">
                        <p className="mb-1 px-2 text-xs font-medium text-gray-500">
                            {fullName || "Utilisateur"}
                        </p>

                        {replyMessage && (
                            <div className="mb-1 max-w-[300px] rounded-lg border-l-2 border-blue-400 bg-gray-50 px-3 py-2 text-left text-xs text-gray-500">
                                <p className="font-medium text-blue-500">
                                    Réponse
                                </p>

                                <p className="mt-0.5 truncate">
                                    {replyMessage.content || "Pièce jointe"}
                                </p>
                            </div>
                        )}

                        <div className="w-fit max-w-full rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5 text-gray-900">
                            {renderMessageContent(false)}

                            <div className="mt-1 text-left text-[10px] text-gray-400">
                                {messageTime}
                            </div>
                        </div>

                        {!message.deleted && (
                            <MessageActions
                                message={message}
                                isMine={false}
                                onReply={onReply}
                                onDelete={onDelete}
                                onCopy={handleCopy}
                            />
                        )}
                    </div>
                </div>
            )}

            {isMine && (
                <div className="flex max-w-[75%] flex-col items-end">
                    {replyMessage && (
                        <div className="mb-1 max-w-[300px] rounded-lg border-r-2 border-blue-400 bg-gray-50 px-3 py-2 text-right text-xs text-gray-500">
                            <p className="font-medium text-blue-500">
                                Réponse
                            </p>

                            <p className="mt-0.5 truncate">
                                {replyMessage.content || "Pièce jointe"}
                            </p>
                        </div>
                    )}

                    <div className="w-fit max-w-full rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-white">
                        {renderMessageContent(true)}

                        <div className="mt-1 text-right text-[10px] text-blue-100">
                            {messageTime}
                        </div>
                    </div>

                    {!message.deleted && (
                        <MessageActions
                            message={message}
                            isMine={true}
                            onReply={onReply}
                            onDelete={onDelete}
                            onCopy={handleCopy}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

interface MessageActionsProps {
    message: Message;
    isMine: boolean;
    onReply: (message: Message) => void;
    onDelete: (messageId: number) => void;
    onCopy: () => void;
}

const MessageActions = ({ message, isMine, onReply, onDelete, onCopy }: MessageActionsProps) => {
    return (
        <div
            className={`mt-1 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${
                isMine ? "justify-end" : "justify-start"
            }`}
        >
            <button
                type="button"
                onClick={() => onReply(message)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                title="Répondre"
            >
                <Reply size={14} />
            </button>

            {message.content && (
                <button
                    type="button"
                    onClick={onCopy}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                    title="Copier"
                >
                    <Copy size={14} />
                </button>
            )}

            {isMine && (
                <button
                    type="button"
                    onClick={() => onDelete(message.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Supprimer"
                >
                    <Trash2 size={14} />
                </button>
            )}

            <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                title="Plus"
            >
                <MoreHorizontal size={14} />
            </button>
        </div>
    );
};

export default MessageItem;