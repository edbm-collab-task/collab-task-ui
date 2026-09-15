import { useRef, useState } from "react";
import { AtSign, Bold, FileText, Italic, Link, List, Paperclip, Send, Smile, X } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import MentionPicker from "./MentionPicker";
import type { ChatUser } from "@/types/message";

interface Props {
    users: ChatUser[];
    replyMessage: { id?: number; content: string } | null;
    onCancelReply: () => void;
    onSend: (content: string, files: File[]) => Promise<void>;
}

const MessageComposer = ({ users, replyMessage, onCancelReply, onSend }: Props) => {
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showMention, setShowMention] = useState(false);
    const [sending, setSending] = useState(false);

    const fileRef = useRef<HTMLInputElement | null>(null);
    const editorRef = useRef<HTMLDivElement | null>(null);

    /**
     * Gestion des fichiers sélectionnés
     */
    const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;

        if (!fileList) return;

        setFiles((current) => [...current, ...Array.from(fileList)]);

        // Permet de sélectionner à nouveau le même fichier
        event.target.value = "";
    };

    /**
     * Supprimer un fichier
     */
    const removeFile = (index: number) => {
        setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    };

    /**
     * Appliquer un formatage au texte
     */
    const toggleFormat = (command: "bold" | "italic" | "insertUnorderedList") => {
        if (!editorRef.current) return;

        editorRef.current.focus();
        document.execCommand(command, false);
        setContent(editorRef.current.innerHTML);
    };

    /**
     * Ajouter un lien
     */
    const addLink = () => {
        if (!editorRef.current) return;

        editorRef.current.focus();

        const selection = window.getSelection();
        const selectedText = selection?.toString() || "";
        const url = window.prompt("Entrez l'URL :");

        if (!url) return;

        if (selectedText) {
            document.execCommand("createLink", false, url);
        } else {
            document.execCommand("insertHTML", false, `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
        }

        setContent(editorRef.current.innerHTML);
    };

    /**
     * Envoyer le message
     */
    const send = async () => {
        if (!editorRef.current || sending) return;

        const htmlContent = editorRef.current.innerHTML;
        const textContent = editorRef.current.textContent?.trim() || "";

        if (!textContent && files.length === 0) return;

        setSending(true);

        try {
            await onSend(htmlContent, files);

            setContent("");

            if (editorRef.current) {
                editorRef.current.innerHTML = "";
            }

            setFiles([]);
            onCancelReply();
            setShowEmoji(false);
            setShowMention(false);
        } catch (error) {
            console.error("Erreur lors de l'envoi :", error);
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
    const keyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void send();
        }
    };

    /**
     * Ajouter un emoji
     */
    const addEmoji = (emoji: string) => {
        if (!editorRef.current) return;

        editorRef.current.focus();
        document.execCommand("insertText", false, emoji);
        setContent(editorRef.current.innerHTML);
        setShowEmoji(false);
    };

    /**
     * Ajouter une mention
     */
    const addMention = (user: ChatUser) => {
        if (!editorRef.current) return;

        editorRef.current.focus();

        const mention = `@${user.firstname} ${user.lastname}`;

        document.execCommand("insertText", false, `${mention} `);
        setContent(editorRef.current.innerHTML);
        setShowMention(false);
    };

    return (
        <div className="shrink-0 border-t border-secondary/60 bg-white px-4 pb-4 pt-3 sm:px-6">

            {/* REPLY MESSAGE */}
            {replyMessage && (
                <div className="mx-auto mb-2 flex max-w-5xl items-center justify-between rounded-lg border-l-2 border-accent bg-secondary/40 px-3 py-2">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-primary">Réponse</p>
                        <p className="max-w-lg truncate text-xs text-primary/60">{replyMessage.content || "Pièce jointe"}</p>
                    </div>

                    <button type="button" onClick={onCancelReply} className="ml-3 rounded-md p-1 text-primary/40 transition-colors hover:bg-secondary/60 hover:text-primary" title="Annuler la réponse">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* FILES PREVIEW */}
            {files.length > 0 && (
                <div className="mx-auto mb-3 flex max-w-5xl flex-wrap gap-2">
                    {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-secondary/50 bg-secondary/40 px-3 py-2">
                            <FileText size={16} className="shrink-0 text-accent" />

                            <div className="flex min-w-0 flex-col">
                                <span className="max-w-[180px] truncate text-xs text-primary/80">{file.name}</span>
                                <span className="text-[10px] text-primary/40">{formatFileSize(file.size)}</span>
                            </div>

                            <button type="button" onClick={() => removeFile(index)} className="shrink-0 rounded-md p-0.5 text-primary/40 transition-colors hover:bg-secondary/60 hover:text-accent" title="Supprimer le fichier">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* COMPOSER */}
            <div className="relative mx-auto max-w-5xl rounded-xl border border-primary/20 bg-white shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">

                {/* TOOLBAR */}
                <div className="flex items-center gap-1 border-b border-secondary/40 px-3 py-2">

                    {/* GRAS */}
                    <button type="button" title="Gras" onMouseDown={(event) => event.preventDefault()} onClick={() => toggleFormat("bold")} className="flex h-7 w-7 items-center justify-center rounded-lg text-primary/50 transition-colors hover:bg-secondary/60 hover:text-primary">
                        <Bold size={15} />
                    </button>

                    {/* ITALIQUE */}
                    <button type="button" title="Italique" onMouseDown={(event) => event.preventDefault()} onClick={() => toggleFormat("italic")} className="flex h-7 w-7 items-center justify-center rounded-lg text-primary/50 transition-colors hover:bg-secondary/60 hover:text-primary">
                        <Italic size={15} />
                    </button>

                    {/* LISTE */}
                    <button type="button" title="Liste à puces" onMouseDown={(event) => event.preventDefault()} onClick={() => toggleFormat("insertUnorderedList")} className="flex h-7 w-7 items-center justify-center rounded-lg text-primary/50 transition-colors hover:bg-secondary/60 hover:text-primary">
                        <List size={15} />
                    </button>

                    {/* LIEN */}
                    <button type="button" title="Lien" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className="flex h-7 w-7 items-center justify-center rounded-lg text-primary/50 transition-colors hover:bg-secondary/60 hover:text-primary">
                        <Link size={15} />
                    </button>
                </div>

                {/* TEXT EDITOR */}
                <div ref={editorRef} contentEditable={!sending} suppressContentEditableWarning onInput={(event) => setContent(event.currentTarget.innerHTML)} onKeyDown={keyDown} data-placeholder="Écrire un message..." className="block min-h-[80px] w-full overflow-y-auto px-4 py-3 text-sm text-gray-800 outline-none empty:before:text-primary/40 empty:before:content-[attr(data-placeholder)]" role="textbox" aria-multiline="true" />

                {/* BOTTOM ACTIONS */}
                <div className="flex items-center justify-between px-3 pb-3">

                    {/* LEFT ACTIONS */}
                    <div className="relative flex items-center gap-1">

                        {/* FILE */}
                        <label title="Ajouter un fichier" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary">
                            <Paperclip size={17} />

                            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles} disabled={sending} />
                        </label>

                        {/* EMOJI */}
                        <button type="button" title="Emoji" onClick={() => { setShowEmoji((value) => !value); setShowMention(false); }} disabled={sending} className="flex h-8 w-8 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary disabled:opacity-40">
                            <Smile size={18} />
                        </button>

                        {/* MENTION */}
                        <button type="button" title="Mentionner" onClick={() => { setShowMention((value) => !value); setShowEmoji(false); }} disabled={sending} className="flex h-8 w-8 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary disabled:opacity-40">
                            <AtSign size={17} />
                        </button>

                        {/* EMOJI PICKER */}
                        {showEmoji && <EmojiPicker onSelect={addEmoji} />}

                        {/* MENTION PICKER */}
                        {showMention && <MentionPicker users={users} onSelect={addMention} />}
                    </div>

                    {/* SEND BUTTON */}
                    <button type="button" onClick={() => void send()} disabled={sending || (!content.replace(/<[^>]*>/g, "").trim() && files.length === 0)} className="flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                        {sending ? "Envoi..." : "Envoyer"}
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
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export default MessageComposer;
