import type {
    ChatUser,
    Conversation,
    Message,
    Attachment,
} from "@/types/message";

import type { UserResponse } from "@/types/user";

export const mapUserToChatUser = (
    user: UserResponse
): ChatUser => {
    return {
        id: Number(user.id),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        avatar: user.imagePath ?? null,
        online: Boolean(user.status),
    };
};

export const mapAttachment = (
    attachment: any
): Attachment => {
    return {
        id: Number(attachment.id),
        name: attachment.name,
        type: attachment.type,
        size: Number(attachment.size),
        url: attachment.url,
    };
};

export const mapMessage = (
    message: any
): Message => {
    return {
        id: Number(message.id),
        conversationId: Number(
            message.conversationId
        ),
        senderId: Number(message.senderId),
        content: message.content ?? "",
        createdAt: message.createdAt,
        attachments:
            message.attachments?.map(
                mapAttachment
            ) ?? [],
        replyToId:
            message.replyToId !== null &&
            message.replyToId !== undefined
                ? Number(message.replyToId)
                : null,
        readBy:
            message.readBy?.map(Number) ?? [],
        deleted: Boolean(message.deleted),
    };
};

export const mapConversation = (
    conversation: any
): Conversation => {
    return {
        id: Number(conversation.id),
        type: conversation.type,
        name: conversation.name,
        avatar:
            conversation.avatar ?? null,
        memberIds:
            conversation.memberIds?.map(
                Number
            ) ?? [],
        createdAt:
            conversation.createdAt,
        updatedAt:
            conversation.updatedAt,
        archived:
            Boolean(conversation.archived),
        pinned:
            Boolean(conversation.pinned),
        unreadCount:
            Number(
                conversation.unreadCount ?? 0
            ),
    };
};