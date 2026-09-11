import { FolderKanban, ListTodo, CircleCheck, Clock3, Users } from "lucide-react";
import type { DashboardStats, DashboardEvolution } from "@/types/dashboard";
import Sparkline from "./Sparkline";
import { generateIncreasingSparkline, getSparklineFromEvolution } from "@/utils/sparkline";

interface Props {
    stats: DashboardStats | null;
    evolution?: DashboardEvolution | null;
}

export default function DashboardStatsCards({ stats, evolution = null }: Props) {

    const cards = [
        { label: "Projets", value: stats?.projects, icon: FolderKanban, iconClass: "bg-indigo-100 text-indigo-600", color: "#6366f1", sparkline: generateIncreasingSparkline(stats?.projects ?? 0, 7) },
        { label: "Tâches", value: stats?.tasks, icon: ListTodo, iconClass: "bg-amber-100 text-amber-600", color: "#f59e0b", sparkline: getSparklineFromEvolution(evolution, "tasks", stats?.tasks ?? 0) },
        { label: "Terminées", value: stats?.completedTasks, icon: CircleCheck, iconClass: "bg-emerald-100 text-emerald-600", color: "#10b981", sparkline: getSparklineFromEvolution(evolution, "completed", stats?.completedTasks ?? 0) },
        { label: "En retard", value: stats?.overdueTasks, icon: Clock3, iconClass: "bg-red-100 text-red-600", color: "#ef4444", sparkline: generateIncreasingSparkline(stats?.overdueTasks ?? 0, 7) },
        { label: "Contributeurs", value: stats?.totalContributors, icon: Users, iconClass: "bg-purple-100 text-purple-600", color: "#a855f7", sparkline: generateIncreasingSparkline(stats?.totalContributors ?? 0, 7) },
    ];

    return (
        <div className={`grid gap-5 sm:grid-cols-2 ${cards.length > 4 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
            {cards.map(card => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.label}
                        className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}>
                            <Icon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm text-gray-500">{card.label}</p>
                            <div className="mt-1 flex items-end gap-3">
                                <p className="text-2xl font-bold text-gray-800">
                                    {card.value != null ? card.value : "\u2014"}
                                </p>
                                <Sparkline
                                    data={(card as any).sparkline ?? []}
                                    color={card.color}
                                    height={24}
                                    width={80}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
