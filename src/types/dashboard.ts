import type { Activity } from "@/types/activity";

export const DASHBOARD_PERIODS = {
    TODAY: "TODAY",
    LAST_7_DAYS: "LAST_7_DAYS",
    LAST_30_DAYS: "LAST_30_DAYS",
    LAST_3_MONTHS: "LAST_3_MONTHS",
    THIS_YEAR: "THIS_YEAR",
    CUSTOM: "CUSTOM",
} as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[keyof typeof DASHBOARD_PERIODS];

export const DASHBOARD_PERIOD_OPTIONS: { label: string; value: DashboardPeriod }[] = [
    { label: "Aujourd'hui", value: DASHBOARD_PERIODS.TODAY },
    { label: "7 derniers jours", value: DASHBOARD_PERIODS.LAST_7_DAYS },
    { label: "30 derniers jours", value: DASHBOARD_PERIODS.LAST_30_DAYS },
    { label: "3 derniers mois", value: DASHBOARD_PERIODS.LAST_3_MONTHS },
    { label: "Cette année", value: DASHBOARD_PERIODS.THIS_YEAR },
    { label: "Personnalisée", value: DASHBOARD_PERIODS.CUSTOM },
];

// Paramètres envoyés au service dashboard.
// Le backend recevra exactement cette structure.
export interface DashboardPeriodParams {
    period: DashboardPeriod;
    startDate?: string;
    endDate?: string;
    projectId?: number;
}

export interface DashboardStats {
    projects: number;
    tasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalUsers: number;
    totalContributors: number;
}

export interface DashboardEvolutionPoint {
    label: string;
    created: number;
    completed: number;
}

export interface DashboardEvolution {
    points: DashboardEvolutionPoint[];
}

export interface DashboardTaskDistributionItem {
    key: string;
    name: string;
    count: number;
    dot: string;
    color: string;
}

export interface DashboardTaskDistribution {
    items: DashboardTaskDistributionItem[];
    total: number;
}

export interface DashboardActivityItem {
    id: number;
    type: Activity["type"];
    description: string;
    userName?: string;
    projectName?: string;
    createdAt: string;
}

export interface DashboardRecentProject {
    projectId: number;
    title: string;
    ownerName: string;
    progress: number;
}

export interface DashboardData {
    period: DashboardPeriod;
    stats: DashboardStats;
    evolution: DashboardEvolution;
    distribution: DashboardTaskDistribution;
    recentActivity: DashboardActivityItem[];
    recentProjects: DashboardRecentProject[];
}
