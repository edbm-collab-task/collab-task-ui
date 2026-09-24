import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, Pencil, User as UserIcon, Plus, History } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { ConfirmPopup } from "@/components/common/ConfirmPopup";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskModal from "@/components/kanban/TaskModal";
import ProjectStatusSection from "@/components/project/ProjectStatusSection";
import ProjectContributorsSection from "@/components/project/ProjectContributorsSection";

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
import type { ConfirmConfig } from "@/components/project/confirmConfig";
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
    // Visibilité du formulaire de création de statut (le bouton vit dans l'en-tête)
    const [showNewStatus, setShowNewStatus] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Configuration unique pour toutes les confirmations (archivage, suppression, etc.)
    // On évite ainsi de multiplier les modales ConfirmPopup dans le JSX
    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
        open: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    const closeConfirm = () => {
        setConfirmConfig(prev => ({ ...prev, open: false }));
    };

    // Ouvre la confirmation partagée depuis les sections extraites.
    // La fermeture est systématique avant l'exécution de l'action, comme précédemment.
    const openConfirm = (config: ConfirmConfig) => {
        setConfirmConfig({
            ...config,
            onConfirm: () => {
                closeConfirm();
                config.onConfirm();
            },
        });
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
    // (le reset ciblé de newStatusName vit désormais dans ProjectStatusSection)
    useEffect(() => {
        setModalOpen(false);
        setEditingTask(null);
        setShowNewStatus(false);
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

                <div className="flex items-center gap-2 box-border w-full max-w-full overflow-hidden">
                    <button
                        onClick={() => setShowNewStatus(!showNewStatus)}
                        className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-accent hover:text-accent max-sm:text-sm"
                    >
                        <Plus size={15} />
                        {showNewStatus ? "Fermer" : "Statut"}
                    </button>

                    {project.isOwner && (
                        <button
                            onClick={() => navigate(`/admin/projects/${project.projectId}/edit`)}
                            className="inline-flex 	min-w-0 max-sm:text-sm items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-accent hover:text-accent"
                        >
                            <Pencil size={15} />
                            Modifier le projet
                        </button>
                    )}

                    <button
                        onClick={() => navigate(`/admin/projects/${project.projectId}/history`)}
                        className="inline-flex min-w-0 max-sm:text-sm items-center gap-2 rounded-xl border border-secondary bg-secondary/40 px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-accent hover:text-accent"
                    >
                        <History size={15} />
                        Historique
                    </button>
                </div>
            </div>

            {/* Statuts personnalisés du projet */}
            <ProjectStatusSection
                projectId={projectId}
                statuses={statuses}
                open={showNewStatus}
                onOpenChange={setShowNewStatus}
                onStatusesChange={loadStatuses}
                openConfirm={openConfirm}
            />

            {/* Section Contributeurs */}
            <ProjectContributorsSection
                project={project}
                contributors={contributors}
                users={allUsers}
                onContributorsChange={loadContributors}
                onUsersChange={loadUsers}
                onProjectChange={setProject}
                openConfirm={openConfirm}
            />

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