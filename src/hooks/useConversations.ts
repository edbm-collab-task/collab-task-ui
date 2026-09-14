import { useCallback, useState } from "react";
import { messageService } from "@/services/message/message.service";
import type { Conversation } from "@/types/message";

/**
 * Hook centralisant la gestion des conversations (chargement, sélection,
 * synchronisation, pin, archivage, suppression, sortie de groupe).
 */
export function useConversations() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    const loadConversations = useCallback(async () => {
        try {
            const data = await messageService.getConversations(true);
            setConversations(data);
            return data;
        } catch (error) {
            console.error("Erreur lors du chargement des conversations :", error);
            return [];
        }
    }, []);

    const selectConversation = useCallback(async (conversation: Conversation) => {
        try {
            setSelectedConversation(conversation);

            const loadedConversations = await messageService.getConversations(true);
            setConversations(loadedConversations);

            const updated = loadedConversations.find((item) => item.id === conversation.id);
            if (updated) {
                setSelectedConversation(updated);
            }
        } catch (error) {
            console.error("Erreur lors de la sélection de la conversation :", error);
        }
    }, []);

    const synchronizeConversation = useCallback(async (conversationId: number) => {
        try {
            const data = await messageService.getConversations(true);
            setConversations(data);

            const updated = data.find((conversation) => conversation.id === conversationId);
            if (updated) {
                setSelectedConversation(updated);
            }
        } catch (error) {
            console.error("Erreur de synchronisation des conversations :", error);
        }
    }, []);

    const togglePin = useCallback(async () => {
        if (!selectedConversation) return;

        try {
            const updated = await messageService.togglePin(selectedConversation.id);
            const list = await messageService.getConversations(true);
            setConversations(list);

            const synchronized = list.find((item) => item.id === updated.id);
            setSelectedConversation(synchronized ?? updated);
        } catch (error) {
            console.error("Erreur lors de la modification de l'épingle :", error);
        }
    }, [selectedConversation]);

    const archive = useCallback(async (loadMessages: (id: number) => Promise<void>) => {
        if (!selectedConversation) return;

        try {
            const updated = await messageService.archiveConversation(selectedConversation.id);
            const list = await messageService.getConversations(true);
            setConversations(list);

            if (updated.archived) {
                const next = list.find((conversation) => !conversation.archived) ?? null;
                setSelectedConversation(next);

                if (next) {
                    await loadMessages(next.id);
                }
            } else {
                setSelectedConversation(updated);
                await loadMessages(updated.id);
            }
        } catch (error) {
            console.error("Erreur lors de l'archivage :", error);
        }
    }, [selectedConversation]);

    const deleteConversation = useCallback(async (loadMessages: (id: number) => Promise<void>) => {
        if (!selectedConversation) return;

        const confirmed = window.confirm("Voulez-vous vraiment supprimer cette conversation ?");
        if (!confirmed) return;

        try {
            await messageService.deleteConversation(selectedConversation.id);

            const list = await messageService.getConversations(true);
            setConversations(list);

            const next = list.find((conversation) => !conversation.archived) ?? null;
            setSelectedConversation(next);

            if (next) {
                await loadMessages(next.id);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la conversation :", error);
        }
    }, [selectedConversation]);

    const leaveGroup = useCallback(async (loadMessages: (id: number) => Promise<void>) => {
        if (!selectedConversation) return;

        const confirmed = window.confirm("Voulez-vous quitter ce groupe ?");
        if (!confirmed) return;

        try {
            await messageService.leaveGroup(selectedConversation.id);

            const list = await messageService.getConversations(true);
            setConversations(list);

            const next = list.find((conversation) => !conversation.archived) ?? null;
            setSelectedConversation(next);

            if (next) {
                await loadMessages(next.id);
            }
        } catch (error) {
            console.error("Erreur lors de la sortie du groupe :", error);
        }
    }, [selectedConversation]);

    const markRead = useCallback(async () => {
        if (!selectedConversation) return;

        try {
            await messageService.markAsRead(selectedConversation.id);
            const list = await messageService.getConversations(true);
            setConversations(list);

            const updated = list.find((item) => item.id === selectedConversation.id);
            if (updated) {
                setSelectedConversation(updated);
            }
        } catch (error) {
            console.error("Erreur lors du marquage comme lu :", error);
        }
    }, [selectedConversation]);

    const newConversation = useCallback(async (user: { id: number }) => {
        try {
            const conversation = await messageService.createPrivateConversation({ userId: user.id });
            const loadedConversations = await messageService.getConversations(true);
            setConversations(loadedConversations);
            setSelectedConversation(conversation);
            return conversation;
        } catch (error) {
            console.error("Erreur lors de la création de la conversation :", error);
            return null;
        }
    }, []);

    const createGroup = useCallback(async (name: string, memberIds: number[]) => {
        try {
            const conversation = await messageService.createGroup({ name, memberIds });
            const loadedConversations = await messageService.getConversations(true);
            setConversations(loadedConversations);
            setSelectedConversation(conversation);
            return conversation;
        } catch (error) {
            console.error("Erreur lors de la création du groupe :", error);
            return null;
        }
    }, []);

    const addMembers = useCallback(async (memberIds: number[]) => {
        if (!selectedConversation) return;

        try {
            const conversation = await messageService.addMembers(selectedConversation.id, { memberIds });
            setSelectedConversation(conversation);

            const loadedConversations = await messageService.getConversations(true);
            setConversations(loadedConversations);
        } catch (error) {
            console.error("Erreur lors de l'ajout des membres :", error);
        }
    }, [selectedConversation]);

    return {
        conversations,
        selectedConversation,
        setSelectedConversation,
        loadConversations,
        selectConversation,
        synchronizeConversation,
        togglePin,
        archive,
        deleteConversation,
        leaveGroup,
        markRead,
        newConversation,
        createGroup,
        addMembers,
    };
}
