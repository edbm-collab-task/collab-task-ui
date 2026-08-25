import { DASHBOARD_PERIODS } from "@/types/dashboard";
import type {
    DashboardActivityItem,
    DashboardData,
    DashboardEvolutionPoint,
    DashboardPeriodParams,
} from "@/types/dashboard";

const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const DAYS_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

function createSeededRandom(seed: number): () => number {
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    return () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
    };
}

function hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
    }
    return hash + 1;
}

function pad2(value: number): string {
    return String(value).padStart(2, "0");
}

function formatDayMonth(date: Date): string {
    return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

// Résout les bornes temporelles selon la période sélectionnée.
function resolveTimeRange(params: DashboardPeriodParams): { start: Date; end: Date } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (params.period) {
        case DASHBOARD_PERIODS.TODAY:
            return { start: today, end: new Date(today.getTime() + 86400000 - 1) };

        case DASHBOARD_PERIODS.LAST_7_DAYS:
            return { start: new Date(today.getTime() - 6 * 86400000), end: now };

        case DASHBOARD_PERIODS.LAST_30_DAYS:
            return { start: new Date(today.getTime() - 29 * 86400000), end: now };

        case DASHBOARD_PERIODS.LAST_3_MONTHS:
            return { start: new Date(today.getTime() - 89 * 86400000), end: now };

        case DASHBOARD_PERIODS.THIS_YEAR:
            return { start: new Date(now.getFullYear(), 0, 1), end: now };

        case DASHBOARD_PERIODS.CUSTOM: {
            const start = params.startDate ? new Date(params.startDate) : new Date(today.getTime() - 29 * 86400000);
            const end = params.endDate ? new Date(params.endDate + "T23:59:59") : now;
            return { start, end };
        }
    }
}

function buildEvolutionPoints(params: DashboardPeriodParams, random: () => number): DashboardEvolutionPoint[] {
    const { start, end } = resolveTimeRange(params);
    const rangeMs = end.getTime() - start.getTime();
    const rangeDays = Math.max(rangeMs / 86400000, 1);

    let pointCount: number;
    let labelFn: (index: number) => string;

    if (params.period === DASHBOARD_PERIODS.TODAY) {
        pointCount = 6;
        labelFn = (i) => `${pad2(6 + i * 3)}h`;
    } else if (params.period === DASHBOARD_PERIODS.THIS_YEAR) {
        pointCount = 12;
        labelFn = (i) => MONTHS_FR[(start.getMonth() + i) % 12];
    } else if (rangeDays <= 7) {
        pointCount = Math.min(Math.ceil(rangeDays), 7);
        labelFn = (i) => {
            const d = new Date(start.getTime() + i * 86400000);
            return DAYS_FR[d.getDay()];
        };
    } else {
        // Pour les plages plus longues : 1 point par semaine (max 14)
        pointCount = Math.min(Math.ceil(rangeDays / 7), 14);
        const stepMs = rangeMs / Math.max(pointCount - 1, 1);
        labelFn = (i) => {
            const d = new Date(start.getTime() + i * stepMs);
            return formatDayMonth(d);
        };
    }

    return Array.from({ length: pointCount }, (_, index) => ({
        label: labelFn(index),
        created: Math.floor(random() * 7) + 2,
        completed: Math.floor(random() * 7) + 1,
    }));
}

function buildStats(random: () => number) {
    const tasks = Math.floor(random() * 17) + 24;
    return {
        projects: Math.floor(random() * 4) + 4,
        tasks,
        completedTasks: Math.round(tasks * (0.55 + random() * 0.2)),
        overdueTasks: Math.floor(random() * 4) + 1,
    };
}

function minutesAgo(minutes: number): string {
    return new Date(Date.now() - minutes * 60000).toISOString();
}

const ACTIVITY_CATALOG: Omit<DashboardActivityItem, "id">[] = [
    {
        type: "TASK_STATUS_CHANGED",
        description: "Tache \u00AB Creer le formulaire \u00BB marquee comme terminee",
        userName: "Tsiaro Rakotonirina",
        projectName: "CollaB Tasks",
        createdAt: minutesAgo(25),
    },
    {
        type: "PROJECT_CREATED",
        description: "Projet \u00AB Portail EDBM \u00BB cree",
        userName: "Ambinintsoa R.",
        projectName: "Portail EDBM",
        createdAt: minutesAgo(120),
    },
    {
        type: "TASK_ASSIGNED",
        description: "Tache \u00AB Revue de code \u00BB assignee a Jean Rakoto",
        userName: "Sarah Andria",
        projectName: "CollaB Tasks",
        createdAt: minutesAgo(300),
    },
    {
        type: "TASK_CREATED",
        description: "Tache \u00AB Preparer la demo \u00BB creee",
        userName: "Hery Andrianina",
        projectName: "Refonte Intranet",
        createdAt: minutesAgo(60 * 26),
    },
    {
        type: "TASK_UPDATED",
        description: "Description de la tache \u00AB Migration API \u00BB modifiee",
        userName: "Nicolas Randria",
        projectName: "Portail EDBM",
        createdAt: minutesAgo(60 * 49),
    },
    {
        type: "TASK_PRIORITY_CHANGED",
        description: "Priorite de la tache \u00AB Audit securite \u00BB passee a Urgente",
        userName: "Mickael Rabe",
        projectName: "Application Mobile",
        createdAt: minutesAgo(60 * 96),
    },
];

function buildRecentActivity(params: DashboardPeriodParams): DashboardActivityItem[] {
    const { start } = resolveTimeRange(params);

    return ACTIVITY_CATALOG
        .filter(item => new Date(item.createdAt) >= start)
        .map((item, index) => ({ ...item, id: index + 1 }));
}

const RECENT_PROJECTS_MOCK: DashboardData["recentProjects"] = [
    { projectId: 1, title: "CollaB Tasks", ownerName: "Tsiaro Rakotonirina", progress: 68 },
    { projectId: 2, title: "Portail EDBM", ownerName: "Ambinintsoa R.", progress: 42 },
    { projectId: 3, title: "Refonte Intranet", ownerName: "Jean Rakoto", progress: 85 },
    { projectId: 4, title: "Application Mobile", ownerName: "Sarah Andria", progress: 23 },
    { projectId: 5, title: "Migration Cloud", ownerName: "Hery Andrianina", progress: 100 },
];

export function buildDashboardMockData(params: DashboardPeriodParams): DashboardData {
    const random = createSeededRandom(hashString(params.period + (params.startDate ?? "") + (params.endDate ?? "")));

    const stats = buildStats(random);
    const evolution = { points: buildEvolutionPoints(params, random) };

    const inProgress = Math.round(stats.tasks * 0.22);
    const overdue = Math.min(stats.overdueTasks, stats.tasks - stats.completedTasks);
    const todo = Math.max(stats.tasks - stats.completedTasks - overdue - inProgress, 0);

    const distribution = {
        items: [
            { key: "todo", name: "A faire", count: todo, dot: "bg-amber-400", color: "bg-amber-400" },
            { key: "in-progress", name: "En cours", count: inProgress, dot: "bg-blue-500", color: "bg-blue-500" },
            { key: "done", name: "Terminees", count: stats.completedTasks, dot: "bg-emerald-500", color: "bg-emerald-500" },
            { key: "overdue", name: "En retard", count: overdue, dot: "bg-red-400", color: "bg-red-500" },
        ],
        total: stats.tasks,
    };

    return {
        period: params.period,
        stats,
        evolution,
        distribution,
        recentActivity: buildRecentActivity(params),
        recentProjects: RECENT_PROJECTS_MOCK,
    };
}
