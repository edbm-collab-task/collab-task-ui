import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";
import { activityService } from "@/services/activity/activity.service";
import type { Activity } from "@/types/activity";
import Spinner from "@/components/common/Spinner";

const typeConfig: Record<Activity["type"], { icon: string; color: string }> = {
    PROJECT_CREATED: { icon: "📁", color: "text-blue-600" },
    CONTRIBUTOR_ADDED: { icon: "👤", color: "text-green-600" },
    CONTRIBUTOR_REMOVED: { icon: "👤", color: "text-red-500" },
    TASK_CREATED: { icon: "📋", color: "text-blue-500" },
    TASK_UPDATED: { icon: "✏️", color: "text-yellow-600" },
    TASK_DELETED: { icon: "🗑️", color: "text-red-500" },
    TASK_STATUS_CHANGED: { icon: "🔄", color: "text-purple-600" },
    TASK_PRIORITY_CHANGED: { icon: "🔴", color: "text-orange-500" },
    TASK_ASSIGNED: { icon: "👤", color: "text-green-600" },
    TASK_UNASSIGNED: { icon: "👤", color: "text-gray-500" },
};

export default function ActivityHistoryPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        activityService.getByProject(Number(projectId))
            .then(setActivities)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [projectId]);

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

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <History size={24} className="text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Historique des activités</h1>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner size={32} className="text-blue-500" />
                </div>
            ) : activities.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
                    <History size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Aucune activité pour ce projet</p>
                </div>
            ) : (
                <div className="relative ml-4 border-l-2 border-gray-200 pl-6 space-y-6">
                    {activities.map((activity) => {
                        const config = typeConfig[activity.type] ?? { icon: "🔔", color: "text-gray-500" };
                        return (
                            <div key={activity.activityId} className="relative">
                                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm">
                                    {config.icon}
                                </span>
                                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <p className={`text-sm font-medium ${config.color}`}>
                                        {activity.userName}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                                    <p className="mt-2 text-xs text-gray-400" title={formatDate(activity.createdAt)}>
                                        {formatTime(activity.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
