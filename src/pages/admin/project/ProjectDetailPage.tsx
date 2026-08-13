import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, Loader2, Pencil, User as UserIcon } from "lucide-react";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskModal from "@/components/kanban/TaskModal";

import { projectService } from "@/services/project/project.service";
import { taskService } from "@/services/task/task.service";

import type { ProjectRes } from "@/types/project";
import type { TaskReq, TaskRes } from "@/types/task";

function formatDate(date: string | null) {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProjectDetailPage() {

    const { id } = useParams();
    const projectId = Number(id);
    const navigate = useNavigate();

    const [project, setProject] = useState<ProjectRes | null>(null);
    const [tasks, setTasks] = useState<TaskRes[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskRes | null>(null);
    const [defaultStatusId, setDefaultStatusId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadTasks = useCallback(async () => {
        try {
            const list = await taskService.getByProject(projectId);
            setTasks(list);
        } catch (error) {
            console.error(error);
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
                await loadTasks();
            } catch (error) {
                console.error(error);
                toast.error("Projet introuvable");
                navigate("/admin/projects");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [projectId, loadTasks, navigate]);

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

                <button
                    onClick={() => navigate(`/admin/projects/${project.projectId}/edit`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
                >
                    <Pencil size={15} />
                    Modifier le projet
                </button>
            </div>

            <KanbanBoard
                tasks={tasks}
                onEditTask={openEdit}
                onCreateTask={openCreate}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
            />

            <TaskModal
                open={modalOpen}
                projectId={projectId}
                task={editingTask}
                defaultStatusId={defaultStatusId}
                tasks={tasks}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmitTask}
                submitting={submitting}
            />
        </div>
    );
}
