import { API_CONFIG, API_ENDPOINTS } from "@/api/constants";

/**
 * Construit l'URL absolue de l'image de profil d'un utilisateur.
 * Utilise les constantes centralisées (API_CONFIG + API_ENDPOINTS) au lieu de chaînes en dur.
 * Si `avatar` est fourni, retourne null quand il est vide/null (variante utilisée par la messagerie).
 * Sinon, retourne null si userId est falsy.
 */
export function getUserImageUrl(
    userId: number | undefined | null,
    avatar?: string | null | undefined
): string | null {
    if (!userId) return null;
    if (avatar !== undefined && (!avatar || avatar.trim() === "")) return null;
    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/image`;
}

/**
 * Construit l'URL d'image avec cache busting (timestamp).
 * Utilisé par UserProfile pour forcer le rechargement après upload.
 */
export function getUserImageUrlWithCacheBust(
    userId: number | undefined | null
): string | null {
    const url = getUserImageUrl(userId);
    return url ? `${url}?t=${Date.now()}` : null;
}

/**
 * Construit l'URL de téléchargement d'une pièce jointe de commentaire.
 * Gère les chemins relatifs et absolus.
 * Utilisé par CommentItem.
 */
export function getCommentAttachmentUrl(path: string): string {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
    return `${base}/${path}`;
}