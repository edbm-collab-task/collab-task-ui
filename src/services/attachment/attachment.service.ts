import { api } from "@/api/axios";
import { apiClient } from "@/api/api-client";
import { API_CONFIG, API_ENDPOINTS } from "@/api/constants";
import type { TaskAttachment } from "@/types/attachment";

export const attachmentService = {
    getAll: async (taskId: number): Promise<TaskAttachment[]> => {
        return apiClient.get<TaskAttachment[]>(
            API_ENDPOINTS.ATTACHMENTS.BY_TASK(taskId)
        );
    },

    /**
     * L'upload multipart est conservé en axios direct : il nécessite l'en-tête
     * explicite `Content-Type: multipart/form-data`, que `apiClient` ne gère pas.
     */
    upload: async (taskId: number, file: File): Promise<TaskAttachment> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<TaskAttachment>(
            API_ENDPOINTS.ATTACHMENTS.BY_TASK(taskId),
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    },

    downloadUrl: (attachmentId: number): string => {
        return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ATTACHMENTS.DOWNLOAD(attachmentId)}`;
    },

    delete: async (attachmentId: number): Promise<void> => {
        await apiClient.delete(
            API_ENDPOINTS.ATTACHMENTS.BY_ID(attachmentId)
        );
    },
};
