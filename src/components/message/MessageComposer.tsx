import { useRef, useState } from "react";
import {
    AtSign,
    Bold,
    FileText,
    Italic,
    Link,
    List,
    Paperclip,
    Send,
    Smile,
    X,
} from "lucide-react";

import EmojiPicker from "./EmojiPicker";
import MentionPicker from "./MentionPicker";

import type {
    Attachment,
    ChatUser,
} from "@/types/message";

interface Props {
    users: ChatUser[];
    replyMessage: {
        content: string;
    } | null;
    onCancelReply: () => void;
    onSend: (
        content: string,
        attachments: Attachment[]
    ) => Promise<void>;
}

const readFile = (
    file: File
): Promise<Attachment> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve({
                id:
                    Date.now() +
                    Math.floor(
                        Math.random() * 10000
                    ),
                name: file.name,
                type:
                    file.type ||
                    "application/octet-stream",
                size: file.size,
                url: reader.result as string,
            });
        };

        reader.onerror = () =>
            reject(
                new Error(
                    "Erreur lors de la lecture."
                )
            );

        reader.readAsDataURL(file);
    });
};

const MessageComposer = ({
    users,
    replyMessage,
    onCancelReply,
    onSend,
}: Props) => {
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showMention, setShowMention] = useState(false);
    const [sending, setSending] = useState(false);

    const fileRef =
        useRef<HTMLInputElement | null>(null);

    const handleFiles = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const fileList = event.target.files;
        if (!fileList) return;

        setFiles((current) => [
            ...current,
            ...Array.from(fileList),
        ]);

        event.target.value = "";
    };

    const send = async () => {
        if (
            (!content.trim() &&
                files.length === 0) ||
            sending
        ) {
            return;
        }

        setSending(true);

        try {
            const attachments =
                await Promise.all(
                    files.map(readFile)
                );

            await onSend(
                content.trim(),
                attachments
            );

            setContent("");
            setFiles([]);
            onCancelReply();
        } finally {
            setSending(false);
        }
    };

    const keyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            send();
        }
    };

    const addEmoji = (emoji: string) => {
        setContent(
            (current) => current + emoji
        );

        setShowEmoji(false);
    };

    const addMention = (user: ChatUser) => {
        setContent(
            (current) =>
                `${current}${current ? " " : ""}@${user.firstname} ${user.lastname} `
        );

        setShowMention(false);
    };

    return (
        <div className="shrink-0 border-t border-gray-200 bg-white p-4">
            {replyMessage && (
                <div className="mx-auto mb-2 flex max-w-5xl items-center justify-between rounded-lg border-l-2 border-blue-500 bg-blue-50 px-3 py-2">
                    <div>
                        <p className="text-xs font-semibold text-blue-600">
                            Réponse
                        </p>

                        <p className="max-w-lg truncate text-xs text-gray-500">
                            {replyMessage.content ||
                                "Pièce jointe"}
                        </p>
                    </div>

                    <button
                        onClick={onCancelReply}
                        className="text-gray-400 transition-colors hover:text-gray-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {files.length > 0 && (
                <div className="mx-auto mb-3 flex max-w-5xl flex-wrap gap-2">
                    {files.map(
                        (file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                            >
                                <FileText
                                    size={16}
                                    className="text-blue-600"
                                />

                                <span className="max-w-[180px] truncate text-xs text-gray-600">
                                    {file.name}
                                </span>

                                <button
                                    onClick={() =>
                                        setFiles(
                                            (
                                                current
                                            ) =>
                                                current.filter(
                                                    (
                                                        _,
                                                        i
                                                    ) =>
                                                        i !==
                                                        index
                                                )
                                        )
                                    }
                                    className="text-gray-400 transition-colors hover:text-red-500"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}

            <div className="relative mx-auto max-w-5xl rounded-xl border border-gray-300 bg-white shadow-sm transition-colors focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">
                <div className="flex items-center gap-1 border-b border-gray-100 px-3 py-2">
                    <button
                        title="Gras"
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Bold size={15} />
                    </button>

                    <button
                        title="Italique"
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Italic size={15} />
                    </button>

                    <button
                        title="Lien"
                        onClick={() =>
                            setContent(
                                (current) =>
                                    `${current} https://`
                            )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Link size={15} />
                    </button>

                    <button
                        title="Liste"
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <List size={15} />
                    </button>
                </div>

                <textarea
                    value={content}
                    onChange={(event) =>
                        setContent(
                            event.target.value
                        )
                    }
                    onKeyDown={keyDown}
                    placeholder="Écrire un message..."
                    rows={3}
                    className="w-full resize-none px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                />

                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="relative flex items-center gap-1">
                        <label
                            title="Ajouter un fichier"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Paperclip size={17} />

                            <input
                                ref={fileRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={
                                    handleFiles
                                }
                            />
                        </label>

                        <button
                            title="Emoji"
                            onClick={() =>
                                setShowEmoji(
                                    (value) =>
                                        !value
                                )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Smile size={18} />
                        </button>

                        <button
                            title="Mentionner"
                            onClick={() =>
                                setShowMention(
                                    (value) =>
                                        !value
                                )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                            <AtSign size={17} />
                        </button>

                        {showEmoji && (
                            <EmojiPicker
                                onSelect={
                                    addEmoji
                                }
                            />
                        )}

                        {showMention && (
                            <MentionPicker
                                users={users}
                                onSelect={
                                    addMention
                                }
                            />
                        )}
                    </div>

                    <button
                        onClick={send}
                        disabled={
                            sending ||
                            (!content.trim() &&
                                files.length ===
                                    0)
                        }
                        className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {sending
                            ? "Envoi..."
                            : "Envoyer"}

                        <Send size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageComposer;