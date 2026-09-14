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
import type { ChatUser } from "@/types/message";

interface Props {
    users: ChatUser[];
    replyMessage: { id?: number; content: string } | null;
    onCancelReply: () => void;
    onSend: (content: string, files: File[]) => Promise<void>;
}

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

    const fileRef = useRef<HTMLInputElement | null>(null);

    /**
     * Gestion des fichiers sélectionnés
     */
    const handleFiles = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const fileList = event.target.files;

        if (!fileList) return;

        setFiles((current) => [
            ...current,
            ...Array.from(fileList),
        ]);

        // Permet de sélectionner à nouveau le même fichier
        event.target.value = "";
    };

    /**
     * Supprimer un fichier
     */
    const removeFile = (index: number) => {
        setFiles((current) =>
            current.filter(
                (_, fileIndex) => fileIndex !== index
            )
        );
    };

    /**
     * Envoyer le message
     */
    const send = async () => {
        if (
            (!content.trim() && files.length === 0) ||
            sending
        ) {
            return;
        }

        setSending(true);

        try {
            await onSend(content.trim(), files);

            // Reset après envoi réussi
            setContent("");
            setFiles([]);
            onCancelReply();

            // Fermer les popups
            setShowEmoji(false);
            setShowMention(false);
        } catch (error) {
            console.error(
                "Erreur lors de l'envoi :",
                error
            );
        } finally {
            setSending(false);
        }
    };

    /**
     * Gestion du clavier
     *
     * Enter = envoyer
     * Shift + Enter = nouvelle ligne
     */
    const keyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            void send();
        }
    };

    /**
     * Ajouter un emoji
     */
    const addEmoji = (emoji: string) => {
        setContent((current) => current + emoji);
        setShowEmoji(false);
    };

    /**
     * Ajouter une mention
     */
    const addMention = (user: ChatUser) => {
        setContent(
            (current) =>
                `${current}${current ? " " : ""}@${user.firstname} ${user.lastname} `
        );

        setShowMention(false);
    };

    /**
     * Ajouter un lien
     */
    const addLink = () => {
        setContent(
            (current) =>
                `${current}${current ? " " : ""}https://`
        );
    };

    return (
        <div className="shrink-0 border-t border-gray-200 bg-white p-4">

            {/* =========================
                REPLY MESSAGE
            ========================== */}
            {replyMessage && (
                <div className="mx-auto mb-2 flex max-w-5xl items-center justify-between rounded-lg border-l-2 border-blue-500 bg-blue-50 px-3 py-2">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-blue-600">
                            Réponse
                        </p>

                        <p className="max-w-lg truncate text-xs text-gray-500">
                            {replyMessage.content ||
                                "Pièce jointe"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="ml-3 text-gray-400 transition-colors hover:text-gray-700"
                        title="Annuler la réponse"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* =========================
                FILES PREVIEW
            ========================== */}
            {files.length > 0 && (
                <div className="mx-auto mb-3 flex max-w-5xl flex-wrap gap-2">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                        >
                            <FileText
                                size={16}
                                className="shrink-0 text-blue-600"
                            />

                            <div className="flex min-w-0 flex-col">
                                <span className="max-w-[180px] truncate text-xs text-gray-600">
                                    {file.name}
                                </span>

                                <span className="text-[10px] text-gray-400">
                                    {formatFileSize(
                                        file.size
                                    )}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    removeFile(index)
                                }
                                className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                                title="Supprimer le fichier"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* =========================
                COMPOSER
            ========================== */}
            <div className="relative mx-auto max-w-5xl rounded-xl border border-gray-300 bg-white shadow-sm transition-colors focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">

                {/* =========================
                    TOOLBAR
                ========================== */}
                <div className="flex items-center gap-1 border-b border-gray-100 px-3 py-2">

                    <button
                        type="button"
                        title="Gras"
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Bold size={15} />
                    </button>

                    <button
                        type="button"
                        title="Italique"
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Italic size={15} />
                    </button>

                    <button
                        type="button"
                        title="Lien"
                        onClick={addLink}
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Link size={15} />
                    </button>

                    <button
                        type="button"
                        title="Liste"
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <List size={15} />
                    </button>
                </div>

                {/* =========================
                    TEXTAREA
                ========================== */}
                <textarea
                    value={content}
                    onChange={(event) =>
                        setContent(event.target.value)
                    }
                    onKeyDown={keyDown}
                    placeholder="Écrire un message..."
                    rows={3}
                    disabled={sending}
                    className="block min-h-[80px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {/* =========================
                    BOTTOM ACTIONS
                ========================== */}
                <div className="flex items-center justify-between px-3 pb-3">

                    {/* LEFT ACTIONS */}
                    <div className="relative flex items-center gap-1">

                        {/* FILE */}
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
                                onChange={handleFiles}
                                disabled={sending}
                            />
                        </label>

                        {/* EMOJI */}
                        <button
                            type="button"
                            title="Emoji"
                            onClick={() => {
                                setShowEmoji(
                                    (value) => !value
                                );
                                setShowMention(false);
                            }}
                            disabled={sending}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                        >
                            <Smile size={18} />
                        </button>

                        {/* MENTION */}
                        <button
                            type="button"
                            title="Mentionner"
                            onClick={() => {
                                setShowMention(
                                    (value) => !value
                                );
                                setShowEmoji(false);
                            }}
                            disabled={sending}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                        >
                            <AtSign size={17} />
                        </button>

                        {/* EMOJI PICKER */}
                        {showEmoji && (
                            <EmojiPicker
                                onSelect={addEmoji}
                            />
                        )}

                        {/* MENTION PICKER */}
                        {showMention && (
                            <MentionPicker
                                users={users}
                                onSelect={addMention}
                            />
                        )}
                    </div>

                    {/* SEND BUTTON */}
                    <button
                        type="button"
                        onClick={() => void send()}
                        disabled={
                            sending ||
                            (!content.trim() &&
                                files.length === 0)
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

/**
 * Formater la taille d'un fichier
 */
const formatFileSize = (
    bytes: number
): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    }

    return `${(
        bytes /
        (1024 * 1024 * 1024)
    ).toFixed(1)} GB`;
};

export default MessageComposer;