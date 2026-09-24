/**
 * Utilitaires de formatage de taille de fichiers.
 * Trois variantes existent dans le codebase :
 * - Unités anglaises avec GB (MessageItem)
 * - Unités anglaises sans GB (MessageComposer, CommentItem)
 * - Unités françaises (TaskModal)
 */

/**
 * Formate une taille en octets avec unités anglaises (B, KB, MB, GB).
 * Gère le cas 0/null.
 * Utilisé par MessageItem.
 */
export function formatFileSizeEn(bytes: number): string {
    if (!bytes || bytes <= 0) return "0 B";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Formate une taille en octets avec unités anglaises (B, KB, MB).
 * Pas de gestion GB, pas de gestion 0/null explicite (commence à < 1024).
 * Utilisé par MessageComposer, CommentItem.
 */
export function formatFileSizeEnShort(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Formate une taille en octets avec unités françaises (o, Ko, Mo).
 * Utilisé par TaskModal pour les pièces jointes de tâches.
 */
export function formatFileSizeFr(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}