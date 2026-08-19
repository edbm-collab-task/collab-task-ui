import { apiClient } from "@/api/api-client";

import type {
    ChatUser,
    Conversation,
    Message,
    SendMessageRequest,
} from "@/types/message";

export const messageService = {

    async getCurrentUser(): Promise<ChatUser> {

        return apiClient.get<ChatUser>(
            "/auth/me"
        );
    },

    async getUsers(): Promise<ChatUser[]> {

        return apiClient.get<ChatUser[]>(
            "/conversations/users"
        );
    },

    async getConversations(
        archived = false
    ): Promise<Conversation[]> {

        return apiClient.get<Conversation[]>(
            "/conversations",
            {
                archived
            }
        );
    },

    async getConversation(
        conversationId: number
    ): Promise<Conversation> {

        return apiClient.get<Conversation>(
            `/conversations/${conversationId}`
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
            "/conversations/private",
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
            "/conversations/group",
            data
        );
    },

    async getMessages(
        conversationId: number
    ): Promise<Message[]> {

        return apiClient.get<Message[]>(
            `/conversations/${conversationId}/messages`
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
            `/conversations/${conversationId}/messages`,
            formData
        );
    },

    async deleteMessage(
        messageId: number
    ): Promise<void> {

        await apiClient.delete<void>(
            `/conversations/messages/${messageId}`
        );
    },

    async getMembers(
        conversationId: number
    ) {

        return apiClient.get(
            `/conversations/${conversationId}/members`
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
            `/conversations/${conversationId}/members`,
            data
        );
    },

    async removeMember(
        conversationId: number,
        userId: number
    ): Promise<void> {

        await apiClient.delete<void>(
            `/conversations/${conversationId}/members/${userId}`
        );
    },

    async leaveGroup(
        conversationId: number
    ): Promise<void> {

        await apiClient.delete<void>(
            `/conversations/${conversationId}/leave`
        );
    },

    async markAsRead(
        conversationId: number
    ): Promise<void> {

        await apiClient.patch<
            void,
            Record<string, never>
        >(
            `/conversations/${conversationId}/read`,
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
            `/conversations/${conversationId}/pin`,
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
            `/conversations/${conversationId}/archive`,
            {}
        );
    },

    async deleteConversation(
        conversationId: number
    ): Promise<void> {

        await apiClient.delete<void>(
            `/conversations/${conversationId}`
        );
    },
};