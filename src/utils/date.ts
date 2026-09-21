/**
 * Utilitaires de formatage de dates en français.
 * Tous les formats utilisent le locale "fr-FR".
 */

/**
 * Format court : jour + mois abrégé (ex: "15 janv.")
 * Utilisé pour les cartes de tâches (Kanban, CommentPanel).
 * Retourne null si la date est null/undefined.
 */
export function formatDateShort(date: string | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

/**
 * Format complet : jour + mois abrégé + année (ex: "15 janv. 2024")
 * Utilisé pour les dates de projets, pièces jointes, etc.
 * Retourne "—" si la date est null/undefined.
 */
export function formatDateFull(date: string | null | undefined): string {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/**
 * Format complet avec heure : jour + mois + année + heure + minutes
 * Utilisé pour les tooltips d'historique d'activité (ActivityHistoryPage).
 * La date n'est pas optionnelle ici (toujours fournie par l'API).
 */
export function formatDateTime(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}