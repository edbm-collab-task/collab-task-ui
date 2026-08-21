export interface TaskComment {
    commentId: number;
    content: string;
    createdAt: string;
    updatedAt: string | null;
    author: CommentAuthor;
    parentId: number | null;
    replies: TaskComment[];
    reactions: CommentReaction[];
}

export interface CommentAuthor {
    userId: number;
    firstname: string;
    lastname: string;
    imagePath: string | null;
}

export interface CommentReaction {
    emoji: string;
    count: number;
    reactedByCurrentUser: boolean;
    usernames: string[];
}

export interface CommentReq {
    content: string;
    parentCommentId?: number | null;
}

export const REACTION_EMOJIS = ["👍", "❤️", "🎉", "🚀", "👀"] as const;
