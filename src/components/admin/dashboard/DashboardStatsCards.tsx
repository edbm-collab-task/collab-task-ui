import { FolderKanban, ListTodo, CircleCheck, Clock3, Users } from "lucide-react";
import type { DashboardStats, DashboardEvolution } from "@/types/dashboard";
import Sparkline from "./Sparkline";

function generateIncreasingSparkline(baseValue: number, points: number = 7): number[] {
    const target = Math.max(0, baseValue ?? 0);
    if (target === 0) return Array(points).fill(0);
    const start = Math.max(1, Math.floor(target * 0.45));
    const step = (target - start) / (points - 1);
    const res: number[] = [];
    let seed = Math.abs(target) * 1664525 + 1013904223;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
    for (let i = 0; i < points; i++) {
        const ideal = Math.round(start + step * i);
        const jitter = Math.round((rand() - 0.5) * step * 0.16);
        let v = ideal + jitter;
        if (i > 0) v = Math.max(v, res[i - 1] + 1);
        v = Math.min(v, target);
        if (i === points - 1) v = target;
        res.push(Math.max(0, v));
    }
    return res;
}

function getSparklineFromEvolution(evolution: DashboardEvolution | null, metric: "tasks" | "completed", fallbackValue: number): number[] {
    if (!evolution || !evolution.points || evolution.points.length === 0) {
        return generateIncreasingSparkline(fallbackValue, 7);
    }
    const pts = evolution.points.slice(-7);
    if (metric === "tasks") {
        let cum = 0;
        const cumVals = pts.map(p => cum += p.created);
        const maxCum = cumVals[cumVals.length - 1] || 1;
        if (fallbackValue > maxCum && maxCum > 0) {
            const ratio = fallbackValue / maxCum;
            return cumVals.map(v => Math.round(v * ratio));
        }
        return cumVals.length === 7 ? cumVals : generateIncreasingSparkline(fallbackValue, 7);
    }
    if (metric === "completed") {
        let cum = 0;
        const cumVals = pts.map(p => cum += p.completed);
        const maxCum = cumVals[cumVals.length - 1] || 1;
        if (fallbackValue > maxCum && maxCum > 0) {
            const ratio = fallbackValue / maxCum;
            return cumVals.map(v => Math.round(v * ratio));
        }
        return cumVals.length === 7 ? cumVals : generateIncreasingSparkline(fallbackValue, 7);
    }
    return generateIncreasingSparkline(fallbackValue, 7);
}

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
