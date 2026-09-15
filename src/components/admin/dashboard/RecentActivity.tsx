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
    // Priorité critique -> Accent plein (fond solide, texte blanc = alerte maximale)
    TASK_PRIORITY_CHANGED: { Icon: AlertTriangle, badge: "bg-[var(--color-accent)] text-[var(--color-white)]" },

    // Actions principales de création / suivi -> Primaire à 15% (forte présence)
    PROJECT_CREATED: { Icon: FolderKanban, badge: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]" },
    TASK_CREATED: { Icon: ClipboardList, badge: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]" },
    TASK_STATUS_CHANGED: { Icon: RotateCcw, badge: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]" },

    // Personnes / Assignations -> Primaire à 5% (présence modérée)
    CONTRIBUTOR_ADDED: { Icon: UserPlus, badge: "bg-[var(--color-primary)]/5 text-[var(--color-accent)]" },
    TASK_ASSIGNED: { Icon: UserCheck, badge: "bg-[var(--color-primary)]/5 text-[var(--color-accent)]" },

    // Mise à jour générique -> Secondaire à 5% (présence légère)
    TASK_UPDATED: { Icon: Pencil, badge: "bg-[var(--color-secondary)]/5 text-[var(--color-accent)]" },

    // Retraits / Suppressions -> Accent à 10% (présence discrète)
    CONTRIBUTOR_REMOVED: { Icon: UserMinus, badge: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" },
    TASK_DELETED: { Icon: Trash2, badge: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" },
    TASK_UNASSIGNED: { Icon: UserX, badge: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" },
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
                <h3 className="font-bold text-primary">Activité récente</h3>
                <History size={18} className="text-primary/50" />
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

                                <span className="whitespace-nowrap text-xs text-primary/50">
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
