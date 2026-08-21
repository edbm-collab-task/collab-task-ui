import { useState } from "react";
import { Pencil, Trash2, Reply } from "lucide-react";
import type { TaskComment } from "@/types/comment";
import type { UserResponse } from "@/types/user";
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
    const isAuthor = comment.author.userId === currentUserId;

    const initials = (comment.author.firstname?.[0] ?? "") + (comment.author.lastname?.[0] ?? "");
    const isModified = comment.updatedAt != null;

    const handleSave = async () => {
        if (!editContent.trim()) return;
        await onUpdate(comment.commentId, editContent.trim());
        setEditing(false);
    };

    const renderContent = (text: string) => {
        const mentionRegex = /@\{(\d+)\}/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            const userId = Number(match[1]);
            const mentionedUser = availableUsers.find(u => u.id === userId);
            const name = mentionedUser
                ? `${mentionedUser.firstname} ${mentionedUser.lastname}`
                : `Utilisateur #${userId}`;
            parts.push(
                <span
                    key={`mention-${match.index}`}
                    className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700"
                >
                    @{name}
                </span>
            );
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts.length > 0 ? parts : text;
    };

    return (
        <div className={`group ${isReply ? "ml-8" : ""}`}>
            <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {comment.author.imagePath ? (
                        <img src={comment.author.imagePath} alt="" className="h-8 w-8 rounded-full object-cover" />
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                            <div className="mt-1 flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Enregistrer
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setEditContent(comment.content);
                                    }}
                                    className="rounded-lg px-3 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap">{renderContent(comment.content)}</p>
                    )}

                    {/* Réactions */}
                    {comment.reactions.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {comment.reactions.map((r) => (
                                <button
                                    key={r.emoji}
                                    onClick={() => onReaction(comment.commentId, r.emoji)}
                                    title={r.usernames.join(", ")}
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
                                        r.reactedByCurrentUser
                                            ? "border-blue-300 bg-blue-50 text-blue-700"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <span>{r.emoji}</span>
                                    <span className="font-medium">{r.count}</span>
                                </button>
                            ))}
                            <ReactionPicker onSelect={(emoji) => onReaction(comment.commentId, emoji)} />
                        </div>
                    )}

                    {/* Actions */}
                    {!editing && (
                        <div className="mt-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                            <ReactionPicker onSelect={(emoji) => onReaction(comment.commentId, emoji)} />
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
                                            if (window.confirm("Supprimer ce commentaire ?")) {
                                                onDelete(comment.commentId);
                                            }
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

            {/* Réponses */}
            {comment.replies.length > 0 && (
                <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-3">
                    {comment.replies.map(reply => (
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
