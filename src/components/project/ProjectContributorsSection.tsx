import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Users } from "lucide-react";
import UserSearchSelect from "@/components/user/UserSearchSelect";
import { contributorService } from "@/services/contributor/contributor.service";
import { projectService } from "@/services/project/project.service";
import type { ProjectRes } from "@/types/project";
import type { Contributor } from "@/types/contributor";
import type { UserResponse } from "@/types/user";
import type { ConfirmConfig } from "@/components/project/confirmConfig";

interface ProjectContributorsSectionProps {
    project: ProjectRes;
    contributors: Contributor[];
    users: UserResponse[];
    onContributorsChange: () => Promise<void>;
    onUsersChange: () => Promise<void>;
    onProjectChange: (project: ProjectRes) => void;
    openConfirm: (config: ConfirmConfig) => void;
}

export default function ProjectContributorsSection({
    project,
    contributors,
    users,
    onContributorsChange,
    onUsersChange,
    onProjectChange,
    openConfirm,
}: ProjectContributorsSectionProps) {
    const [addingContributor, setAddingContributor] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [transferMode, setTransferMode] = useState(false);
    const [transferTargetId, setTransferTargetId] = useState<number | null>(null);
    const [transferring, setTransferring] = useState(false);

    // Ajout d'un contributeur : on rafraîchit ensuite la liste des contributeurs
    // et la liste des utilisateurs potentiels (car l'utilisateur n'est plus potentiel)
    const handleAddContributor = async () => {
        if (!selectedUserId) return;
        try {
            setAddingContributor(true);
            await contributorService.add(project.projectId, selectedUserId);
            setSelectedUserId(null);
            await Promise.all([onContributorsChange(), onUsersChange()]);
            setTimeout(() => toast.success("Contributeur ajouté"));
        } catch (error) {
            console.error(error);
            setTimeout(() => toast.error("Impossible d'ajouter le contributeur"));
        } finally {
            setAddingContributor(false);
        }
    };

    // Retrait d'un contributeur avec confirmation
    // Le rechargement des deux listes maintient l'UI cohérente
    const handleRemoveContributor = (userId: number, userName: string) => {
        openConfirm({
            open: true,
            title: "Retirer le contributeur",
            message: `Voulez-vous vraiment retirer ${userName} des contributeurs de ce projet ?`,
            confirmLabel: "Retirer",
            variant: "danger",
            onConfirm: async () => {
                try {
                    await contributorService.remove(project.projectId, userId);
                    await Promise.all([onContributorsChange(), onUsersChange()]);
                    setTimeout(() => toast.success("Contributeur retiré"), 0);
                } catch (error) {
                    console.error(error);
                    setTimeout(() => toast.error("Impossible de retirer le contributeur"), 0);
                }
            },
        });
    };

    // Transfert de propriété : action irréversible, double confirmation via ConfirmPopup
    // On met à jour le projet local après succès pour refléter le nouveau propriétaire
    const handleTransferOwnership = () => {
        if (!transferTargetId) return;
        const target = contributors.find(c => c.userId === transferTargetId);

        openConfirm({
            open: true,
            title: "Transférer la propriété",
            message: `Voulez-vous vraiment transférer la propriété du projet à ${target?.userName ?? "cet utilisateur"} ? Vous perdrez vos droits de gestion.`,
            confirmLabel: "Transférer",
            variant: "danger",
            onConfirm: async () => {
                try {
                    setTransferring(true);
                    await projectService.transferOwnership(project.projectId, transferTargetId);
                    toast.success("Propriété transférée avec succès");
                    setTransferMode(false);
                    setTransferTargetId(null);
                    const updated = await projectService.getById(project.projectId);
                    onProjectChange(updated);
                    await onContributorsChange();
                } catch (error) {
                    console.error(error);
                    toast.error("Impossible de transférer la propriété");
                } finally {
                    setTransferring(false);
                }
            },
        });
    };

    return (
        <>
            {/* Section Contributeurs */}
            {project.isOwner && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-500" />
                            <p className="text-sm font-medium text-primary">
                                Contributeurs ({contributors.length})
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 my-3">
                        {contributors.map(c => (
                            <span
                                key={c.userId}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-secondary/30 px-3 py-1.5 text-sm text-gray-600"
                            >
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-bg">
                                    {c.userName?.[0]?.toUpperCase() ?? "?"}
                                </span>
                                {c.userName}
                                {c.userId !== project.ownerId && (
                                    <button
                                        onClick={() => handleRemoveContributor(c.userId, c.userName)}
                                        className="ml-1 text-gray-400 transition hover:text-red-500"
                                        title="Retirer ce contributeur"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </span>
                        ))}
                        {contributors.length === 0 && (
                            <p className="text-xs text-gray-400">Aucun contributeur ajouté.</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <UserSearchSelect
                            users={users.filter(u => u.id !== project.ownerId && !contributors.some(c => c.userId === u.id))}
                            value={selectedUserId}
                            onChange={setSelectedUserId}
                            placeholder="Sélectionner un utilisateur…"
                            searchPlaceholder="Rechercher un utilisateur…"
                        />
                    </div>
                    <div className="flex justify-between items-center gap-3 mt-3">

                        {!transferMode ? (
                            <button
                                onClick={() => setTransferMode(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent/50 hover:bg-accent/20"
                            >
                                Transférer la propriété
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-2 p-2">
                                <UserSearchSelect
                                    users={users.filter(u => u.id !== project.ownerId)}
                                    value={transferTargetId}
                                    onChange={setTransferTargetId}
                                    placeholder="Choisir le nouveau propriétaire…"
                                    searchPlaceholder="Rechercher un propriétaire…"
                                />
                                <div className="flex justify-between w-[100%]">
                                    <button
                                        onClick={() => { setTransferMode(false); setTransferTargetId(null); }}
                                        className="rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleTransferOwnership}
                                        disabled={!transferTargetId || transferring}
                                        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        {transferring ? "Transfert..." : "Confirmer"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleAddContributor}
                            disabled={!selectedUserId || addingContributor}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent disabled:bg-secondary"
                        >
                            {addingContributor ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Ajout...
                                </span>
                            ) : (
                                <>
                                    <Plus size={14} />
                                    Ajouter
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}