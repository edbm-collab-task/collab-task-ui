import { api } from "@/api/axios";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { TaskComment, CommentReq } from "@/types/comment";

export const commentService = {

    getByTask: async (taskId: number): Promise<TaskComment[]> => {
        return apiClient.get<TaskComment[]>(
            API_ENDPOINTS.COMMENTS.BY_TASK(taskId)
        );
    },

    countByTask: async (taskId: number): Promise<number> => {
        const res = await apiClient.get<{ count: number }>(
            API_ENDPOINTS.COMMENTS.COUNT(taskId)
        );
        return res.count;
    },

    /**
     * Création de commentaire avec pièce jointe optionnelle.
     * Utilise FormData + api.post direct (pas apiClient) car multipart/form-data
     * nécessite le header Content-Type explicite (géré par le navigateur avec boundary).
     * L'API attend : content (string), parentCommentId (optionnel), file (optionnel).
     */
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
            API_ENDPOINTS.COMMENTS.BY_TASK(taskId),
            form,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    },

    update: async (taskId: number, commentId: number, data: CommentReq): Promise<TaskComment> => {
        return apiClient.put<TaskComment, CommentReq>(
            API_ENDPOINTS.COMMENTS.BY_ID(taskId, commentId),
            data
        );
    },

    delete: async (taskId: number, commentId: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.COMMENTS.BY_ID(taskId, commentId));
    },

    /**
     * Toggle réaction (ajoute si absent, retire si présent).
     * L'emoji est passé en query param (encodé pour gérer les caractères spéciaux).
     */
    toggleReaction: async (taskId: number, commentId: number, emoji: string): Promise<TaskComment> => {
        return apiClient.post<TaskComment, null>(
            `${API_ENDPOINTS.COMMENTS.REACTIONS(taskId, commentId)}?emoji=${encodeURIComponent(emoji)}`,
            null
        );
    },

    /**
     * Construit l'URL absolue d'une pièce jointe à partir du chemin relatif du backend.
     * Gère les cas : chemin vide, URL déjà absolue, chemin relatif (préfixe avec VITE_API_BASE_URL).
     * Utilisé par CommentItem pour l'affichage et le téléchargement.
     */
    getAttachmentUrl: (path: string): string => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
        return `${base}/${path}`;
    },
};
