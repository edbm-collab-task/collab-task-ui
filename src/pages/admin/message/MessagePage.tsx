import { useCallback, useEffect, useState } from "react";

import CallModal from "@/components/message/CallModal";
import ChatHeader from "@/components/message/ChatHeader";
import ConversationMenu from "@/components/message/ConversationMenu";
import ConversationSidebar from "@/components/message/ConversationSidebar";
import CreateGroupModal from "@/components/message/CreateGroupModal";
import GroupMembersModal from "@/components/message/GroupMembersModal";
import MessageComposer from "@/components/message/MessageComposer";
import MessageList from "@/components/message/MessageList";
import MessageSearchModal from "@/components/message/MessageSearchModal";
import NewConversationModal from "@/components/message/NewConversationModal";
import { messageSocket } from "@/components/message/message.socket";
import { messageService } from "@/services/message/message.service";

import type { ChatUser, Conversation, Message } from "@/types/message";

const MessagePage = () => {
    const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [call, setCall] = useState<"audio" | "video" | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [replyMessage, setReplyMessage] = useState<Message | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loadMessages = useCallback(async (conversationId: number) => {
        try {
            const data = await messageService.getMessages(conversationId);
            setMessages(data);
        } catch (error) {
            console.error("Erreur lors du chargement des messages :", error);
            setMessages([]);
        }
    }, []);

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

    const synchronizeConversation = useCallback(async (conversationId: number) => {
        try {
            const data = await messageService.getConversations(true);
            setConversations(data);

            const updated = data.find((conversation) => conversation.id === conversationId);

            if (updated && selectedConversation?.id === conversationId) {
                setSelectedConversation(updated);
            }
        } catch (error) {
            console.error("Erreur de synchronisation des conversations :", error);
        }
    }, [selectedConversation?.id]);

    const handleSocketMessage = useCallback(async (incomingMessage: Message) => {
        if (!selectedConversation) {
            return;
        }

        const conversationId = selectedConversation.id;
        const messageConversationId = Number(
            (incomingMessage as Message & { conversationId?: number }).conversationId ?? conversationId
        );

        if (messageConversationId !== conversationId) {
            return;
        }

        setMessages((previous) => {
            const exists = previous.some((item) => item.id === incomingMessage.id);

            if (exists) {
                return previous;
            }

            return [...previous, incomingMessage];
        });

        await synchronizeConversation(conversationId);
    }, [selectedConversation, synchronizeConversation]);

    useEffect(() => {
        if (!selectedConversation?.id) {
            messageSocket.disconnect();
            return;
        }

        messageSocket.connect(selectedConversation.id, handleSocketMessage);

        return () => {
            messageSocket.disconnect();
        };
    }, [selectedConversation?.id, handleSocketMessage]);

    const selectConversation = useCallback(async (conversation: Conversation) => {
        try {
            setSelectedConversation(conversation);
            setReplyMessage(null);
            setShowMenu(false);
            setShowSearch(false);

            const loadedMessages = await messageService.getMessages(conversation.id);
            setMessages(loadedMessages);

            await messageService.markAsRead(conversation.id);

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

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                setLoading(true);

                const [loadedCurrentUser, loadedUsers, loadedConversations] = await Promise.all([
                    messageService.getCurrentUser(),
                    messageService.getUsers(),
                    messageService.getConversations(true),
                ]);

                if (!mounted) {
                    return;
                }

                setCurrentUser(loadedCurrentUser);
                setUsers(loadedUsers);
                setConversations(loadedConversations);

                if (loadedConversations.length > 0) {
                    const firstConversation =
                        loadedConversations.find((conversation) => !conversation.archived) ??
                        loadedConversations[0];

                    setSelectedConversation(firstConversation);

                    const loadedMessages = await messageService.getMessages(firstConversation.id);

                    if (!mounted) {
                        return;
                    }

                    setMessages(loadedMessages);

                    await messageService.markAsRead(firstConversation.id);

                    const refreshed = await messageService.getConversations(true);

                    if (!mounted) {
                        return;
                    }

                    setConversations(refreshed);

                    const refreshedSelected = refreshed.find(
                        (conversation) => conversation.id === firstConversation.id
                    );

                    if (refreshedSelected) {
                        setSelectedConversation(refreshedSelected);
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement de la messagerie :", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initialize();

        return () => {
            mounted = false;
            messageSocket.disconnect();
        };
    }, []);

    const newConversation = async (user: ChatUser) => {
        try {
            setActionLoading(true);

            const conversation = await messageService.createPrivateConversation({
                userId: user.id,
            });

            setShowNewConversation(false);

            const loadedConversations = await messageService.getConversations(true);
            setConversations(loadedConversations);
            setSelectedConversation(conversation);

            const loadedMessages = await messageService.getMessages(conversation.id);
            setMessages(loadedMessages);
        } catch (error) {
            console.error("Erreur lors de la création de la conversation :", error);
        } finally {
            setActionLoading(false);
        }
    };

    const createGroup = async (name: string, memberIds: number[]) => {
        try {
            setActionLoading(true);

            const conversation = await messageService.createGroup({
                name,
                memberIds,
            });

            setShowCreateGroup(false);

            const loadedConversations = await messageService.getConversations(true);
            setConversations(loadedConversations);
            setSelectedConversation(conversation);
            setMessages([]);
        } catch (error) {
            console.error("Erreur lors de la création du groupe :", error);
        } finally {
            setActionLoading(false);
        }
    };

    const addMembers = async (memberIds: number[]) => {
        if (!selectedConversation) {
            return;
        }

        try {
            setActionLoading(true);

            const conversation = await messageService.addMembers(selectedConversation.id, {
                memberIds,
            });

            setSelectedConversation(conversation);
            setShowMembers(false);

            const loadedConversations = await messageService.getConversations(true);
            setConversations(loadedConversations);
        } catch (error) {
            console.error("Erreur lors de l'ajout des membres :", error);
        } finally {
            setActionLoading(false);
        }
    };

    const sendMessage = async (content: string, files: File[]) => {
        if (!selectedConversation) {
            return;
        }

        try {
            setActionLoading(true);

            const message = await messageService.sendMessage(selectedConversation.id, {
                content,
                replyToId: replyMessage?.id ?? null,
                attachments: files,
            });

            setMessages((previous) => {
                const exists = previous.some((item) => item.id === message.id);

                if (exists) {
                    return previous;
                }

                return [...previous, message];
            });

            setReplyMessage(null);

            const loadedConversations = await messageService.getConversations(true);
            setConversations(loadedConversations);

            const updated = loadedConversations.find(
                (conversation) => conversation.id === selectedConversation.id
            );

            if (updated) {
                setSelectedConversation(updated);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
        } finally {
            setActionLoading(false);
        }
    };

    const deleteMessage = async (messageId: number) => {
        if (!selectedConversation) {
            return;
        }

        try {
            setActionLoading(true);

            await messageService.deleteMessage(messageId);
            await loadMessages(selectedConversation.id);
            await loadConversations();
        } catch (error) {
            console.error("Erreur lors de la suppression du message :", error);
        } finally {
            setActionLoading(false);
        }
    };

    const copyMessage = async (content: string) => {
        if (!content) {
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
            window.alert("Message copié dans le presse-papiers.");
        } catch (error) {
            console.error("Erreur lors de la copie du message :", error);
        }
    };

    const markRead = async () => {
        if (!selectedConversation) {
            return;
        }

        try {
            await messageService.markAsRead(selectedConversation.id);

            const list = await messageService.getConversations(true);
            setConversations(list);

            const updated = list.find((item) => item.id === selectedConversation.id);

            if (updated) {
                setSelectedConversation(updated);
            }

            setShowMenu(false);
        } catch (error) {
            console.error("Erreur lors du marquage comme lu :", error);
        }
    };

    const togglePin = async () => {
        if (!selectedConversation) {
            return;
        }

        try {
            setActionLoading(true);

            const updated = await messageService.togglePin(selectedConversation.id);
            const list = await messageService.getConversations(true);

            setConversations(list);

            const synchronized = list.find((item) => item.id === updated.id);

            setSelectedConversation(synchronized ?? updated);
            setShowMenu(false);
        } catch (error) {
            console.error("Erreur lors de la modification de l'épingle :", error);
        } finally {
            setActionLoading(false);
        }
    };

    const archive = async () => {
        if (!selectedConversation) {
            return;
        }

        try {
            setActionLoading(true);

            const updated = await messageService.archiveConversation(selectedConversation.id);
            const list = await messageService.getConversations(true);

            setConversations(list);

            if (updated.archived) {
                const next = list.find((conversation) => !conversation.archived) ?? null;

                setSelectedConversation(next);

                if (next) {
                    await loadMessages(next.id);
                } else {
                    setMessages([]);
                }
            } else {
                setSelectedConversation(updated);
                await loadMessages(updated.id);
            }

            setShowMenu(false);
        } catch (error) {
            console.error("Erreur lors de l'archivage :", error);
        } finally {
            setActionLoading(false);
        }
    };

    const deleteConversation = async () => {
        if (!selectedConversation) {
            return;
        }

        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cette conversation ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);

            await messageService.deleteConversation(selectedConversation.id);

            const list = await messageService.getConversations(true);
            setConversations(list);

            const next = list.find((conversation) => !conversation.archived) ?? null;

            setSelectedConversation(next);

            if (next) {
                await loadMessages(next.id);
            } else {
                setMessages([]);
            }

            setShowMenu(false);
        } catch (error) {
            console.error("Erreur lors de la suppression de la conversation :", error);
        } finally {
            setActionLoading(false);
        }
    };

    const leaveGroup = async () => {
        if (!selectedConversation) {
            return;
        }

        const confirmed = window.confirm("Voulez-vous quitter ce groupe ?");

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);

            await messageService.leaveGroup(selectedConversation.id);

            const list = await messageService.getConversations(true);
            setConversations(list);

            const next = list.find((conversation) => !conversation.archived) ?? null;

            setSelectedConversation(next);

            if (next) {
                await loadMessages(next.id);
            } else {
                setMessages([]);
            }

            setShowMenu(false);
        } catch (error) {
            console.error("Erreur lors de la sortie du groupe :", error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <MessagePageSkeleton />;
    }

    return (
        <div className="flex h-full min-h-0 overflow-hidden bg-white">
            <ConversationSidebar
                conversations={conversations}
                users={users}
                messages={messages}
                selectedId={selectedConversation?.id ?? null}
                currentUserId={currentUser?.id ?? 0}
                onSelect={selectConversation}
                onNewConversation={() => setShowNewConversation(true)}
                onCreateGroup={() => setShowCreateGroup(true)}
            />

            {selectedConversation ? (
                <main className="flex min-w-0 flex-1 flex-col">
                    <ChatHeader
                        conversation={selectedConversation}
                        users={users}
                        currentUserId={currentUser?.id ?? 0}
                        onSearch={() =>
                            setShowSearch(
                                true
                            )
                        }
                        onAudioCall={() =>
                            setCall("audio")
                        }
                        onVideoCall={() =>
                            setCall("video")
                        }
                        onMembers={() =>
                            setShowMembers(
                                true
                            )
                        }
                        onMenu={() =>
                            setShowMenu(
                                (value) =>
                                    !value
                            )
                        }
                    />

                    <MessageList
                        messages={messages}
                        users={users}
                        currentUserId={currentUser?.id ?? 0}
                        onReply={setReplyMessage}
                        onDelete={deleteMessage}
                        onCopy={copyMessage}
                    />

                    <MessageComposer
                        users={users.filter((user) =>
                            selectedConversation.memberIds.includes(user.id)
                        )}
                        replyMessage={replyMessage}
                        onCancelReply={() => setReplyMessage(null)}
                        onSend={sendMessage}
                    />
                </main>
            ) : (
                <main className="flex flex-1 items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
                            💬
                        </div>

                        <h2 className="mt-4 font-semibold text-gray-800">
                            Vos messages
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Commencez une nouvelle conversation.
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowNewConversation(true)}
                            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Nouvelle conversation
                        </button>
                    </div>
                </main>
            )}

            {showNewConversation && (
                <NewConversationModal
                    users={users.filter((user) => user.id !== currentUser?.id)}
                    onClose={() => setShowNewConversation(false)}
                    onSelect={newConversation}
                />
            )}

            {showCreateGroup && (
                <CreateGroupModal
                    users={users.filter((user) => user.id !== currentUser?.id)}
                    onClose={() => setShowCreateGroup(false)}
                    onCreate={createGroup}
                />
            )}

            {showMembers && selectedConversation?.type === "group" && (
                <GroupMembersModal
                    conversation={selectedConversation}
                    users={users}
                    onClose={() => setShowMembers(false)}
                    onAdd={addMembers}
                />
            )}

            {showSearch && selectedConversation && (
                <MessageSearchModal
                    messages={messages}
                    users={users}
                    onClose={() => setShowSearch(false)}
                />
            )}

            {call && selectedConversation && (
                <CallModal
                    type={call}
                    name={selectedConversation.name}
                    onClose={() => setCall(null)}
                />
            )}

            {showMenu && selectedConversation && (
                <ConversationMenu
                    pinned={selectedConversation.pinned}
                    archived={selectedConversation.archived}
                    group={selectedConversation.type === "group"}
                    onClose={() => setShowMenu(false)}
                    onMarkRead={markRead}
                    onPin={togglePin}
                    onArchive={archive}
                    onDelete={deleteConversation}
                    onLeave={leaveGroup}
                />
            )}

            {actionLoading && (
                <div className="pointer-events-none fixed bottom-5 right-5 z-[100] rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
                    envoyer...
                </div>
            )}
        </div>
    );
};

const MessagePageSkeleton = () => {
    return (
        <div className="flex h-full min-h-0 overflow-hidden bg-white">
            <aside className="flex w-[320px] shrink-0 flex-col border-r border-gray-200 bg-white">
                <div className="flex h-[72px] items-center justify-between border-b border-gray-200 px-4">
                    <div className="h-6 w-32 animate-pulse rounded-md bg-gray-200" />

                    <div className="flex gap-2">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                    </div>
                </div>

                <div className="border-b border-gray-200 p-3">
                    <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
                </div>

                <div className="flex-1 space-y-2 overflow-hidden p-3">
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                </div>
            </aside>

            <main className="flex min-w-0 flex-1 flex-col">
                <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200 px-5">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />

                        <div className="space-y-2">
                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                            <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-gray-50 px-6 py-6">
                    <div className="flex justify-start">
                        <div className="flex items-end gap-2">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />

                            <div className="space-y-2">
                                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                                <div className="h-12 w-64 animate-pulse rounded-2xl bg-gray-200" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="h-14 w-64 animate-pulse rounded-2xl bg-blue-200" />
                    </div>

                    <div className="mt-6 flex justify-start">
                        <div className="flex items-end gap-2">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                            <div className="h-16 w-72 animate-pulse rounded-2xl bg-gray-200" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="h-12 w-48 animate-pulse rounded-2xl bg-blue-200" />
                    </div>

                    <div className="mt-6 flex justify-start">
                        <div className="flex items-end gap-2">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                            <div className="h-10 w-56 animate-pulse rounded-2xl bg-gray-200" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                        <div className="h-11 flex-1 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                    </div>
                </div>
            </main>
        </div>
    );
};

const ConversationSkeleton = () => {
    return (
        <div className="flex items-center gap-3 rounded-xl p-3">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-gray-200" />

            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
            </div>
        </div>
    );
};

export default MessagePage;