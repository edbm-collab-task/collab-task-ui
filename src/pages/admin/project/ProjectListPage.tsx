import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Archive,
    CalendarDays,
    FolderKanban,
    Pencil,
    Plus,
    Search,
    User as UserIcon,
} from "lucide-react";
import Spinner from "@/components/common/Spinner";

import { projectService } from "@/services/project/project.service";
import { taskService } from "@/services/task/task.service";

import type { ProjectRes } from "@/types/project";
import type { TaskRes } from "@/types/task";

function formatDate(date: string | null) {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProjectListPage() {

    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectRes[]>([]);
    const [tasks, setTasks] = useState<TaskRes[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            const [projectList, taskList] = await Promise.all([
                projectService.getAll(),
                taskService.getAll(),
            ]);
            setProjects(projectList);
            setTasks(taskList);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger les projets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filteredProjects = useMemo(() => {
        const value = search.toLowerCase();
        return projects.filter(p =>
            !value ||
            p.title.toLowerCase().includes(value) ||
            (p.description ?? "").toLowerCase().includes(value) ||
            p.ownerName.toLowerCase().includes(value)
        );
    }, [projects, search]);

    const progressOf = (projectId: number) => {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        const total = projectTasks.length;
        const done = projectTasks.filter(t => t.statusId === 3).length;
        return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
    };

    const handleArchive = async (project: ProjectRes) => {
        if (!window.confirm(`Archiver le projet « ${project.title} » ?`)) return;
        try {
            await projectService.archive(project.projectId);
            setProjects(prev => prev.filter(p => p.projectId !== project.projectId));
            setTimeout(() => toast.success("Projet archivé"));
        } catch (error) {
            console.error(error);
            setTimeout(() => toast.error("Impossible d'archiver le projet"));
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <Spinner size={28} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Projets</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {projects.length} projet{projects.length > 1 ? "s" : ""} · organisez et suivez vos tâches
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un projet…"
                            className="w-64 rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        onClick={() => navigate("/admin/projects/create")}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-indigo-700"
                    >
                        <Plus size={16} />
                        Nouveau projet
                    </button>
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
                    <FolderKanban size={40} className="mx-auto text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-500">
                        {search ? "Aucun projet ne correspond à votre recherche" : "Aucun projet pour le moment"}
                    </p>
                    {!search && (
                        <button
                            onClick={() => navigate("/admin/projects/create")}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            <Plus size={16} />
                            Créer le premier projet
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map(project => {
                        const { total, done, pct } = progressOf(project.projectId);
                        return (
                            <div
                                key={project.projectId}
                                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow">
                                        <FolderKanban size={20} />
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                            project.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {project.isActive ? "Actif" : "Archivé"}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-base font-bold text-gray-800">
                                    {project.title}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                    {project.description || "Aucune description"}
                                </p>

                                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                    <UserIcon size={13} />
                                    <span className="font-medium text-gray-600">{project.ownerName}</span>
                                </div>
                                <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                                    <CalendarDays size={13} />
                                    <span>{formatDate(project.startDate)} → {formatDate(project.endDate)}</span>
                                </div>

                                <div className="mt-4">
                                    <div className="mb-1.5 flex items-center justify-between text-xs">
                                        <span className="font-medium text-gray-500">Avancement</span>
                                        <span className="font-semibold text-gray-700">{pct}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-gray-400">
                                        {done}/{total} tâches terminées
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                                    <button
                                        onClick={() => navigate(`/admin/projects/${project.projectId}`)}
                                        className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                    >
                                        Voir le tableau
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/projects/${project.projectId}/edit`)}
                                        title="Modifier"
                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleArchive(project)}
                                        title="Archiver"
                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                    >
                                        <Archive size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
