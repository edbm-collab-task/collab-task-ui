import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    FolderKanban,
    ListTodo,
    CircleCheck,
    TrendingUp,
    Clock3,
    ArrowRight,
} from "lucide-react";
import Spinner from "@/components/common/Spinner";

import { userService } from "@/services/user/user.service";
import { projectService } from "@/services/project/project.service";
import { taskService } from "@/services/task/task.service";
import { STATUSES } from "@/types/task";

import type { UserResponse } from "@/types/user";
import type { ProjectRes } from "@/types/project";
import type { TaskRes } from "@/types/task";

export default function Dashboard() {

    const navigate = useNavigate();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [projects, setProjects] = useState<ProjectRes[]>([]);
    const [tasks, setTasks] = useState<TaskRes[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [userList, projectList, taskList] = await Promise.all([
                    userService.getAll(),
                    projectService.getAll(),
                    taskService.getAll(),
                ]);
                setUsers(userList);
                setProjects(projectList);
                setTasks(taskList);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <Spinner size={28} />
            </div>
        );
    }

    const activeProjects = projects.filter(p => p.isActive);
    const doneTasks = tasks.filter(t => t.statusId === 3).length;
    const donePct = tasks.length === 0 ? 0 : Math.round((doneTasks / tasks.length) * 100);
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.statusId !== 3);

    const stats = [
        { label: "Utilisateurs", value: users.length, icon: Users, iconClass: "bg-blue-100 text-blue-600" },
        { label: "Projets actifs", value: activeProjects.length, icon: FolderKanban, iconClass: "bg-indigo-100 text-indigo-600" },
        { label: "Tâches totales", value: tasks.length, icon: ListTodo, iconClass: "bg-amber-100 text-amber-600" },
        { label: "Tâches terminées", value: `${doneTasks} · ${donePct}%`, icon: CircleCheck, iconClass: "bg-emerald-100 text-emerald-600" },
    ];

    const tasksByStatus = STATUSES.map(status => ({
        ...status,
        count: tasks.filter(t => t.statusId === status.id).length,
    }));

    const recentProjects = [...projects]
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Vue d'ensemble de votre espace collaboratif
                </p>
            </div>

            {/* KPIs */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(stat => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}>
                                <Icon size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm text-gray-500">{stat.label}</p>
                                <p className="mt-0.5 text-2xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Répartition par statut */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Répartition des tâches</h3>
                        <TrendingUp size={18} className="text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        {tasksByStatus.map(status => (
                            <div key={status.id}>
                                <div className="mb-1.5 flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 font-medium text-gray-600">
                                        <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                                        {status.name}
                                    </span>
                                    <span className="font-semibold text-gray-800">{status.count}</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className={`h-full rounded-full ${status.color}`}
                                        style={{
                                            width: tasks.length === 0 ? "0%" : `${(status.count / tasks.length) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        <Clock3 size={16} />
                        <span>
                            {overdue.length} tâche{overdue.length > 1 ? "s" : ""} en retard
                        </span>
                    </div>
                </div>

                {/* Projets récents */}
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

                    {recentProjects.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">Aucun projet</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recentProjects.map(project => {
                                const projectTasks = tasks.filter(t => t.projectId === project.projectId);
                                const done = projectTasks.filter(t => t.statusId === 3).length;
                                const pct = projectTasks.length === 0 ? 0 : Math.round((done / projectTasks.length) * 100);

                                return (
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
                                            <span className="text-sm font-bold text-gray-700">{pct}%</span>
                                        </div>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
