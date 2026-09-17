import { useEffect, useState, useCallback, useRef } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import type { TaskComment } from "@/types/comment";
import type { UserResponse } from "@/types/user";
import type { TaskRes } from "@/types/task";
import { commentService } from "@/services/comment/comment.service";
import { userService } from "@/services/user/user.service";
import CommentItem from "./CommentItem";
import MentionDropdown from "./MentionDropdown";
import { TaskCard } from "./TaskCard";

interface Props {
    open: boolean;
    taskId: number | null;
    currentUserId: number;
    availableUsers?: UserResponse[];
    onClose: () => void;
    onCountChange?: (count: number) => void;
    task?: TaskRes;
    projectId?: number;
    priorityBadge?: (priorityId: any) => { name: string; color: string };
    formatDate?: (date: string | null) => string | null;
    getCount?: (taskId: any) => number | string;
}

export default function CommentPanel({
    open, taskId, currentUserId, availableUsers = [], onClose, onCountChange,
    task, projectId, priorityBadge, formatDate, getCount
}: Props) {
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [users, setUsers] = useState<UserResponse[]>(availableUsers);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const onCountChangeRef = useRef(onCountChange);
    onCountChangeRef.current = onCountChange;

    useEffect(() => {
        setUsers(availableUsers);
    }, [availableUsers]);

    useEffect(() => {
        if (open && users.length === 0) {
            userService.getAll({ silent: true }).then(setUsers).catch(() => {});
        }
    }, [open, users.length]);

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
        const mention = `@${user.firstname} ${user.lastname}`;
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
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 bg-primary ">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={25} className="text-accent" />
                        <h3 className="text-lg font-bold text-bg">Commentaires</h3>
                        {totalComments > 0 && (
                            <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-xs font-semibold text-bg">
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

                {/* Task Context */}
                {task && (
                        <TaskCard
                            task={task}
                            projectId={projectId ?? 0}
                            priorityBadge={priorityBadge ?? (() => ({ name: "", color: "" }))}
                            formatDate={formatDate ?? (() => "")}
                            getCount={getCount ?? (() => 0)}
                            showActions={false}
                        />
                )}

                {/* Comments list */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
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
                                    availableUsers={users}
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
                <div className="border-t bg-primary border-gray-200 px-5 py-4">
                    <div className="relative flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg">
                            {currentUserId.toString().slice(-2)}
                        </div>
                        <div className="relative flex-1">
                            {mentionQuery !== null && (
                                <MentionDropdown
                                    users={users}
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
                                className="w-full bg-bg resize-none rounded-xl border border-gray-300 px-4 py-2.5 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                style={{ minHeight: "42px", maxHeight: "120px" }}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || submitting}
                                className="absolute right-2 bottom-2 rounded-lg p-1.5 text-accent transition mb-1 hover:bg-primary hover:text-bg disabled:opacity-30"
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
