import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { DashboardRecentProject } from "@/types/dashboard";

interface Props {
    projects: DashboardRecentProject[];
}

export default function RecentProjects({ projects }: Props) {

    const navigate = useNavigate();

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Projets récents</h3>
                <button
                    onClick={() => navigate("/admin/projects")}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                    Tout voir
                    <ArrowRight size={14} />
                </button>
            </div>

            {projects.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">Aucun projet</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {projects.map(project => (
                        <li
                            key={project.projectId}
                            onClick={() => navigate(`/admin/projects/${project.projectId}`)}
                            className="cursor-pointer py-3 transition hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-800">{project.title}</p>
                                    <p className="mt-0.5 text-xs text-gray-500">{project.ownerName}</p>
                                </div>
                                <span className="text-sm font-bold text-gray-700">{project.progress}%</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={`h-full rounded-full ${project.progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
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
