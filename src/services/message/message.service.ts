import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";

import type {
    ChatUser,
    Conversation,
    Message,
    SendMessageRequest,
} from "@/types/message";

export const messageService = {

    async getCurrentUser(): Promise<ChatUser> {

        return apiClient.get<ChatUser>(
            API_ENDPOINTS.AUTH.ME
        );
    },

    async getUsers(): Promise<ChatUser[]> {

        return apiClient.get<ChatUser[]>(
            API_ENDPOINTS.CONVERSATIONS.USERS
        );
    },

    async getConversations(
        archived = false
    ): Promise<Conversation[]> {

        return apiClient.get<Conversation[]>(
            API_ENDPOINTS.CONVERSATIONS.ALL,
            {
                archived
            }
        );
    },

    async getConversation(
        conversationId: number
    ): Promise<Conversation> {

        return apiClient.get<Conversation>(
            `${API_ENDPOINTS.CONVERSATIONS.BY_ID}/${conversationId}`
        );
    },

    async createPrivateConversation(
        data: {
            userId: number;
        }
    ): Promise<Conversation> {

        return apiClient.post<
            Conversation,
            {
                userId: number;
            }
        >(
            API_ENDPOINTS.CONVERSATIONS.PRIVATE,
            data
        );
    },

    async createGroup(
        data: {
            name: string;
            memberIds: number[];
        }
    ): Promise<Conversation> {

        return apiClient.post<
            Conversation,
            {
                name: string;
                memberIds: number[];
            }
        >(
            API_ENDPOINTS.CONVERSATIONS.GROUP,
            data
        );
    },

    async getMessages(
        conversationId: number
    ): Promise<Message[]> {

        return apiClient.get<Message[]>(
            API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)
        );
    },

    /**
     * Envoie un message en multipart/form-data.
     *
     * Backend attendu :
     *
     * content
     * replyToId
     * attachments[]
     */
    async sendMessage(
        conversationId: number,
        data: SendMessageRequest
    ): Promise<Message> {

        const formData = new FormData();

        /**
         * Content
         */
        if (data.content.trim()) {
            formData.append(
                "content",
                data.content.trim()
            );
        }

        /**
         * Réponse à un message
         */
        if (data.replyToId !== null &&
            data.replyToId !== undefined) {

            formData.append(
                "replyToId",
                String(data.replyToId)
            );
        }

        /**
         * Fichiers
         *
         * Le nom "attachments" doit correspondre
         * exactement à :
         *
         * @RequestPart("attachments")
         */
        if (data.attachments &&
            data.attachments.length > 0) {

            data.attachments.forEach(
                (file) => {

                    formData.append(
                        "attachments",
                        file
                    );
                }
            );
        }

        return apiClient.post<
            Message,
            FormData
        >(
            API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(conversationId),
            formData
        );
    },

    async deleteMessage(
        messageId: number
    ): Promise<void> {

        await apiClient.delete<void>(
            API_ENDPOINTS.CONVERSATIONS.DELETE_MESSAGE(messageId)
        );
    },

    async getMembers(
        conversationId: number
    ) {

        return apiClient.get(
            API_ENDPOINTS.CONVERSATIONS.MEMBERS(conversationId)
        );
    },

    async addMembers(
        conversationId: number,
        data: {
            memberIds: number[];
        }
    ): Promise<Conversation> {

        return apiClient.post<
            Conversation,
            {
                memberIds: number[];
            }
        >(
            API_ENDPOINTS.CONVERSATIONS.ADD_MEMBERS(conversationId),
            data
        );
    },

    async removeMember(
        conversationId: number,
        userId: number
    ): Promise<void> {

        await apiClient.delete<void>(
            API_ENDPOINTS.CONVERSATIONS.REMOVE_MEMBER(conversationId, userId)
        );
    },

    async leaveGroup(
        conversationId: number
    ): Promise<void> {

        await apiClient.delete<void>(
            API_ENDPOINTS.CONVERSATIONS.LEAVE(conversationId)
        );
    },

    /**
     * Nombre total de messages non lus de l'utilisateur courant,
     * toutes conversations confondues. Le backend retourne un entier
     * brut (0 s'il n'y a aucun non-lu).
     */
    async getUnreadCount(): Promise<number> {

        return apiClient.get<number>(
            API_ENDPOINTS.CONVERSATIONS.UNREAD_COUNT
        );
    },

    async markAsRead(
        conversationId: number
    ): Promise<void> {

        await apiClient.patch<
            void,
            Record<string, never>
        >(
            API_ENDPOINTS.CONVERSATIONS.READ(conversationId),
            {}
        );
    },

    async togglePin(
        conversationId: number
    ): Promise<Conversation> {

        return apiClient.patch<
            Conversation,
            Record<string, never>
        >(
            API_ENDPOINTS.CONVERSATIONS.PIN(conversationId),
            {}
        );
    },

    async archiveConversation(
        conversationId: number
    ): Promise<Conversation> {

        return apiClient.patch<
            Conversation,
            Record<string, never>
        >(
            API_ENDPOINTS.CONVERSATIONS.ARCHIVE(conversationId),
            {}
        );
    },

    async deleteConversation(
        conversationId: number
    ): Promise<void> {

        await apiClient.delete<void>(
            API_ENDPOINTS.CONVERSATIONS.DELETE(conversationId)
        );
    },
};
