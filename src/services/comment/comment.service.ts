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

    create: async (taskId: number, data: CommentReq): Promise<TaskComment> => {
        return apiClient.post<TaskComment, CommentReq>(`/tasks/${taskId}/comments`, data);
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
};
