import { api } from "@/api/axios";
import { apiClient } from "@/api/api-client";
import type { TaskComment, CommentReq } from "@/types/comment";

export const commentService = {

    getByTask: async (taskId: number): Promise<TaskComment[]> => {
        return apiClient.get<TaskComment[]>(`/tasks/${taskId}/comments`);
    },

    countByTask: async (taskId: number): Promise<number> => {
        const res = await apiClient.get<{ count: number }>(`/tasks/${taskId}/comments/count`);
        return res.count;
    },

    create: async (taskId: number, data: CommentReq, file?: File | null): Promise<TaskComment> => {
        const form = new FormData();
        form.append("content", data.content);
        if (data.parentCommentId) {
            form.append("parentCommentId", String(data.parentCommentId));
        }
        if (file) {
            form.append("file", file);
        }
        const response = await api.post<TaskComment>(
            `/tasks/${taskId}/comments`,
            form,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    },

    update: async (taskId: number, commentId: number, data: CommentReq): Promise<TaskComment> => {
        return apiClient.put<TaskComment, CommentReq>(`/tasks/${taskId}/comments/${commentId}`, data);
    },

    delete: async (taskId: number, commentId: number): Promise<void> => {
        await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
    },

    toggleReaction: async (taskId: number, commentId: number, emoji: string): Promise<TaskComment> => {
        return apiClient.post<TaskComment, null>(
            `/tasks/${taskId}/comments/${commentId}/reactions?emoji=${encodeURIComponent(emoji)}`,
            null
        );
    },

    getAttachmentUrl: (path: string): string => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
        return `${base}/${path}`;
    },
};