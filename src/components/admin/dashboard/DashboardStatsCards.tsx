import { FolderKanban, ListTodo, CircleCheck, Clock3 } from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

interface Props {
    stats: DashboardStats;
}

export default function DashboardStatsCards({ stats }: Props) {

    const cards = [
        { label: "Projets", value: stats.projects, icon: FolderKanban, iconClass: "bg-indigo-100 text-indigo-600" },
        { label: "Taches", value: stats.tasks, icon: ListTodo, iconClass: "bg-amber-100 text-amber-600" },
        { label: "Terminees", value: stats.completedTasks, icon: CircleCheck, iconClass: "bg-emerald-100 text-emerald-600" },
        { label: "En retard", value: stats.overdueTasks, icon: Clock3, iconClass: "bg-red-100 text-red-600" },
    ];

    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(card => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.label}
                        className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}>
                            <Icon size={22} />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm text-gray-500">{card.label}</p>
                            <p className="mt-0.5 text-2xl font-bold text-gray-800">{card.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
