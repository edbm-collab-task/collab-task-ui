export type ConversationType = "private" | "group";

export interface ChatUser {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    avatar: string | null;
    online: boolean;
}

export interface Attachment {
    id: number;
    name: string;
    type: string;
    size: number;
    url: string;
}

export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    createdAt: string;
    attachments: Attachment[];
    replyToId: number | null;
    readBy: number[];
    deleted: boolean;
}

export interface Conversation {
    id: number;
    type: ConversationType;
    name: string;
    avatar: string | null;
    memberIds: number[];
    createdAt: string;
    updatedAt: string;
    archived: boolean;
    pinned: boolean;
    unreadCount: number;
    lastMessage: Message | null;
}

export interface MessageDatabase {
    users: ChatUser[];
    conversations: Conversation[];
    messages: Message[];
}

export interface CreatePrivateConversationRequest {
    userId: number;
}

export interface CreateGroupRequest {
    name: string;
    memberIds: number[];
}

export interface AddMembersRequest {
    memberIds: number[];
}

export interface SendMessageRequest {
    content: string;
    replyToId?: number | null;
    attachments?: File[];
}