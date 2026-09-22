import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Archive,
    ArchiveRestore,
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
import { ConfirmPopup } from "@/components/common/ConfirmPopup";

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
    const [showArchived, setShowArchived] = useState(false);

    const loadData = useCallback(async () => {
        const [projectList, taskList] = await Promise.all([
            projectService.getAllIncludingArchived(),
            taskService.getAll(),
        ]);
        setProjects(projectList);
        setTasks(taskList);
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [projectList, taskList] = await Promise.all([
                    projectService.getAllIncludingArchived(),
                    taskService.getAll(),
                ]);
                if (active) {
                    setProjects(projectList);
                    setTasks(taskList);
                }
            } catch {
                if (active) console.error("Erreur chargement projets");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const filteredProjects = useMemo(() => {
        const value = search.toLowerCase();
        return projects
            .filter(p => (showArchived ? !p.isActive : p.isActive))
            .filter(p =>
                !value ||
                p.title.toLowerCase().includes(value) ||
                (p.description ?? "").toLowerCase().includes(value) ||
                p.ownerName.toLowerCase().includes(value)
            );
    }, [projects, search, showArchived]);

    const progressOf = (projectId: number) => {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        const total = projectTasks.length;
        const done = projectTasks.filter(t => t.statusId === 3).length;
        return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
    };

    const [projectToArchive, setProjectToArchive] = useState<ProjectRes | null>(null);

    const handleArchive = (project: ProjectRes) => {
        setProjectToArchive(project);
    };
    
    const confirmArchive = async () => {
        if (!projectToArchive) return;
        try {
            await projectService.archive(projectToArchive.projectId);
            await loadData();
        } catch {
            console.error("Erreur archivage");
        } finally {
            setProjectToArchive(null);
        }
    };

    const handleUnarchive = async (project: ProjectRes) => {
        try {
            await projectService.unarchive(project.projectId);
            await loadData();
        } catch {
            console.error("Erreur désarchivage");
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
        <div className="space-y-6" key={showArchived ? "archived" : "active"}>
            <ConfirmPopup
                open={!!projectToArchive}
                title="Confirmer l'archivage"
                message={`Archiver le projet « ${projectToArchive?.title} » ?`}
                confirmLabel="Archiver"
                variant="danger"
                onConfirm={confirmArchive}
                onCancel={() => setProjectToArchive(null)}
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Projets</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""}{" "}
                        {showArchived ? "archivé" : "actif"}
                        {filteredProjects.length > 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un projet…"
                            className="w-64 rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                        />
                    </div>

                    <button
                        onClick={() => setShowArchived(v => !v)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                            showArchived
                                ? "border-primary bg-white text-primary hover:bg-primary hover:text-secondary"
                                : "border-gray-300 bg-white text-gray-600 hover:bg-primary hover:text-secondary"
                        }`}
                    >
                        <Archive size={16} />
                        {showArchived ? "Archivés" : "Actifs"}
                    </button>

                    <button
                        onClick={() => navigate("/admin/projects/create")}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-accent"
                    >
                        <Plus size={16} />
                        Nouveau projet
                    </button>
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
                    <FolderKanban size={40} className="mx-auto text-primary/70" />
                    <p className="mt-3 text-sm font-medium text-gray-500">
                        {search
                            ? "Aucun projet ne correspond à votre recherche"
                            : showArchived
                                ? "Aucun projet archivé"
                                : "Aucun projet pour le moment"}
                    </p>
                    {!search && !showArchived && (
                        <button
                            onClick={() => navigate("/admin/projects/create")}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="p-2 bg-accent/20 rounded-full">
                                            <FolderKanban size={22} className="text-primary"/>
                                        </div>
                                        <p className="text-base font-bold text-primary">{project.title}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                            project.isActive ? " text-primary" : " text-gray-500"
                                        }`}
                                    >
                                        {project.isActive ? "Actif" : "Archivé"}
                                    </span>
                                </div>

                                <p className="mt-4 line-clamp-2 text-sm text-gray-500">
                                    {project.description || "Aucune description"}
                                </p>

                                <div className="flex flex-col gap-2 mt-4">
                                    <div className="flex items-center gap-2 text-xs text-primary/90">
                                        <UserIcon size={13} />
                                        <span className="font-medium text-primary/90">{project.ownerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-primary/90">
                                        <CalendarDays size={13} />
                                        <span>
                                            {formatDate(project.startDate)} → {formatDate(project.endDate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="mb-1.5 flex items-center justify-between text-xs">
                                        <span className="font-medium text-gray-500">Avancement</span>
                                        <span className="font-semibold text-gray-700">{pct}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                pct === 100
                                                    ? "bg-primary"
                                                    : "bg-primary"
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-gray-400">
                                        {done}/{total} tâches terminées
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                                    {project.isOwner && (
                                        <button
                                            onClick={() => navigate(`/admin/projects/${project.projectId}/edit`)}
                                            title="Modifier"
                                            className="rounded-lg p-2 text-gray-400 transition  hover:text-accent"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/admin/projects/${project.projectId}`)}
                                        className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-secondary"
                                    >
                                        Voir le tableau
                                    </button>
                                    {showArchived ? (
                                        <button
                                            onClick={() => handleUnarchive(project)}
                                            title="Désarchiver"
                                            className="rounded-lg p-2 text-gray-400 transition hover:text-accent"
                                        >
                                            <ArchiveRestore size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleArchive(project)}
                                            title="Archiver"
                                            className="rounded-lg p-2 text-gray-400 transition hover:text-accent"
                                        >
                                            <Archive size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
