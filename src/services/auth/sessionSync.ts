import type { UserLoginRes } from "@/types/user";

/**
 * Motif d'une demande de resynchronisation de la session.
 * - `navigation` : changement de route (détecté par ProtectedRoute)
 * - `focus` : la fenêtre redevient visible (onglet / application)
 * - `sidebar` : ouverture du sidebar (AdminLayout) — permet d'afficher les
 *   derniers droits avant de parcourir les menus
 * - `403` : le serveur a refusé une action → les droits de l'utilisateur
 *   ont probablement changé
 * - `token-refresh` : le refresh 401 a renvoyé une session complète
 */
export type SessionResyncReason = "navigation" | "focus" | "sidebar" | "403" | "token-refresh";

/** Payload transmis aux listeners abonnés. */
export interface SessionResyncPayload {
    reason: SessionResyncReason;
    /** Session complète si le déclencheur en dispose déjà (refresh 401). */
    user?: UserLoginRes;
}

type Listener = (payload: SessionResyncPayload) => void;

/**
 * Budget de throttle **par raison**.
 *
 * Chaque raison dispose de sa propre fenêtre : une resync « navigation » ne
 * bloque donc plus une resync « sidebar » (et réciproquement). Avant, un
 * budget unique de 1 min était partagé, si bien qu'une demande « sidebar »
 * était presque toujours ignorée — l'ouverture de la barre latérale, geste
 * volontaire de l'utilisateur, ne rafraîchissait jamais les droits.
 *
 * - `navigation` / `focus` : 1 appel max / 1 min (déclenchements fréquents,
 *   le budget limite la charge serveur).
 * - `sidebar` : 1 appel max / 5 s (geste explicite, le résultat est attendu
 *   immédiatement).
 *
 * Une raison absente de cette table n'est pas throttlée.
 */
const THROTTLE_MS_BY_REASON: Partial<Record<SessionResyncReason, number>> = {
    navigation: 60_000,
    focus: 60_000,
    sidebar: 5_000
};

/** Dédoublonnage pour les resyncs forcés (403) : 1 appel max / 2 s. */
const DEDUPE_MS = 2_000;

const listeners = new Set<Listener>();

/** Horodatage du dernier appel retenu, par raison (throttle). */
const lastThrottledAt = new Map<SessionResyncReason, number>();

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
 * - Raison classique (`navigation`, `focus`, `sidebar`) : throttlée selon le
 *   budget de la raison (voir `THROTTLE_MS_BY_REASON`) pour ne pas spammer le
 *   serveur quand l'utilisateur navigue vite. Chaque raison a son propre
 *   budget : une resync « navigation » n'annule pas une resync « sidebar ».
 * - `force: true` (403) : contourne le throttle mais reste dédoublonné
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
            const budget = THROTTLE_MS_BY_REASON[reason];

            if (budget !== undefined) {
                const last = lastThrottledAt.get(reason) ?? 0;

                if (now - last < budget) return;

                lastThrottledAt.set(reason, now);
            }
        }
    }

    if (listeners.size === 0) return;

    const payload: SessionResyncPayload = { reason, user: options?.user };
    listeners.forEach((listener) => listener(payload));
}
