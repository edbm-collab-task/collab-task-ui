import { useMemo, useState } from "react";
import {
    Check,
    Search,
    Users,
    X,
} from "lucide-react";

import type { ChatUser } from "@/types/message";

interface Props {
    users: ChatUser[];
    onClose: () => void;
    onCreate: (
        name: string,
        memberIds: number[]
    ) => void;
}

const CreateGroupModal = ({
    users,
    onClose,
    onCreate,
}: Props) => {
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] =
        useState<number[]>([]);

    const filtered = useMemo(() => {
        const value = search
            .toLowerCase()
            .trim();

        return users.filter((user) => {
            if (user.id === 1) return false;

            return (
                !value ||
                `${user.firstname} ${user.lastname} ${user.email}`
                    .toLowerCase()
                    .includes(value)
            );
        });
    }, [users, search]);

    const toggle = (id: number) => {
        setSelected((current) =>
            current.includes(id)
                ? current.filter(
                      (item) => item !== id
                  )
                : [...current, id]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Users size={20} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Créer un groupe
                            </h2>

                            <p className="text-xs text-gray-400">
                                Ajoutez les membres
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <input
                        value={name}
                        onChange={(event) =>
                            setName(
                                event.target.value
                            )
                        }
                        placeholder="Nom du groupe"
                        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    />

                    <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-100">
                        <Search
                            size={17}
                            className="text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Rechercher un membre..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
                        {filtered.map((user) => {
                            const active =
                                selected.includes(
                                    user.id
                                );

                            return (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() =>
                                        toggle(
                                            user.id
                                        )
                                    }
                                    className={`flex w-full items-center gap-3 border-b border-gray-100 px-3 py-3 text-left transition-colors last:border-0 ${
                                        active
                                            ? "bg-blue-50"
                                            : "hover:bg-blue-50/50"
                                    }`}
                                >
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
                                            active
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {user.firstname[0]}
                                        {user.lastname[0]}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-700">
                                            {
                                                user.firstname
                                            }{" "}
                                            {
                                                user.lastname
                                            }
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            {user.email}
                                        </p>
                                    </div>

                                    <span
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                                            active
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-gray-300 text-transparent"
                                        }`}
                                    >
                                        {active && (
                                            <Check
                                                size={
                                                    14
                                                }
                                            />
                                        )}
                                    </span>
                                </button>
                            );
                        })}

                        {filtered.length ===
                            0 && (
                            <div className="px-4 py-8 text-center">
                                <Search
                                    size={28}
                                    className="mx-auto text-gray-300"
                                />

                                <p className="mt-2 text-sm font-medium text-gray-600">
                                    Aucun membre
                                    trouvé
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Essayez avec un
                                    autre nom ou
                                    email.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        Annuler
                    </button>

                    <button
                        type="button"
                        disabled={
                            !name.trim() ||
                            selected.length ===
                                0
                        }
                        onClick={() =>
                            onCreate(
                                name,
                                selected
                            )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Créer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;