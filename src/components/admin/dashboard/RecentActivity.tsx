import {
    History,
    FolderKanban,
    UserPlus,
    UserMinus,
    ClipboardList,
    Pencil,
    Trash2,
    RotateCcw,
    AlertTriangle,
    UserCheck,
    UserX,
    Bell,
} from "lucide-react";
import type { Activity } from "@/types/activity";
import type { DashboardActivityItem } from "@/types/dashboard";
import EmptyState from "@/components/common/EmptyState";

interface Props {
    activities: DashboardActivityItem[] | null;
}

const typeConfig: Record<Activity["type"], { Icon: typeof History; badge: string }> = {
    PROJECT_CREATED: { Icon: FolderKanban, badge: "bg-blue-100 text-blue-600" },
    CONTRIBUTOR_ADDED: { Icon: UserPlus, badge: "bg-emerald-100 text-emerald-600" },
    CONTRIBUTOR_REMOVED: { Icon: UserMinus, badge: "bg-red-100 text-red-500" },
    TASK_CREATED: { Icon: ClipboardList, badge: "bg-blue-100 text-blue-500" },
    TASK_UPDATED: { Icon: Pencil, badge: "bg-amber-100 text-amber-600" },
    TASK_DELETED: { Icon: Trash2, badge: "bg-red-100 text-red-500" },
    TASK_STATUS_CHANGED: { Icon: RotateCcw, badge: "bg-purple-100 text-purple-600" },
    TASK_PRIORITY_CHANGED: { Icon: AlertTriangle, badge: "bg-orange-100 text-orange-500" },
    TASK_ASSIGNED: { Icon: UserCheck, badge: "bg-green-100 text-green-600" },
    TASK_UNASSIGNED: { Icon: UserX, badge: "bg-gray-100 text-gray-500" },
};

const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
};

export default function RecentActivity({ activities }: Props) {

    const list = activities ?? [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Activité récente</h3>
                <History size={18} className="text-gray-400" />
            </div>

            {list.length === 0 ? (
                <EmptyState
                    icon={History}
                    title="Aucune activité disponible"
                    description="L'activité récente apparaîtra ici lorsque les données seront disponibles."
                />
            ) : (
                <ul className="divide-y divide-gray-100">
                    {list.map(activity => {
                        const config = typeConfig[activity.type] ?? { Icon: Bell, badge: "bg-gray-100 text-gray-500" };
                        const Icon = config.Icon;

                        return (
                            <li key={activity.id} className="flex items-start gap-3 py-3 transition hover:bg-gray-50">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.badge}`}>
                                    <Icon size={16} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-800">{activity.description}</p>
                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                        {[activity.userName, activity.projectName].filter(Boolean).join(" · ")}
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
