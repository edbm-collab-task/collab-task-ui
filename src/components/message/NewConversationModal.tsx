import { useState } from "react";
import { Search, User, X } from "lucide-react";

import type { ChatUser } from "@/types/message";

import { API_CONFIG, API_ENDPOINTS } from "@/api/constants";

interface NewConversationModalProps {
    users: ChatUser[];
    onClose: () => void;
    onSelect: (user: ChatUser) => void;
}

const getUserImageUrl = (
    userId: number,
    avatar: string | null | undefined
): string | null => {
    if (!avatar || avatar.trim() === "") {
        return null;
    }

    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/image`;
};

const NewConversationModal = ({
    users,
    onClose,
    onSelect,
}: NewConversationModalProps) => {
    const [search, setSearch] = useState("");

    const filteredUsers = users.filter((user) => {
        const value = search.toLowerCase().trim();

        return (
            `${user.firstname} ${user.lastname}`
                .toLowerCase()
                .includes(value) ||
            user.email?.toLowerCase().includes(value)
        );
    });

    const handleImageError = (
        event: React.SyntheticEvent<HTMLImageElement>
    ) => {
        event.currentTarget.style.display = "none";

        const fallback = event.currentTarget.nextElementSibling;

        if (fallback instanceof HTMLElement) {
            fallback.style.display = "flex";
        }
    };

    const getInitials = (user: ChatUser) => {
        return `${user.firstname?.charAt(0) ?? ""}${user.lastname?.charAt(0) ?? ""}`.toUpperCase();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md animate-scale-in overflow-hidden rounded-2xl border border-secondary/60 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-secondary/60 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-primary">
                            Nouvelle conversation
                        </h2>

                        <p className="text-sm text-primary/50">
                            Sélectionnez une personne
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-primary/60 transition-colors hover:bg-secondary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Rechercher une personne..."
                            className="w-full rounded-xl border border-secondary/60 bg-secondary/20 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-primary/40 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                        />
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto px-2 pb-3">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                            const imageUrl = getUserImageUrl(
                                user.id,
                                user.avatar
                            );

                            const initials = getInitials(user);

                            return (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => onSelect(user)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-secondary/50"
                                >
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                                        {imageUrl && (
                                            <img
                                                src={imageUrl}
                                                alt={`${user.firstname} ${user.lastname}`}
                                                className="h-full w-full object-cover"
                                                onError={handleImageError}
                                            />
                                        )}

                                        <div
                                            className={`h-full w-full items-center justify-center bg-secondary/70 text-sm font-semibold text-primary ${
                                                imageUrl ? "hidden" : "flex"
                                            }`}
                                        >
                                            {initials || "U"}
                                        </div>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-primary">
                                            {user.firstname}{" "}
                                            {user.lastname}
                                        </p>

                                        {user.email && (
                                            <p className="truncate text-xs text-primary/50">
                                                {user.email}
                                            </p>
                                        )}
                                    </div>

                                    {user.online && (
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-4 py-10 text-center">
                            <User
                                size={32}
                                className="mx-auto text-secondary"
                            />

                            <p className="mt-2 text-sm font-medium text-primary/70">
                                Aucun utilisateur trouvé
                            </p>

                            <p className="mt-1 text-xs text-primary/40">
                                Essayez avec un autre nom ou email.
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-t border-secondary/60 bg-secondary/20 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl border border-secondary/60 bg-white px-4 py-2.5 text-sm font-medium text-primary/70 transition-colors hover:bg-secondary/50 hover:text-primary"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewConversationModal;