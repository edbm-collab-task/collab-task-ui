import { useCallback, useEffect, useState } from "react";

import { MessageCircle } from "lucide-react";

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
import { messageService } from "@/services/message/message.service";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";

import type { ChatUser } from "@/types/message";

const MessagePage = () => {
    const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [call, setCall] = useState<"audio" | "video" | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const {
        conversations,
        selectedConversation,
        setSelectedConversation,
        loadConversations,
        selectConversation,
        togglePin,
        archive,
        deleteConversation,
        leaveGroup,
        markRead,
        newConversation,
        createGroup,
        addMembers,
    } = useConversations();

    const {
        messages,
        setMessages,
        replyMessage,
        setReplyMessage,
        loadMessages,
        sendMessage,
        deleteMessage,
        copyMessage,
        clearReply,
    } = useMessages(selectedConversation);

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                setLoading(true);

                const [loadedCurrentUser, loadedUsers, loadedConversations] = await Promise.all([
                    messageService.getCurrentUser(),
                    messageService.getUsers(),
                    loadConversations(),
                ]);

                if (!mounted) return;

                setCurrentUser(loadedCurrentUser);
                setUsers(loadedUsers);

                if (loadedConversations.length > 0) {
                    const firstConversation =
                        loadedConversations.find((conversation) => !conversation.archived) ??
                        loadedConversations[0];

                    setSelectedConversation(firstConversation);

                    const loadedMessages = await messageService.getMessages(firstConversation.id);

                    if (!mounted) return;

                    setMessages(loadedMessages);

                    await messageService.markAsRead(firstConversation.id);

                    const refreshed = await loadConversations();

                    if (!mounted) return;

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
        };
    }, []);

    const handleNewConversation = async (user: ChatUser) => {
        try {
            setActionLoading(true);
            await newConversation(user);
            setShowNewConversation(false);

            const loadedMessages = selectedConversation
                ? await messageService.getMessages(selectedConversation.id)
                : [];

            if (loadedMessages.length > 0) {
                setMessages(loadedMessages);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateGroup = async (name: string, memberIds: number[]) => {
        try {
            setActionLoading(true);
            const conversation = await createGroup(name, memberIds);
            setShowCreateGroup(false);

            if (conversation) {
                setMessages([]);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddMembers = async (memberIds: number[]) => {
        try {
            setActionLoading(true);
            await addMembers(memberIds);
            setShowMembers(false);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendMessage = async (content: string, files: File[]) => {
        try {
            setActionLoading(true);
            await sendMessage(content, files);

            if (selectedConversation) {
                const loadedConversations = await messageService.getConversations(true);
                const updated = loadedConversations.find(
                    (conversation) => conversation.id === selectedConversation.id
                );
                if (updated) {
                    setSelectedConversation(updated);
                }
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        try {
            setActionLoading(true);
            await deleteMessage(messageId);
            await loadConversations();
        } finally {
            setActionLoading(false);
        }
    };

    const handleTogglePin = async () => {
        try {
            setActionLoading(true);
            await togglePin();
            setShowMenu(false);
        } finally {
            setActionLoading(false);
        }
    };

    const handleArchive = async () => {
        try {
            setActionLoading(true);
            await archive(loadMessages);
            setShowMenu(false);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteConversation = async () => {
        try {
            setActionLoading(true);
            await deleteConversation(loadMessages);
            setShowMenu(false);
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeaveGroup = async () => {
        try {
            setActionLoading(true);
            await leaveGroup(loadMessages);
            setShowMenu(false);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSelectConversation = useCallback(async (conversation: typeof conversations[0]) => {
        try {
            await selectConversation(conversation);
            setReplyMessage(null);
            setShowMenu(false);
            setShowSearch(false);

            const loadedMessages = await messageService.getMessages(conversation.id);
            setMessages(loadedMessages);

            await messageService.markAsRead(conversation.id);

            const loadedConversations = await messageService.getConversations(true);
            const updated = loadedConversations.find((item) => item.id === conversation.id);
            if (updated) {
                setSelectedConversation(updated);
            }
        } catch (error) {
            console.error("Erreur lors de la sélection de la conversation :", error);
        }
    }, [selectConversation, setMessages, setSelectedConversation]);

    if (loading) {
        return <MessagePageSkeleton />;
    }

    return (
        <div className="h-full overflow-hidden bg-bg p-3 sm:p-4">
            <div className="flex h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-sm sm:rounded-2xl">
            <ConversationSidebar
                conversations={conversations}
                users={users}
                messages={messages}
                selectedId={selectedConversation?.id ?? null}
                currentUserId={currentUser?.id ?? 0}
                onSelect={handleSelectConversation}
                onNewConversation={() => setShowNewConversation(true)}
                onCreateGroup={() => setShowCreateGroup(true)}
            />

            {selectedConversation ? (
                <main className="flex min-w-0 flex-1 flex-col">
                    <ChatHeader
                        conversation={selectedConversation}
                        users={users}
                        currentUserId={currentUser?.id ?? 0}
                        onSearch={() => setShowSearch(true)}
                        onAudioCall={() => setCall("audio")}
                        onVideoCall={() => setCall("video")}
                        onMembers={() => setShowMembers(true)}
                        onMenu={() => setShowMenu((value) => !value)}
                    />

                    <MessageList
                        messages={messages}
                        users={users}
                        currentUserId={currentUser?.id ?? 0}
                        onReply={setReplyMessage}
                        onDelete={handleDeleteMessage}
                        onCopy={copyMessage}
                    />

                    <MessageComposer
                        users={users.filter((user) =>
                            selectedConversation.memberIds.includes(user.id)
                        )}
                        replyMessage={replyMessage}
                        onCancelReply={clearReply}
                        onSend={handleSendMessage}
                    />
                </main>
            ) : (
                <main className="flex flex-1 items-center justify-center bg-bg">
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
                            <MessageCircle size={28} />
                        </div>

                        <h2 className="mt-5 font-semibold text-primary">
                            Vos messages
                        </h2>

                        <p className="mt-1.5 text-sm text-gray-500">
                            Commencez une nouvelle conversation.
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowNewConversation(true)}
                            className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
                    onSelect={handleNewConversation}
                />
            )}

            {showCreateGroup && (
                <CreateGroupModal
                    users={users.filter((user) => user.id !== currentUser?.id)}
                    onClose={() => setShowCreateGroup(false)}
                    onCreate={handleCreateGroup}
                />
            )}

            {showMembers && selectedConversation?.type === "group" && (
                <GroupMembersModal
                    conversation={selectedConversation}
                    users={users}
                    onClose={() => setShowMembers(false)}
                    onAdd={handleAddMembers}
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
                    onPin={handleTogglePin}
                    onArchive={handleArchive}
                    onDelete={handleDeleteConversation}
                    onLeave={handleLeaveGroup}
                />
            )}

            {actionLoading && (
                <div className="pointer-events-none fixed bottom-5 right-5 z-[100] rounded-lg bg-primary px-4 py-2 text-sm text-white shadow-lg">
                    envoyer...
                </div>
            )}
            </div>
        </div>
    );
};

const MessagePageSkeleton = () => {
    return (
        <div className="h-full overflow-hidden bg-bg p-3 sm:p-4">
            <div className="flex h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-sm sm:rounded-2xl">
            <aside className="flex w-[300px] shrink-0 flex-col border-r border-gray-200 bg-white sm:w-[320px]">
                <div className="flex h-[72px] items-center justify-between border-b border-gray-200 px-4">
                    <div className="h-6 w-32 animate-pulse rounded-md bg-secondary" />

                    <div className="flex gap-2">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                    </div>
                </div>

                <div className="border-b border-gray-200 p-3">
                    <div className="h-10 w-full animate-pulse rounded-lg bg-secondary/50" />
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
                        <div className="h-11 w-11 animate-pulse rounded-full bg-secondary" />

                        <div className="space-y-2">
                            <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                            <div className="h-3 w-20 animate-pulse rounded bg-secondary/50" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-bg px-6 py-6">
                    <div className="flex justify-start">
                        <div className="flex items-end gap-2">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />

                            <div className="space-y-2">
                                <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
                                <div className="h-12 w-64 animate-pulse rounded-2xl bg-secondary" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="h-14 w-64 animate-pulse rounded-2xl bg-accent/40" />
                    </div>

                    <div className="mt-6 flex justify-start">
                        <div className="flex items-end gap-2">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                            <div className="h-16 w-72 animate-pulse rounded-2xl bg-secondary" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="h-12 w-48 animate-pulse rounded-2xl bg-accent/40" />
                    </div>

                    <div className="mt-6 flex justify-start">
                        <div className="flex items-end gap-2">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                            <div className="h-10 w-56 animate-pulse rounded-2xl bg-secondary" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
                        <div className="h-11 flex-1 animate-pulse rounded-xl bg-secondary/50" />
                        <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
};

const ConversationSkeleton = () => {
    return (
        <div className="flex items-center gap-3 rounded-xl p-3">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-secondary" />

            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-10 animate-pulse rounded bg-secondary/50" />
                </div>

                <div className="h-3 w-40 animate-pulse rounded bg-secondary/50" />
            </div>
        </div>
    );
};

export default MessagePage;
