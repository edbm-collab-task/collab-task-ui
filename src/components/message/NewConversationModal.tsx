import { useState } from "react";
import { Search, X, User } from "lucide-react";

import type { ChatUser } from "@/types/message";

interface NewConversationModalProps {
    users: ChatUser[];
    onClose: () => void;
    onSelect: (user: ChatUser) => void;
}

const NewConversationModal = ({
    users,
    onClose,
    onSelect,
}: NewConversationModalProps) => {
    const [search, setSearch] = useState("");

    const filteredUsers = users.filter((user) => {
        const value = search.toLowerCase();

        return (
            `${user.firstname} ${user.lastname}`
                .toLowerCase()
                .includes(value) ||
            user.email
                ?.toLowerCase()
                .includes(value)
        );
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Nouvelle conversation
                        </h2>

                        <p className="text-sm text-gray-500">
                            Sélectionnez une personne
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Rechercher une personne..."
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto px-2 pb-3">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() =>
                                    onSelect(user)
                                }
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-blue-50"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={`${user.firstname} ${user.lastname}`}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <User size={19} />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {user.firstname}{" "}
                                        {user.lastname}
                                    </p>

                                    {user.email && (
                                        <p className="truncate text-xs text-gray-500">
                                            {user.email}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-10 text-center">
                            <User
                                size={32}
                                className="mx-auto text-gray-300"
                            />

                            <p className="mt-2 text-sm font-medium text-gray-600">
                                Aucun utilisateur trouvé
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Essayez avec un autre nom ou email.
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewConversationModal;