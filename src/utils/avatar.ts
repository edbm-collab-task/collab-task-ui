/**
 * Utilitaires pour les avatars et initiales.
 * Plusieurs variantes existent dans le codebase selon la source des données.
 */

/**
 * Extrait les initiales (2 premières lettres des prénoms/noms) depuis un nom complet.
 * Utilisé par : TaskModal, MentionDropdown, ConversationSidebar.
 * Retourne "?" si le nom est vide.
 */
export function getInitialsFromName(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";
}

/**
 * Construit les initiales à partir de firstname et lastname.
 * Utilisé par : NewConversationModal, ChatHeader, MessageItem, CommentItem.
 */
export function getInitialsFromParts(
    firstname: string | undefined,
    lastname: string | undefined
): string {
    return `${firstname?.charAt(0) ?? ""}${lastname?.charAt(0) ?? ""}`.toUpperCase();
}

/**
 * Construit les initiales depuis un objet user ChatUser (messagerie).
 * Utilisé par NewConversationModal, ChatHeader.
 */
export function getInitialsFromChatUser(user: {
    firstname?: string;
    lastname?: string;
}): string {
    return `${user.firstname?.charAt(0) ?? ""}${user.lastname?.charAt(0) ?? ""}`.toUpperCase();
}

/**
 * Construit les initiales depuis un objet user UserResponse/Contributor (kanban).
 * Utilisé par TaskModal, MentionDropdown.
 */
export function getInitialsFromUserName(user: { userName?: string }): string {
    return getInitialsFromName(user.userName ?? "");
}