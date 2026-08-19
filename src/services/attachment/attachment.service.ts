import { api } from "@/api/axios";
import type { TaskAttachment } from "@/types/attachment";

export const attachmentService = {
    getAll: async (taskId: number): Promise<TaskAttachment[]> => {
        const response = await api.get<TaskAttachment[]>(`tasks/${taskId}/attachments`);
        return response.data;
    },

    upload: async (taskId: number, file: File): Promise<TaskAttachment> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<TaskAttachment>(`tasks/${taskId}/attachments`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    downloadUrl: (attachmentId: number): string => {
        return `${import.meta.env.VITE_API_BASE_URL}/tasks/attachments/${attachmentId}/download`;
    },

    delete: async (attachmentId: number): Promise<void> => {
        await api.delete(`tasks/attachments/${attachmentId}`);
    },
};
