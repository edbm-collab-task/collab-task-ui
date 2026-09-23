import { useEffect, useState, useCallback, useRef } from "react";
import { X, MessageSquare, Send, Paperclip } from "lucide-react";
import type { TaskComment } from "@/types/comment";
import type { TaskRes } from "@/types/task";
import type { UserResponse } from "@/types/user";
import { commentService } from "@/services/comment/comment.service";
import { userService } from "@/services/user/user.service";
import useAuth from "@/hooks/useAuth";
import CommentItem from "./CommentItem";
import MentionDropdown from "./MentionDropdown";

interface Props {
    open: boolean;
    task: TaskRes | null;
    currentUserId: number;
    availableUsers?: UserResponse[];
    onClose: () => void;
    onCountChange?: (count: number) => void;
}

function formatDate(date: string | null) {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CommentPanel({ open, task, currentUserId, availableUsers = [], onClose, onCountChange }: Props) {
    const { user: authUser } = useAuth();
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [users, setUsers] = useState<UserResponse[]>(availableUsers);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const onCountChangeRef = useRef(onCountChange);
    onCountChangeRef.current = onCountChange;

    const currentUserInitials = `${authUser?.firstname?.[0] ?? ""}${authUser?.lastname?.[0] ?? ""}`.toUpperCase();

    useEffect(() => {
        setUsers(availableUsers);
    }, [availableUsers]);

    useEffect(() => {
        if (!open) return;
        // /users/active est accessible à tous les utilisateurs authentifiés (contrairement à /users)
        userService
            .getAllActive()
            .then((activeUsers) => {
                setUsers((prev) => {
                    const merged = new Map<number, UserResponse>();
                    for (const u of [...availableUsers, ...prev, ...activeUsers]) {
                        if (u && typeof u.id === "number") merged.set(u.id, u);
                    }
                    return Array.from(merged.values());
                });
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const loadComments = useCallback(async () => {
        if (!task) return;
        setLoading(true);
        try {
            const data = await commentService.getByTask(task.taskId);
            setComments(data);
            onCountChangeRef.current?.(data.reduce((acc, c) => acc + 1 + c.replies.length, 0));
        } catch {
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [task]);

    useEffect(() => {
        if (open && task) {
            loadComments();
            setNewComment("");
            setReplyTo(null);
            setSelectedFile(null);
        }
    }, [open, task, loadComments]);

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
        if ((!newComment.trim() && !selectedFile) || !task || submitting) return;
        if (!newComment.trim() && selectedFile) {
            // allow sending with file and empty text
        } else if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            await commentService.create(task.taskId, {
                content: newComment.trim() || (selectedFile ? `📄 ${selectedFile.name}` : ""),
                parentCommentId: replyTo,
            }, selectedFile);
            setNewComment("");
            setReplyTo(null);
            setMentionQuery(null);
            setSelectedFile(null);
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
        if (!task) return;
        await commentService.update(task.taskId, commentId, { content });
        await loadComments();
    };

    const handleDelete = async (commentId: number) => {
        if (!task) return;
        await commentService.delete(task.taskId, commentId);
        await loadComments();
    };

    const handleReaction = async (commentId: number, emoji: string) => {
        if (!task) return;
        await commentService.toggleReaction(task.taskId, commentId, emoji);
        await loadComments();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

    const replyPlaceholders = ["Écrire une réponse…", "@ pour mentionner"];
    const commentPlaceholders = ["Écrire un commentaire…", "@ pour mentionner"];

    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    const placeholders = replyTo ? replyPlaceholders : commentPlaceholders;

    useEffect(() => {
        setPlaceholderIndex(0);
        const interval = setInterval(() => {
            setPlaceholderIndex(i => (i + 1) % placeholders.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [replyTo]);
    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-50 bg-slate-900/30 transition-opacity duration-300 ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`fixed left-1/2 top-1/2 z-50 flex h-[min(85vh,720px)] w-[min(600px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out ${
                    open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 px-6 py-4 bg-primary">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={22} className="text-accent" />
                        <h3 className="text-lg font-bold text-bg">Commentaires</h3>
                        {totalComments > 0 && (
                            <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-xs font-semibold text-bg">
                                {totalComments}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-white/20 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Task details */}
                {task && (
                    <div className="max-h-[35vh] overflow-y-auto custom-scrollbar border-b border-gray-200 bg-gray-50/80 px-6 py-4">
                        <h4 className="text-sm font-bold text-gray-800 leading-snug">{task.title}</h4>
                        {task.description && (
                            <p className="mt-1 whitespace-pre-wrap break-words text-xs text-gray-500">{task.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                task.priorityId === 4 ? "bg-rose-100 text-rose-700"
                                : task.priorityId === 3 ? "bg-orange-100 text-orange-700"
                                : task.priorityId === 2 ? "bg-sky-100 text-sky-700"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                                {task.priorityName}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                                {task.statusName}
                            </span>
                            {task.dueDate && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                    📅 {formatDate(task.dueDate)}
                                </span>
                            )}
                            {task.assignees.length > 0 && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                    👤 {task.assignees.map(a => `${a.firstname} ${a.lastname}`).join(", ")}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Comments list */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
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
                    ) : task ? (
                        <div className="space-y-5">
                            {comments.map(comment => (
                                <CommentItem
                                    key={comment.commentId}
                                    comment={comment}
                                    taskId={task.taskId}
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
                    ) : null}
                </div>

                {/* Reply indicator */}
                {replyTo && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Réponse à un commentaire</span>
                        <button onClick={() => setReplyTo(null)} className="text-xs text-gray-400 hover:text-gray-600">Annuler</button>
                    </div>
                )}

                {/* File preview chip */}
                {selectedFile && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-2 flex items-center gap-2">
                        <Paperclip size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate text-xs text-gray-600 max-w-[200px]">{selectedFile.name}</span>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="ml-auto rounded p-0.5 text-gray-400 hover:text-red-500 transition"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}

                {/* Input */}
                <div className="border-t bg-white border-gray-200 px-6 py-4 rounded-b-2xl">
                    <div className="relative flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg">
                            {currentUserInitials || currentUserId.toString().slice(-2)}
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
                                placeholder={placeholders[placeholderIndex]}
                                rows={1}
                                className="w-full bg-bg resize-none rounded-xl border border-gray-300 px-4 py-2.5 pr-24 text-sm outline-none transition placeholder:truncate focus:border-primary focus:ring-2 focus:ring-primary/30"
                                style={{ minHeight: "42px", maxHeight: "120px" }}
                            />
                            <div className="absolute right-2 bottom-2 flex items-center gap-1 mb-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-primary"
                                    title="Joindre un fichier (image ou PDF)"
                                >
                                    <Paperclip size={16} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        setSelectedFile(file);
                                        e.target.value = "";
                                    }}
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={(!newComment.trim() && !selectedFile) || submitting}
                                    className="rounded-lg p-1.5 text-accent transition hover:bg-primary hover:text-bg disabled:opacity-30"
                                    title="Envoyer"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}