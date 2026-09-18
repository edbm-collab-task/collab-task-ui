import { useState } from "react";
import { createPortal } from "react-dom";
import {
    Pencil,
    Trash2,
    Reply,
    Eye,
    Download,
    FileText,
    X,
    ZoomIn,
    ZoomOut,
    Maximize,
    ExternalLink,
} from "lucide-react";
import type { TaskComment } from "@/types/comment";
import type { UserResponse } from "@/types/user";
import { commentService } from "@/services/comment/comment.service";
import ReactionPicker from "./ReactionPicker";

interface Props {
    comment: TaskComment;
    taskId: number;
    currentUserId: number;
    availableUsers?: UserResponse[];
    isReply?: boolean;
    onUpdate: (commentId: number, content: string) => Promise<void>;
    onDelete: (commentId: number) => Promise<void>;
    onReaction: (commentId: number, emoji: string) => Promise<void>;
    onReply: (parentId: number) => void;
}

/**
 * Formatage relatif "à l'instant / Xmin / Xh / Xj" puis date courte après 7 jours.
 * Dupliqué dans ActivityHistoryPage, NotificationBell, NotificationsPage.
 */
function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "à l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function formatFileSize(size: number): string {
    if (!size || size <= 0) return "0 B";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(ct: string | null | undefined): boolean {
    return ct?.startsWith("image/") ?? false;
}

// Modal de prévisualisation de fichier (image zoomable / PDF dans iframe)
// Utilise createPortal pour s'afficher au-dessus de tout (z-[100])
function FilePreviewModal({
    onClose,
    attachmentPath,
    attachmentName,
    attachmentContentType,
}: {
    onClose: () => void;
    attachmentPath: string;
    attachmentName: string;
    attachmentContentType: string | null;
}) {
    const viewUrl = commentService.getAttachmentUrl(attachmentPath);
    const isPdf = attachmentContentType === "application/pdf";
    const [scale, setScale] = useState(1);
    const [fit, setFit] = useState(true);

    const zoomIn = () => {
        setFit(false);
        setScale((s) => Math.min(5, +(s + 0.25).toFixed(2)));
    };
    const zoomOut = () => {
        setFit(false);
        setScale((s) => Math.max(0.25, +(s - 0.25).toFixed(2)));
    };
    const resetZoom = () => {
        setFit(true);
        setScale(1);
    };

    const toolBtn =
        "rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-primary";

    const modal = (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="flex h-[88vh] w-[92vw] max-w-[1100px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3
                        className="truncate pr-3 text-sm font-semibold text-gray-800"
                        title={attachmentName}
                    >
                        {attachmentName}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                        {!isPdf && (
                            <>
                                <button
                                    type="button"
                                    onClick={zoomOut}
                                    className={toolBtn}
                                    title="Zoom arrière"
                                >
                                    <ZoomOut size={16} />
                                </button>
                                <span className="w-12 text-center text-xs font-medium text-gray-500">
                                    {fit ? "Auto" : `${Math.round(scale * 100)}%`}
                                </span>
                                <button
                                    type="button"
                                    onClick={zoomIn}
                                    className={toolBtn}
                                    title="Zoom avant"
                                >
                                    <ZoomIn size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={resetZoom}
                                    className={toolBtn}
                                    title="Ajuster à l'écran"
                                >
                                    <Maximize size={16} />
                                </button>
                            </>
                        )}
                        <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={toolBtn}
                            title="Ouvrir dans un nouvel onglet"
                        >
                            <ExternalLink size={16} />
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className={toolBtn}
                            title="Fermer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
                    {isPdf ? (
                        <iframe
                            src={viewUrl}
                            className="h-full w-full rounded-lg border-none bg-white"
                            title={attachmentName}
                        />
                    ) : (
                        <img
                            src={viewUrl}
                            alt={attachmentName}
                            onDoubleClick={resetZoom}
                            className="select-none"
                            style={{
                                maxWidth: fit ? "100%" : "none",
                                maxHeight: fit ? "100%" : "none",
                                transform: `scale(${fit ? 1 : scale})`,
                                transition: "transform 0.15s ease-out",
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

export default function CommentItem({
    comment,
    taskId,
    currentUserId,
    availableUsers = [],
    isReply = false,
    onUpdate,
    onDelete,
    onReaction,
    onReply,
}: Props) {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showPreview, setShowPreview] = useState(false);
    // Seul l'auteur peut modifier/supprimer son commentaire
    const isAuthor = comment.author.userId === currentUserId;

    const initials = (comment.author.firstname?.[0] ?? "") + (comment.author.lastname?.[0] ?? "");
    const isModified = comment.updatedAt != null;
    const attachment = comment.attachment;
    const viewUrl = attachment ? commentService.getAttachmentUrl(attachment.path) : "";
    const isPdf = attachment?.contentType === "application/pdf";

    const handleSave = async () => {
        if (!editContent.trim()) return;
        await onUpdate(comment.commentId, editContent.trim());
        setEditing(false);
    };

    /**
     * Rendu du contenu avec détection des mentions @Prénom Nom
     * On trie les utilisateurs par nom décroissant pour matcher les noms longs en premier
     * (ex: @Jean Dupont avant @Jean). Vérification de limites de mots pour éviter
     * les faux positifs dans d'autres mots.
     */
    const renderContent = (text: string) => {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        const sortedUsers = [...availableUsers].sort((a, b) => {
            const nameA = `${a.firstname} ${a.lastname}`;
            const nameB = `${b.firstname} ${b.lastname}`;
            return nameB.length - nameA.length;
        });

        for (const user of sortedUsers) {
            const fullName = `${user.firstname} ${user.lastname}`;
            const mentionText = `@${fullName}`;
            let searchFrom = 0;
            let idx;

            while ((idx = text.indexOf(mentionText, searchFrom)) !== -1) {
                const afterIdx = idx + mentionText.length;
                const isWordBoundary = afterIdx >= text.length || !/[a-zA-ZÀ-ÿ]/.test(text[afterIdx]);
                const isStartBoundary = idx === 0 || !/[a-zA-ZÀ-ÿ]/.test(text[idx - 1]);
                if (idx > lastIndex && isStartBoundary && isWordBoundary) {
                    parts.push(text.slice(lastIndex, idx));
                }
                parts.push(
                    <span
                        key={`mention-${idx}`}
                        className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700"
                    >
                        @{fullName}
                    </span>
                );
                lastIndex = idx + mentionText.length;
                searchFrom = idx + 1;
            }
        }

        if (lastIndex === 0) return text;
        if (lastIndex < text.length) parts.push(text.slice(lastIndex));
        return parts.length > 0 ? parts : text;
    };

    const eyeButtonClass =
        "rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-primary transition";
    const downloadButtonClass =
        "rounded-lg p-1 text-gray-400 hover:bg-primary hover:text-bg transition";

    return (
        <div className={`group ${isReply ? "ml-8" : ""}`}>
            <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {comment.author.imagePath ? (
                        <img
                            src={comment.author.imagePath}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        initials.toUpperCase()
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                            {comment.author.firstname} {comment.author.lastname}
                        </span>
                        <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                        {isModified && (
                            <span className="text-xs text-gray-400 italic">Modifié</span>
                        )}
                    </div>

                    {editing ? (
                        <div className="mt-1">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                                rows={2}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSave();
                                    }
                                    if (e.key === "Escape") {
                                        setEditing(false);
                                        setEditContent(comment.content);
                                    }
                                }}
                            />
                            <div className="mt-1 flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setEditContent(comment.content);
                                    }}
                                    className="rounded-lg px-3 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap">
                            {renderContent(comment.content)}
                        </p>
                    )}

                    {/* Attachment : affichage différencié image vs PDF/autre + preview modal */}
                    {!editing && attachment && (
                        <div className="mt-2">
                            {isImageType(attachment.contentType) ? (
                                <div className="max-w-[260px] overflow-hidden rounded-xl border border-gray-200 bg-white flex flex-col">
                                    <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-gray-50">
                                        <span className="text-xs text-gray-600">{attachment.name}</span>
                                        <span className="text-[10px] text-gray-400">
                                            {formatFileSize(attachment.size)}
                                        </span>
                                    </div>
                                    <img
                                        src={viewUrl}
                                        alt={attachment.name}
                                        className="max-w-full max-h-48 w-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                    <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(true)}
                                            className={eyeButtonClass}
                                            title="Visualiser"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <a
                                            href={`${viewUrl}?download=true`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={downloadButtonClass}
                                            title="Télécharger"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex max-w-[260px] items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                        {isPdf ? (
                                            <FileText size={18} className="text-accent" />
                                        ) : (
                                            <FileText size={18} className="text-primary" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="truncate text-xs font-medium text-gray-700"
                                            title={attachment.name}
                                        >
                                            {attachment.name}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {formatFileSize(attachment.size)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(true)}
                                        className={eyeButtonClass}
                                        title="Visualiser"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <a
                                        href={`${viewUrl}?download=true`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={downloadButtonClass}
                                        title="Télécharger"
                                    >
                                        <Download size={14} />
                                    </a>
                                </div>
                            )}

                            {showPreview && (
                                <FilePreviewModal
                                    onClose={() => setShowPreview(false)}
                                    attachmentPath={attachment.path || ""}
                                    attachmentName={attachment.name || "Pièce jointe"}
                                    attachmentContentType={attachment.contentType || ""}
                                />
                            )}
                        </div>
                    )}

                    {/* Réactions : badges avec compteur + picker pour ajouter.
                         La réaction de l'utilisateur courant est surlignée (bg-blue-50). */}
                    {!editing && comment.reactions.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {comment.reactions.map((r) => (
                                <button
                                    key={r.emoji}
                                    onClick={() => onReaction(comment.commentId, r.emoji)}
                                    title={r.usernames.join(", ")}
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
                                        r.reactedByCurrentUser
                                            ? "bg-blue-50 text-accent"
                                            : "border-none bg-gray-50 text-primary hover:border-gray-300"
                                    }`}
                                >
                                    <span>{r.emoji}</span>
                                    <span className="font-medium">{r.count}</span>
                                </button>
                            ))}
                            <ReactionPicker
                                onSelect={(emoji) => onReaction(comment.commentId, emoji)}
                            />
                        </div>
                    )}

                    {/* Picker affiché au survol du commentaire (group-hover) s'il n'y a pas encore de réaction */}
                    {!editing && comment.reactions.length === 0 && (
                        <div className="mt-1 opacity-0 transition group-hover:opacity-100">
                            <ReactionPicker
                                onSelect={(emoji) => onReaction(comment.commentId, emoji)}
                            />
                        </div>
                    )}

                    {/* Actions : répondre (pas sur les réponses), modifier/supprimer (auteur uniquement).
                         Suppression via window.confirm natif (différent de ConfirmPopup utilisé ailleurs). */}
                    {!editing && (
                        <div className="mt-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                            {!isReply && (
                                <button
                                    onClick={() => onReply(comment.commentId)}
                                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <Reply size={12} />
                                    Répondre
                                </button>
                            )}
                            {isAuthor && (
                                <>
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                                        title="Modifier"
                                    >
                                        <Pencil size={12} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Supprimer ce commentaire ?"))
                                                onDelete(comment.commentId);
                                        }}
                                        className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Réponses récursives : même composant avec isReply=true pour indentation
                 et masquage du bouton "Répondre" sur les réponses. */}
            {!editing && comment.replies.length > 0 && (
                <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-3">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.commentId}
                            comment={reply}
                            taskId={taskId}
                            currentUserId={currentUserId}
                            availableUsers={availableUsers}
                            isReply
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onReaction={onReaction}
                            onReply={onReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}