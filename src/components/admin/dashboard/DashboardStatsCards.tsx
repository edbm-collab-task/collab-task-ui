import { FolderKanban, ListTodo, CircleCheck, Clock3, Users } from "lucide-react";
import type { DashboardStats, DashboardEvolution } from "@/types/dashboard";
import Sparkline from "./Sparkline";
import { generateIncreasingSparkline, getSparklineFromEvolution } from "@/utils/sparkline";

interface Props {
    stats: DashboardStats | null;
    evolution?: DashboardEvolution | null;
    onOverdueClick?: () => void;
}

export default function DashboardStatsCards({ stats, evolution = null, onOverdueClick }: Props) {

    const cards = [
        { label: "Projets", value: stats?.projects, icon: FolderKanban, iconClass: "text-accent", color: "#6366f1", sparkline: generateIncreasingSparkline(stats?.projects ?? 0, 7) },
        { label: "Contributeurs", value: stats?.totalContributors, icon: Users, iconClass: "text-accent", color: "#a855f7", sparkline: generateIncreasingSparkline(stats?.totalContributors ?? 0, 7) },
        { label: "Tâches", value: stats?.tasks, icon: ListTodo, iconClass: "text-accent", color: "#f59e0b", sparkline: getSparklineFromEvolution(evolution, "tasks", stats?.tasks ?? 0) },
        { label: "Terminées", value: stats?.completedTasks, icon: CircleCheck, iconClass: "text-accent", color: "#10b981", sparkline: getSparklineFromEvolution(evolution, "completed", stats?.completedTasks ?? 0) },
        { label: "En retard", value: stats?.overdueTasks, icon: Clock3, iconClass: "bg-accent text-white", color: "#ef4444" },
    ];

    return (
        <div className={`grid gap-2 sm:grid-cols-3 ${cards.length > 4 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
            {cards.map(card => {
                const Icon = card.icon;
                const isOverdueCard = card.label === "En retard";
                const hasValue = card.value != null && card.value > 0;
                const isClickable = isOverdueCard && !!onOverdueClick;
                const isHighlighted = isOverdueCard && hasValue;

                console.log(card.value);
                
                return (
                    <div
                        key={card.label}
                        onClick={isClickable ? () => onOverdueClick?.() : undefined}
                        role={isClickable ? "button" : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onOverdueClick?.(); } : undefined}
                        className={`flex items-center gap-1 rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                            isHighlighted
                                ? "bg-white hover:bg-accent/30 border-accent"
                                : "border-gray-200 bg-white"
                        } ${isClickable ? "cursor-pointer" : ""}`}
                    >
                        <div className={`flex h-8 w-8 sm:h-5 shrink-0 items-center justify-center rounded-xl ${isHighlighted ? card.iconClass : "bg-transparent text-accent"}`}>
                        <Icon size={22} />
                    </div>
                        <div className="flex justify-center gap-3 items-center min-w-0">
                            <p className="truncate text-lg text-gray-500">{card.label}</p>
                            <div className="flex">
                                <p className={`text-lg ${isHighlighted ? "font-bold text-accent" : "text-primary"}`}>
                                    {card.value != null ? card.value : "\u2014"}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}