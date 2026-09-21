import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, Pencil, User as UserIcon, Plus, Trash2, Users, History } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { ConfirmPopup } from "@/components/common/ConfirmPopup"; 
import UserSearchSelect from "@/components/user/UserSearchSelect";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskModal from "@/components/kanban/TaskModal";

import { projectService } from "@/services/project/project.service";
import { taskService } from "@/services/task/task.service";
import { statusService } from "@/services/status/status.service";
import { contributorService } from "@/services/contributor/contributor.service";
import { userService } from "@/services/user/user.service";
import useAuth from "@/hooks/useAuth";
import type { ProjectRes } from "@/types/project";
import type { TaskReq, TaskRes } from "@/types/task";
import type { Status } from "@/types/status";
import type { Contributor } from "@/types/contributor";
import type { UserResponse } from "@/types/user";
import { STATUSES } from "@/types/task";
import { toStatusListFromSeed } from "@/mappers/status.mapper";

function formatDate(date: string | null) {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProjectDetailPage() {
    const { id } = useParams();
    const projectId = Number(id);
    const navigate = useNavigate();
    const { user } = useAuth();

    // État principal du projet et données associées
    const [project, setProject] = useState<ProjectRes | null>(null);
    const [tasks, setTasks] = useState<TaskRes[]>([]);
    const [statuses, setStatuses] = useState<Status[]>(() => toStatusListFromSeed(STATUSES));
    const [contributors, setContributors] = useState<Contributor[]>([]);
    // Utilisateurs potentiels (pas encore contributeurs) pour l'assignation
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // États UI pour la modale de tâche
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskRes | null>(null);
    const [defaultStatusId, setDefaultStatusId] = useState<number | null>(null);
    // États pour la création de statut personnalisé
    const [newStatusName, setNewStatusName] = useState("");
    const [showNewStatus, setShowNewStatus] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Configuration unique pour toutes les confirmations (archivage, suppression, etc.)
    // On évite ainsi de multiplier les modales ConfirmPopup dans le JSX
    const [confirmConfig, setConfirmConfig] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        variant?: "danger" | "default";
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    const closeConfirm = () => {
        setConfirmConfig(prev => ({ ...prev, open: false }));
    };

    // Loaders mémorisés pour éviter les re-créations inutiles et stabiliser les deps des useEffect
    const loadTasks = useCallback(async () => {
        try {
            const list = await taskService.getByProject(projectId);
            setTasks(list);
        } catch (error) {
            console.error(error);
        }
    }, [projectId]);

    const loadStatuses = useCallback(async () => {
        try {
            const data = await statusService.getAll(projectId);
            setStatuses(data);
        } catch (error) {
            console.error("Erreur lors du chargement des statuts", error);
            toast.error("Impossible de charger les statuts");
        }
    }, [projectId]);

    const loadContributors = useCallback(async () => {
        try {
            const data = await contributorService.getAll(projectId);
            setContributors(data);
        } catch (error) {
            console.error("Erreur lors du chargement des contributeurs", error);
        }
    }, [projectId]);

    const loadUsers = useCallback(async () => {
        try {
            const data = await userService.getPotentialContributors(projectId);
            setAllUsers(data);
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs potentiels", error);
        }
    }, [projectId]);

    // Chargement initial : projet d'abord, puis données dépendantes en parallèle
    // On ne charge les users potentiels que si l'utilisateur est propriétaire
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [projectData] = await Promise.all([
                    projectService.getById(projectId),
                ]);
                setProject(projectData);
                if (projectData.isOwner) {
                    await loadUsers();
                }
                await Promise.all([loadTasks(), loadStatuses(), loadContributors()]);
            } catch (error) {
                console.error(error);
                toast.error("Projet introuvable");
                navigate("/admin/projects");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [projectId, loadTasks, loadStatuses, loadContributors, loadUsers, navigate]);

    // Réinitialisation des états UI quand on change de projet (navigation entre détails)
    useEffect(() => {
        setModalOpen(false);
        setEditingTask(null);
        setShowNewStatus(false);
        setNewStatusName("");
    }, [projectId]);

    const openCreate = (statusId: number) => {
        setEditingTask(null);
        setDefaultStatusId(statusId);
        setModalOpen(true);
    };

    const openEdit = (task: TaskRes) => {
        setEditingTask(task);
        setDefaultStatusId(null);
        setModalOpen(true);
    };

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
            setShowNewStatus(false);
            await loadStatuses();
            setTimeout(() => toast.success("Statut créé avec succès"));
        } catch (error) {
            console.error(error);
            setTimeout(() => toast.error("Impossible de créer le statut"));
        }
    };

    // Suppression d'un statut personnalisé avec confirmation
    // On réassigne les tâches concernées côté backend (géré par l'API)
    const handleDeleteStatus = (status: Status) => {
        setConfirmConfig({
            open: true,
            title: "Supprimer le statut",
            message: `Voulez-vous vraiment supprimer le statut « ${status.name} » ? Les tâches associées devront être réassignées.`,
            confirmLabel: "Supprimer",
            variant: "danger",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await statusService.delete(status.statusId);
                    await loadStatuses();
                    setTimeout(() => toast.success("Statut supprimé"));
                } catch (error) {
                    console.error(error);
                    setTimeout(() => toast.error("Impossible de supprimer le statut"));
                }
            },
        });
    };

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
            await contributorService.add(projectId, selectedUserId);
            setSelectedUserId(null);
            await Promise.all([loadContributors(), loadUsers()]);
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
        setConfirmConfig({
            open: true,
            title: "Retirer le contributeur",
            message: `Voulez-vous vraiment retirer ${userName} des contributeurs de ce projet ?`,
            confirmLabel: "Retirer",
            variant: "danger",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await contributorService.remove(projectId, userId);
                    await Promise.all([loadContributors(), loadUsers()]);
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
        
        setConfirmConfig({
            open: true,
            title: "Transférer la propriété",
            message: `Voulez-vous vraiment transférer la propriété du projet à ${target?.userName ?? "cet utilisateur"} ? Vous perdrez vos droits de gestion.`,
            confirmLabel: "Transférer",
            variant: "danger",
            onConfirm: async () => {
                closeConfirm();
                try {
                    setTransferring(true);
                    await projectService.transferOwnership(projectId, transferTargetId);
                    toast.success("Propriété transférée avec succès");
                    setTransferMode(false);
                    setTransferTargetId(null);
                    const updated = await projectService.getById(projectId);
                    setProject(updated);
                    await loadContributors();
                } catch (error) {
                    console.error(error);
                    toast.error("Impossible de transférer la propriété");
                } finally {
                    setTransferring(false);
                }
            },
        });
    };

    const handleSubmitTask = async (data: TaskReq) => {
        try {
            setSubmitting(true);
            if (editingTask) {
                await taskService.update(editingTask.taskId, data);
                setModalOpen(false);
                setEditingTask(null);
                await loadTasks();
                setTimeout(() => toast.success("Tâche mise à jour"));
            } else {
                await taskService.create(data);
                setModalOpen(false);
                setEditingTask(null);
                await loadTasks();
                setTimeout(() => toast.success("Tâche créée"));
            }
        } catch (error) {
            console.error(error);
            setTimeout(() => toast.error("Une erreur est survenue"));
        } finally {
            setSubmitting(false);
        }
    };

    // Déplacement de tâche (drag & drop) : mise à jour optimiste + rollback si échec
    // On met à jour l'état local immédiatement pour un feedback instantané,
    // puis on appelle l'API. Si l'API échoue, on restaure l'état précédent.
    const handleMoveTask = async (task: TaskRes, statusId: number) => {
        const previous = tasks;
        setTasks(prev => prev.map(t => (t.taskId === task.taskId ? { ...t, statusId } : t)));
        try {
            const updated = await taskService.changeStatus(task.taskId, statusId);
            setTasks(prev => prev.map(t => (t.taskId === task.taskId ? updated : t)));
        } catch (error) {
            console.error(error);
            setTasks(previous);
            setTimeout(() => toast.error("Impossible de déplacer la tâche"));
        }
    };

    // Archivage d'une tâche (soft delete) avec confirmation
    // On filtre localement la liste après succès pour éviter un rechargement complet
    const handleDeleteTask = (task: TaskRes) => {
        setConfirmConfig({
            open: true,
            title: "Archiver la tâche",
            message: `Voulez-vous vraiment archiver la tâche « ${task.title} » ?`,
            confirmLabel: "Archiver",
            variant: "danger",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await taskService.archive(task.taskId);
                    setTasks(prev => prev.filter(t => t.taskId !== task.taskId));
                    setTimeout(() => toast.success("Tâche archivée"));
                } catch (error) {
                    console.error(error);
                    setTimeout(() => toast.error("Impossible d'archiver la tâche"));
                }
            },
        });
    };

    if (loading || !project) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <Spinner size={28} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/admin/projects")}
                        className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition hover:text-accent"
                        title="Retour"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-primary">{project.title}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                                <UserIcon size={13} />
                                {project.ownerName}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays size={13} />
                                {formatDate(project.startDate)} → {formatDate(project.endDate)}
                            </span>
                            {project.description && (
                                <span className="inline-flex max-w-xs items-center gap-1 truncate" title={project.description}>
                                    {project.description}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowNewStatus(!showNewStatus)}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-accent hover:text-accent"
                    >
                        <Plus size={15} />
                        {showNewStatus ? "Fermer" : "Ajouter un statut"}
                    </button>

                    <button
                        onClick={() => navigate(`/admin/projects/${project.projectId}/edit`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-accent hover:text-accent"
                    >
                        <Pencil size={15} />
                        Modifier le projet
                    </button>

                    <button
                        onClick={() => navigate(`/admin/projects/${project.projectId}/history`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-secondary bg-secondary/40 px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-accent hover:text-accent"
                    >
                        <History size={15} />
                        Historique
                    </button>
                </div>
            </div>

            {/* Statuts personnalisés du projet */}
            {statuses.filter(s => s.projectId != null).length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 text-sm font-medium text-primary">Statuts personnalisés de ce projet</p>
                    <div className="flex flex-wrap gap-2">
                        {statuses.filter(s => s.projectId != null).map(s => (
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
            {showNewStatus && (
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
                                onClick={() => setShowNewStatus(false)}
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
                            users={allUsers.filter(u => u.id !== project.ownerId && !contributors.some(c => c.userId === u.id))}
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
                                    users={allUsers.filter(u => u.id !== project.ownerId)}
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

            {/* Kanban Board : compose la vue colonne + cartes + panneau commentaires
     Les callbacks remontent vers cette page qui orchestre les appels API */}
            <KanbanBoard
                projectId={projectId}
                tasks={tasks}
                statuses={statuses}
                allUsers={allUsers}
                onEditTask={openEdit}
                onCreateTask={openCreate}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                currentUserId={user?.userId ?? 0}
            />

            {/* Modal de création / modification de tâche
                 Reçoit la liste des tâches (pour tâche parente) et contributeurs (pour assignation) */}
            <TaskModal
                open={modalOpen}
                projectId={projectId}
                task={editingTask}
                defaultStatusId={defaultStatusId}
                tasks={tasks}
                statuses={statuses}
                contributors={contributors}
                onClose={() => { setModalOpen(false); setEditingTask(null); }}
                onSubmit={handleSubmitTask}
                submitting={submitting}
            />

            {/* Popup de confirmation globale réutilisée pour toutes les actions destructives
                 (statuts, contributeurs, transfert, tâches) — évite de multiplier les modales */}
            <ConfirmPopup
                open={confirmConfig.open}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmLabel={confirmConfig.confirmLabel}
                variant={confirmConfig.variant}
                onConfirm={confirmConfig.onConfirm}
                onCancel={closeConfirm}
            />
        </div>
    );
}