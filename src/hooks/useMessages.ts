import { useCallback, useEffect, useState } from "react";
import { messageSocket } from "@/components/message/message.socket";
import { messageService } from "@/services/message/message.service";
import type { Conversation, Message } from "@/types/message";

/**
 * Hook centralisant la gestion des messages (chargement, envoi,
 * suppression, copie, synchronisation WebSocket).
 * 
 * WebSocket : connexion STOMP singleton (messageSocket) par conversation.
 * À chaque changement de selectedConversation, on déconnecte l'ancien et connecte le nouveau.
 * Les messages reçus sont ajoutés à l'état local (déduplication par ID).
 * 
 * IMPORTANT : Ce hook ne met PAS à jour la liste des conversations (unreadCount, lastMessage).
 * Cette responsabilité incombe à useConversations qui doit recharger via loadConversations().
 * La fonction synchronizeConversation de useConversations existe pour ça mais n'est pas appelée.
 */
export function useMessages(selectedConversation: Conversation | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyMessage, setReplyMessage] = useState<Message | null>(null);

    const loadMessages = useCallback(async (conversationId: number) => {
        try {
            const data = await messageService.getMessages(conversationId);
            setMessages(data);
        } catch (error) {
            console.error("Erreur lors du chargement des messages :", error);
            setMessages([]);
        }
    }, []);

    // Cycle de vie WebSocket : connect/disconnect selon selectedConversation
    useEffect(() => {
        if (!selectedConversation?.id) {
            messageSocket.disconnect();
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

    const deleteMessage = useCallback(async (messageId: number) => {
        if (!selectedConversation) return;

        try {
            await messageService.deleteMessage(messageId);
            await loadMessages(selectedConversation.id);
        } catch (error) {
            console.error("Erreur lors de la suppression du message :", error);
        }
    }, [selectedConversation, loadMessages]);

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
        replyMessage,
        setReplyMessage,
        loadMessages,
        sendMessage,
        deleteMessage,
        copyMessage,
        clearReply,
    };
}
