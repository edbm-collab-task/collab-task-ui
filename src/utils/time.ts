/**
 * Utilitaires de formatage de temps relatif (ex: "à l'instant", "il y a 5min", "il y a 2h", "il y a 3j").
 * Deux variantes existent dans le codebase :
 * - Avec fallback date courte après 7 jours (CommentItem)
 * - Sans fallback (tous les autres composants)
 */

/**
 * Temps relatif avec fallback date courte après 7 jours.
 * Utilisé par CommentItem pour les dates de commentaires.
 */
export function formatRelativeTimeWithFallback(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "à l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

/**
 * Temps relatif simple sans fallback date.
 * Utilisé par : NotificationBell, NotificationsPage, RecentActivity, ActivityHistoryPage.
 * Après 24h, affiche juste le nombre de jours.
 */
export function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
}