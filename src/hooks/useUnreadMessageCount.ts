import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { messageService } from "@/services/message/message.service";

const MESSAGE_PAGE_PATH = "/admin/messages";
const REFRESH_INTERVAL_MS = 30000;

/**
 * Fournit le nombre total de messages non lus de l'utilisateur courant.
 *
 * <p>Stratégie de rafraîchissement (alignée sur celle de
 * {@code NotificationBell}, qui interroge la cloche toutes les 30 s) :
 * <ul>
 *   <li>un chargement au montage du composant ;</li>
 *   <li>un rechargement immédiat au retour depuis la page de messagerie
 *       (où {@code markAsRead} remet le compteur à zéro) ;</li>
 *   <li>un sondage périodique (30 s) pour rester cohérent avec l'existant
 *       sans être agressif.</li>
 * </ul>
 *
 * <p>Les erreurs réseau sont ignorées (le précédent compteur est conservé),
 * comme pour la cloche de notifications.
 */
export function useUnreadMessageCount(): number {
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const wasOnMessages = useRef(false);

    const loadUnreadCount = useCallback(async () => {
        try {
            const count = await messageService.getUnreadCount();
            setUnreadCount(count);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        loadUnreadCount();
    }, [loadUnreadCount]);

    useEffect(() => {
        const isOnMessages =
            location.pathname.startsWith(MESSAGE_PAGE_PATH);
        if (wasOnMessages.current && !isOnMessages) {
            loadUnreadCount();
        }
        wasOnMessages.current = isOnMessages;
    }, [location.pathname, loadUnreadCount]);

    useEffect(() => {
        const interval = setInterval(
            loadUnreadCount,
            REFRESH_INTERVAL_MS
        );
        return () => clearInterval(interval);
    }, [loadUnreadCount]);

    return unreadCount;
}