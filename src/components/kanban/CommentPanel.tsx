import { useEffect, useState, useCallback, useRef } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import type { TaskComment } from "@/types/comment";
import type { UserResponse } from "@/types/user";
import { commentService } from "@/services/comment/comment.service";
import CommentItem from "./CommentItem";
import MentionDropdown from "./MentionDropdown";

interface Props {
    open: boolean;
    taskId: number | null;
    currentUserId: number;
    availableUsers?: UserResponse[];
    onClose: () => void;
    onCountChange?: (count: number) => void;
}

export default function CommentPanel({ open, taskId, currentUserId, availableUsers = [], onClose, onCountChange }: Props) {
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const onCountChangeRef = useRef(onCountChange);
    onCountChangeRef.current = onCountChange;

    const loadComments = useCallback(async () => {
        if (!taskId) return;
        setLoading(true);
        try {
            const data = await commentService.getByTask(taskId);
            setComments(data);
            onCountChangeRef.current?.(data.reduce((acc, c) => acc + 1 + c.replies.length, 0));
        } catch {
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        if (open && taskId) {
            loadComments();
            setNewComment("");
            setReplyTo(null);
        }
    }, [open, taskId, loadComments]);

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewComment(value);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);
        const atMatch = textBeforeCursor.match(/@(\w*)$/);

        if (atMatch) {
            setMentionQuery(atMatch[1]);
        } else {
            setMentionQuery(null);
        }
    };

    const handleMentionSelect = (user: UserResponse) => {
        if (!inputRef.current) return;
        const textarea = inputRef.current;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = newComment.slice(0, cursorPos);
        const textAfterCursor = newComment.slice(cursorPos);
        const atIndex = textBeforeCursor.lastIndexOf("@");
        const mention = `@{${user.id}}`;
        const newText = textBeforeCursor.slice(0, atIndex) + mention + " " + textAfterCursor;
        setNewComment(newText);
        setMentionQuery(null);
        setTimeout(() => {
            const newPos = atIndex + mention.length + 1;
            textarea.setSelectionRange(newPos, newPos);
            textarea.focus();
        }, 0);
    };

    const handleSubmit = async () => {
        if (!newComment.trim() || !taskId || submitting) return;
        setSubmitting(true);
        try {
            await commentService.create(taskId, {
                content: newComment.trim(),
                parentCommentId: replyTo,
            });
            setNewComment("");
            setReplyTo(null);
            setMentionQuery(null);
            await loadComments();
            setTimeout(() => {
                scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            }, 100);
        } catch {
            // error handled by interceptor
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (commentId: number, content: string) => {
        if (!taskId) return;
        await commentService.update(taskId, commentId, { content });
        await loadComments();
    };

    const handleDelete = async (commentId: number) => {
        if (!taskId) return;
        await commentService.delete(taskId, commentId);
        await loadComments();
    };

    const handleReaction = async (commentId: number, emoji: string) => {
        if (!taskId) return;
        await commentService.toggleReaction(taskId, commentId, emoji);
        await loadComments();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-50 bg-slate-900/30 transition-opacity duration-300 ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-800">Commentaires</h3>
                        {totalComments > 0 && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                {totalComments}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Comments list */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <MessageSquare size={40} className="mb-3 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">Aucun commentaire</p>
                            <p className="mt-1 text-xs text-gray-400">Soyez le premier à commenter cette tâche</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {comments.map(comment => (
                                <CommentItem
                                    key={comment.commentId}
                                    comment={comment}
                                    taskId={taskId!}
                                    currentUserId={currentUserId}
                                    availableUsers={availableUsers}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    onReaction={handleReaction}
                                    onReply={(parentId) => {
                                        setReplyTo(parentId);
                                        inputRef.current?.focus();
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Reply indicator */}
                {replyTo && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Réponse à un commentaire
                        </span>
                        <button
                            onClick={() => setReplyTo(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Annuler
                        </button>
                    </div>
                )}

                {/* Input */}
                <div className="border-t border-gray-200 px-5 py-4">
                    <div className="relative flex items-end gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {currentUserId.toString().slice(-2)}
                        </div>
                        <div className="relative flex-1">
                            {mentionQuery !== null && (
                                <MentionDropdown
                                    users={availableUsers}
                                    query={mentionQuery}
                                    onSelect={handleMentionSelect}
                                    onClose={() => setMentionQuery(null)}
                                />
                            )}
                            <textarea
                                ref={inputRef}
                                value={newComment}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder={replyTo ? "Écrire une réponse… (@ pour mentionner)" : "Écrire un commentaire… (@ pour mentionner)"}
                                rows={1}
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                style={{ minHeight: "42px", maxHeight: "120px" }}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || submitting}
                                className="absolute right-2 bottom-2 rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50 disabled:opacity-30"
                                title="Envoyer"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
