import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { statusService } from "@/services/status/status.service";
import type { Status } from "@/types/status";
import type { ConfirmConfig } from "@/components/project/confirmConfig";

interface ProjectStatusSectionProps {
    projectId: number;
    statuses: Status[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusesChange: () => Promise<void>;
    openConfirm: (config: ConfirmConfig) => void;
}

export default function ProjectStatusSection({
    projectId,
    statuses,
    open,
    onOpenChange,
    onStatusesChange,
    openConfirm,
}: ProjectStatusSectionProps) {
    const [newStatusName, setNewStatusName] = useState("");

    // Réinitialisation ciblée lors d'un changement de projet (comportement d'origine)
    useEffect(() => {
        setNewStatusName("");
    }, [projectId]);

    // Création de statut personnalisé : appel API puis rechargement de la liste
    // Le setTimeout sur le toast permet d'éviter qu'il soit masqué par la mise à jour d'état immédiate
    const handleCreateStatus = async () => {
        if (!newStatusName.trim()) {
            toast.error("Le nom du statut est requis");
            return;
        }
        try {
            await statusService.create({ name: newStatusName.trim(), projectId });
            setNewStatusName("");
            onOpenChange(false);
            await onStatusesChange();
            setTimeout(() => toast.success("Statut créé avec succès"));
        } catch (error) {
            console.error(error);
            setTimeout(() => toast.error("Impossible de créer le statut"));
        }
    };

    // Suppression d'un statut personnalisé avec confirmation
    // On réassigne les tâches concernées côté backend (géré par l'API)
    const handleDeleteStatus = (status: Status) => {
        openConfirm({
            open: true,
            title: "Supprimer le statut",
            message: `Voulez-vous vraiment supprimer le statut « ${status.name} » ? Les tâches associées devront être réassignées.`,
            confirmLabel: "Supprimer",
            variant: "danger",
            onConfirm: async () => {
                try {
                    await statusService.delete(status.statusId);
                    await onStatusesChange();
                    setTimeout(() => toast.success("Statut supprimé"));
                } catch (error) {
                    console.error(error);
                    setTimeout(() => toast.error("Impossible de supprimer le statut"));
                }
            },
        });
    };

    const customStatuses = statuses.filter(s => s.projectId != null);

    return (
        <>
            {/* Statuts personnalisés du projet */}
            {customStatuses.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 text-sm font-medium text-primary">Statuts personnalisés de ce projet</p>
                    <div className="flex flex-wrap gap-2">
                        {customStatuses.map(s => (
                            <span
                                key={s.statusId}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600"
                            >
                                {s.name}
                                <button
                                    onClick={() => handleDeleteStatus(s)}
                                    className="ml-1 text-gray-400 transition hover:text-accent"
                                    title="Supprimer ce statut"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Formulaire de création de statut */}
            {open && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 text-sm font-medium text-primary">Nouveau statut</p>
                    <div className="flex flex-col gap-3">
                        <input
                            value={newStatusName}
                            onChange={(e) => setNewStatusName(e.target.value)}
                            placeholder="Ex: En review"
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                            onKeyDown={(e) => e.key === "Enter" && handleCreateStatus()}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-secondary"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateStatus}
                                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent"
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}