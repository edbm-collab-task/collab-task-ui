import { History } from "lucide-react";
import type { Activity } from "@/types/activity";
import type { DashboardActivityItem } from "@/types/dashboard";

interface Props {
    activities: DashboardActivityItem[];
}

const typeConfig: Record<Activity["type"], { icon: string; badge: string }> = {
    PROJECT_CREATED: { icon: "\u{1F4C1}", badge: "bg-blue-100 text-blue-600" },
    CONTRIBUTOR_ADDED: { icon: "\u{1F464}", badge: "bg-emerald-100 text-emerald-600" },
    CONTRIBUTOR_REMOVED: { icon: "\u{1F464}", badge: "bg-red-100 text-red-500" },
    TASK_CREATED: { icon: "\u{1F4CB}", badge: "bg-blue-100 text-blue-500" },
    TASK_UPDATED: { icon: "\u{270F}\u{FE0F}", badge: "bg-amber-100 text-amber-600" },
    TASK_DELETED: { icon: "\u{1F5D1}\u{FE0F}", badge: "bg-red-100 text-red-500" },
    TASK_STATUS_CHANGED: { icon: "\u{1F504}", badge: "bg-purple-100 text-purple-600" },
    TASK_PRIORITY_CHANGED: { icon: "\u{1F534}", badge: "bg-orange-100 text-orange-500" },
    TASK_ASSIGNED: { icon: "\u{1F464}", badge: "bg-green-100 text-green-600" },
    TASK_UNASSIGNED: { icon: "\u{1F464}", badge: "bg-gray-100 text-gray-500" },
};

const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "a l'instant";
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
};

export default function RecentActivity({ activities }: Props) {

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Activite recente</h3>
                <History size={18} className="text-gray-400" />
            </div>

            {activities.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">Aucune activite recente</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {activities.map(activity => {
                        const config = typeConfig[activity.type] ?? { icon: "\u{1F514}", badge: "bg-gray-100 text-gray-500" };

                        return (
                            <li key={activity.id} className="flex items-start gap-3 py-3 transition hover:bg-gray-50">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${config.badge}`}>
                                    {config.icon}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-800">{activity.description}</p>
                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                        {[activity.userName, activity.projectName].filter(Boolean).join(" \u00B7 ")}
                                    </p>
                                </div>

                                <span className="whitespace-nowrap text-xs text-gray-400">
                                    {formatTime(activity.createdAt)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
