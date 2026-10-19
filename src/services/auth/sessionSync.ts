import type { UserLoginRes } from "@/types/user";

/**
 * Motif d'une demande de resynchronisation de la session.
 * - `navigation` : changement de route (détecté par ProtectedRoute)
 * - `focus` : la fenêtre redevient visible (onglet / application)
 * - `403` : le serveur a refusé une action → les droits de l'utilisateur
 *   ont probablement changé
 * - `token-refresh` : le refresh 401 a renvoyé une session complète
 */
export type SessionResyncReason = "navigation" | "focus" | "403" | "token-refresh";

/** Payload transmis aux listeners abonnés. */
export interface SessionResyncPayload {
    reason: SessionResyncReason;
    /** Session complète si le déclencheur en dispose déjà (refresh 401). */
    user?: UserLoginRes;
}

type Listener = (payload: SessionResyncPayload) => void;

/** Throttle pour les resyncs "doux" (navigation, focus) : 1 appel max / 30 s. */
const THROTTLE_MS = 30_000;

/** Dédoublonnage pour les resyncs forcés (403) : 1 appel max / 2 s. */
const DEDUPE_MS = 2_000;

const listeners = new Set<Listener>();

let lastThrottledAt = 0;
let lastForcedAt = 0;

/**
 * Abonne un listener aux demandes de resynchronisation de session.
 * Retourne la fonction d'unsubscribe.
 */
export function onSessionResync(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * Demande une resynchronisation de la session (GET /auth/me côté AuthProvider).
 *
 * - Raison classique (`navigation`, `focus`) : throttlée à 1 appel toutes les
 *   30 s pour ne pas spammer le serveur quand l'utilisateur navigue vite.
 * - `force: true` (403) : contourne le throttle 30 s mais reste dédoublonné
 *   à 2 s (une page peut déclencher plusieurs 403 d'un coup).
 * - Payload `user` déjà complet (refresh 401) : aucun throttle, l'AuthProvider
 *   l'injecte directement sans appel HTTP supplémentaire.
 */
export function requestSessionResync(
    reason: SessionResyncReason,
    options?: { force?: boolean; user?: UserLoginRes }
): void {
    const deliversSession = Boolean(options?.user?.permissions);

    if (!deliversSession) {
        const now = Date.now();

        if (options?.force) {
            if (now - lastForcedAt < DEDUPE_MS) return;
            lastForcedAt = now;
        } else {
            if (now - lastThrottledAt < THROTTLE_MS) return;
            lastThrottledAt = now;
        }
    }

    if (listeners.size === 0) return;

    const payload: SessionResyncPayload = { reason, user: options?.user };
    listeners.forEach((listener) => listener(payload));
}
