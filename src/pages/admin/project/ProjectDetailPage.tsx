import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, Loader2, Pencil, User as UserIcon, Plus, Trash2 } from "lucide-react";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskModal from "@/components/kanban/TaskModal";

import { projectService } from "@/services/project/project.service";
import { taskService } from "@/services/task/task.service";
import { statusService } from "@/services/status/status.service";
import type { ProjectRes } from "@/types/project";
import type { TaskReq, TaskRes } from "@/types/task";
import type { Status } from "@/types/status";
import { STATUSES } from "@/types/task"; // pour le fallback

function formatDate(date: string | null) {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ✅ Fonction utilitaire pour convertir STATUSES en Status[]
const convertSTATUSES = (): Status[] =>
    STATUSES.map(s => ({
        statusId: s.id,
        name: s.name,
        sortOrder: 0,
    }));

export default function ProjectDetailPage() {
    const { id } = useParams();
    const projectId = Number(id);
    const navigate = useNavigate();

    const [project, setProject] = useState<ProjectRes | null>(null);
    const [tasks, setTasks] = useState<TaskRes[]>([]);
    const [statuses, setStatuses] = useState<Status[]>(convertSTATUSES); // ✅ initialisation correcte
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskRes | null>(null);
    const [defaultStatusId, setDefaultStatusId] = useState<number | null>(null);
    const [newStatusName, setNewStatusName] = useState("");
    const [showNewStatus, setShowNewStatus] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [projectData] = await Promise.all([
                    projectService.getById(projectId),
                ]);
                setProject(projectData);
                await Promise.all([loadTasks(), loadStatuses()]);
            } catch (error) {
                console.error(error);
                toast.error("Projet introuvable");
                navigate("/admin/projects");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [projectId, loadTasks, loadStatuses, navigate]);

    // Reset au changement de projet
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

   
    const handleCreateStatus = async () => {
        if (!newStatusName.trim()) {
            toast.error("Le nom du statut est requis");
            return;
        }
        try {
            await statusService.create({ name: newStatusName.trim(), projectId });
            toast.success("Statut créé avec succès");
            setNewStatusName("");
            setShowNewStatus(false);
            await loadStatuses();
        } catch (error) {
            console.error(error);
            toast.error("Impossible de créer le statut");
        }
    };

    const handleDeleteStatus = async (status: Status) => {
        if (!window.confirm(`Supprimer le statut « ${status.name} » ? Les tâches associées devront être réassignées.`)) return;
        try {
            await statusService.delete(status.statusId);
            toast.success("Statut supprimé");
            await loadStatuses();
        } catch (error) {
            console.error(error);
            toast.error("Impossible de supprimer le statut");
        }
    };


    const handleSubmitTask = async (data: TaskReq) => {
        try {
            setSubmitting(true);
            if (editingTask) {
                await taskService.update(editingTask.taskId, data);
                toast.success("Tâche mise à jour");
            } else {
                await taskService.create(data);
                toast.success("Tâche créée");
            }
            setModalOpen(false);
            await loadTasks();
        } catch (error) {
            console.error(error);
            toast.error("Une erreur est survenue");
        } finally {
            setSubmitting(false);
        }
    };

    const handleMoveTask = async (task: TaskRes, statusId: number) => {
        const previous = tasks;
        setTasks(prev => prev.map(t => (t.taskId === task.taskId ? { ...t, statusId } : t)));
        try {
            const updated = await taskService.changeStatus(task.taskId, statusId);
            setTasks(prev => prev.map(t => (t.taskId === task.taskId ? updated : t)));
        } catch (error) {
            console.error(error);
            setTasks(previous);
            toast.error("Impossible de déplacer la tâche");
        }
    };

    const handleDeleteTask = async (task: TaskRes) => {
        if (!window.confirm(`Archiver la tâche « ${task.title} » ?`)) return;
        try {
            await taskService.archive(task.taskId);
            toast.success("Tâche archivée");
            setTasks(prev => prev.filter(t => t.taskId !== task.taskId));
        } catch (error) {
            console.error(error);
            toast.error("Impossible d'archiver la tâche");
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <Loader2 size={28} className="animate-spin" />
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/admin/projects")}
                        className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition hover:text-blue-600"
                        title="Retour"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
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
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
                    >
                        <Plus size={15} />
                        {showNewStatus ? "Fermer" : "Ajouter un statut"}
                    </button>

                    <button
                        onClick={() => navigate(`/admin/projects/${project.projectId}/edit`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
                    >
                        <Pencil size={15} />
                        Modifier le projet
                    </button>
                </div>
            </div>

            {/* Statuts personnalisés du projet */}
            {statuses.filter(s => s.projectId != null).length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 text-sm font-medium text-gray-700">Statuts personnalisés de ce projet</p>
                    <div className="flex flex-wrap gap-2">
                        {statuses.filter(s => s.projectId != null).map(s => (
                            <span
                                key={s.statusId}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600"
                            >
                                {s.name}
                                <button
                                    onClick={() => handleDeleteStatus(s)}
                                    className="ml-1 text-gray-400 transition hover:text-red-500"
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
                    <p className="mb-2 text-sm font-medium text-gray-700">Nouveau statut</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <input
                            value={newStatusName}
                            onChange={(e) => setNewStatusName(e.target.value)}
                            placeholder="Ex: En review"
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            onKeyDown={(e) => e.key === "Enter" && handleCreateStatus()}
                        />
                        <button
                            onClick={handleCreateStatus}
                            className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                        >
                            Créer
                        </button>
                        <button
                            onClick={() => setShowNewStatus(false)}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Kanban avec statuts dynamiques */}
            <KanbanBoard
                projectId={projectId}
                tasks={tasks}
                statuses={statuses}        // ✅ on passe les statuts au bon type
                onEditTask={openEdit}
                onCreateTask={openCreate}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
            />

            {/* Modal */}
            <TaskModal
                open={modalOpen}
                projectId={projectId}
                task={editingTask}
                defaultStatusId={defaultStatusId}
                tasks={tasks}
                statuses={statuses}        // ✅ on passe aussi les statuts
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmitTask}
                submitting={submitting}
            />
        </div>
    );
}