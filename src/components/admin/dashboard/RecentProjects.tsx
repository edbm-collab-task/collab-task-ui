import { useNavigate } from "react-router-dom";
import { ArrowRight, FolderKanban } from "lucide-react";
import type { DashboardRecentProject } from "@/types/dashboard";
import EmptyState from "@/components/common/EmptyState";

interface Props {
    projects: DashboardRecentProject[] | null;
}

export default function RecentProjects({ projects }: Props) {

    const navigate = useNavigate();
    const list = projects ?? [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-primary">Projets récents</h3>
                <button
                    onClick={() => navigate("/admin/projects")}
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent/80 transition hover:text-accent"
                >
                    Tout voir
                    <ArrowRight size={14} />
                </button>
            </div>

            {list.length === 0 ? (
                <EmptyState
                    icon={FolderKanban}
                    title="Aucun projet disponible"
                    description="Les projets récents apparaîtront ici lorsque les données seront disponibles."
                />
            ) : (
                <ul className="divide-y divide-gray-100">
                    {list.map(project => (
                        <li
                            key={project.projectId}
                            onClick={() => navigate(`/admin/projects/${project.projectId}`)}
                            className="cursor-pointer py-3 transition-all duration-200 hover:bg-gray-50 hover:px-3 rounded-lg"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-800">{project.title}</p>
                                    <p className="mt-0.5 text-xs text-gray-500">{project.ownerName}</p>
                                </div>
                                <span className="text-sm font-bold text-gray-700">{project.progress}%</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
                                <div
                                    className={`h-full rounded-full ${project.progress === 100 ? "bg-primary" : "bg-accent"}`}
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
