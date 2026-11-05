export interface CommentAttachment {
    name: string;
    contentType: string;
    size: number;
    path: string;
}

export interface TaskComment {
    commentId: number;
    content: string;
    createdAt: string;
    updatedAt: string | null;
    author: CommentAuthor;
    parentId: number | null;
    replies: TaskComment[];
    reactions: CommentReaction[];
    attachment: CommentAttachment | null;
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

/**
 * Réactions suggérées en accès rapide dans le sélecteur.
 * Identifiants Unicode (unified) attendus par la bibliothèque emoji-picker-react.
 */
export const REACTION_EMOJIS: string[] = [
    "1f44d",
    "2764-fe0f",
    "1f389",
    "1f680",
    "1f440",
    "1f602",
    "1f64f",
    "1f525",
];
