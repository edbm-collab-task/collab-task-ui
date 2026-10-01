import { useCallback, useEffect, useRef, useState } from "react";
import { messageSocket } from "@/components/message/message.socket";
import { messageService } from "@/services/message/message.service";
import type { Conversation, Message } from "@/types/message";

const MESSAGES_PAGE_SIZE = 15;

/**
 * Hook centralisant la gestion des messages (chargement, envoi,
 * suppression, copie, synchronisation WebSocket).
 *
 * WebSocket : connexion STOMP singleton (messageSocket) par conversation.
 * À chaque changement de selectedConversation, on déconnecte l'ancien et connecte le nouveau.
 * Les messages reçus sont ajoutés à l'état local (déduplication par ID).
 *
 * Pagination : loadMessages() charge la page la plus récente
 * (MESSAGES_PAGE_SIZE messages) et loadOlderMessages() préfixe les pages
 * suivantes, plus anciennes, à la demande du défilement. Le tableau reste
 * ordonné du plus ancien au plus récent.
 *
 * IMPORTANT : Ce hook ne met PAS à jour la liste des conversations (unreadCount, lastMessage).
 * Cette responsabilité incombe à useConversations qui doit recharger via loadConversations().
 * La fonction synchronizeConversation de useConversations existe pour ça mais n'est pas appelée.
 */
export function useMessages(selectedConversation: Conversation | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [replyMessage, setReplyMessage] = useState<Message | null>(null);

    // Empêche deux chargements simultanés quand l'utilisateur fait défiler
    // plusieurs fois le haut de la liste avant le retour réseau.
    const loadingMoreRef = useRef(false);

    const loadMessages = useCallback(async (conversationId: number) => {
        try {
            setIsLoading(true);
            loadingMoreRef.current = false;

            const page = await messageService.getMessages(conversationId, {
                limit: MESSAGES_PAGE_SIZE,
            });

            setMessages(page.items);
            setHasMore(page.hasMore);
        } catch (error) {
            console.error("Erreur lors du chargement des messages :", error);
            setMessages([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Préfixe la page de messages plus anciens à la liste courante.
     * Sans effet si le premier message est déjà en cours de chargement ou
     * s'il n'y a plus rien à charger.
     */
    const loadOlderMessages = useCallback(async () => {
        if (loadingMoreRef.current || !hasMore || !selectedConversation) {
            return;
        }

        const oldest = messages[0];

        if (!oldest) {
            return;
        }

        try {
            loadingMoreRef.current = true;
            setIsLoadingMore(true);

            const page = await messageService.getMessages(selectedConversation.id, {
                limit: MESSAGES_PAGE_SIZE,
                before: oldest.id,
            });

            setMessages((previous) => {
                const known = new Set(previous.map((item) => item.id));

                return [
                    ...page.items.filter((item) => !known.has(item.id)),
                    ...previous,
                ];
            });

            setHasMore(page.hasMore);
        } catch (error) {
            console.error("Erreur lors du chargement des messages plus anciens :", error);
        } finally {
            loadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    }, [hasMore, messages, selectedConversation]);

    // Cycle de vie WebSocket : connect/disconnect selon selectedConversation
    useEffect(() => {
        if (!selectedConversation?.id) {
            messageSocket.disconnect();
            loadingMoreRef.current = false;
            setHasMore(false);
            setIsLoadingMore(false);
            return;
        }

        const handleSocketMessage = (incomingMessage: Message) => {
            // Le message WS peut ne pas avoir conversationId (dépend du backend)
            // On fallback sur selectedConversation.id
            const messageConversationId = Number(
                (incomingMessage as Message & { conversationId?: number }).conversationId ?? selectedConversation.id
            );

            if (messageConversationId !== selectedConversation.id) return;

            setMessages((previous) => {
                const exists = previous.some((item) => item.id === incomingMessage.id);
                if (exists) return previous;
                return [...previous, incomingMessage];
            });
        };

        messageSocket.connect(selectedConversation.id, handleSocketMessage);

        return () => {
            messageSocket.disconnect();
        };
    }, [selectedConversation?.id]);

    const sendMessage = useCallback(async (content: string, files: File[]) => {
        if (!selectedConversation) return;

        try {
            const message = await messageService.sendMessage(selectedConversation.id, {
                content,
                replyToId: replyMessage?.id ?? null,
                attachments: files,
            });

            // Optimistic-like : on ajoute le message retourné par l'API (avec ID serveur)
            // Pas d'optimistic pur car on attend la réponse HTTP avant d'afficher
            setMessages((previous) => {
                const exists = previous.some((item) => item.id === message.id);
                if (exists) return previous;
                return [...previous, message];
            });

            setReplyMessage(null);
            return message;
        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
            return null;
        }
    }, [selectedConversation, replyMessage]);

    /**
     * Supprime un message côté serveur puis applique la même transformation
     * locale que le backend (suppression logique : drapeau deleted, contenu
     * vidé, pièces jointes retirées).
     *
     * <p>Recharger la conversation ici renvoyerait l'utilisateur en bas de
     * l'historique puisqu'une page ne contient que les messages récents. La
     * mise à jour locale préserve la position de défilement ; le retour arrière
     * rétablit le message si l'appel échoue.
     */
    const deleteMessage = useCallback(async (messageId: number) => {
        if (!selectedConversation) return;

        let previousMessage: Message | undefined;

        setMessages((previous) => {
            previousMessage = previous.find((item) => item.id === messageId);

            if (!previousMessage) {
                return previous;
            }

            return previous.map((item) =>
                item.id === messageId
                    ? { ...item, deleted: true, content: "", attachments: [] }
                    : item
            );
        });

        try {
            await messageService.deleteMessage(messageId);
        } catch (error) {
            console.error("Erreur lors de la suppression du message :", error);

            if (previousMessage) {
                const restored = previousMessage;

                setMessages((previous) =>
                    previous.map((item) => (item.id === messageId ? restored : item))
                );
            }
        }
    }, [selectedConversation]);

    const copyMessage = useCallback(async (content: string) => {
        if (!content) return;

        try {
            await navigator.clipboard.writeText(content);
            window.alert("Message copié dans le presse-papiers.");
        } catch (error) {
            console.error("Erreur lors de la copie du message :", error);
        }
    }, []);

    const clearReply = useCallback(() => setReplyMessage(null), []);

    return {
        messages,
        setMessages,
        hasMore,
        isLoading,
        isLoadingMore,
        loadOlderMessages,
        replyMessage,
        setReplyMessage,
        loadMessages,
        sendMessage,
        deleteMessage,
        copyMessage,
        clearReply,
    };
}
