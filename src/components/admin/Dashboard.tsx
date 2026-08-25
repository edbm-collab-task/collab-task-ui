import { useEffect, useState } from "react";

import Spinner from "@/components/common/Spinner";
import { dashboardService } from "@/services/dashboard/dashboard.service";
import { DASHBOARD_PERIODS } from "@/types/dashboard";
import type { DashboardData, DashboardPeriod } from "@/types/dashboard";

import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardStatsCards from "./dashboard/DashboardStatsCards";
import ActivityEvolutionChart from "./dashboard/ActivityEvolutionChart";
import TaskDistribution from "./dashboard/TaskDistribution";
import RecentActivity from "./dashboard/RecentActivity";
import RecentProjects from "./dashboard/RecentProjects";

export default function Dashboard() {

    const [period, setPeriod] = useState<DashboardPeriod>(DASHBOARD_PERIODS.LAST_30_DAYS);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        let cancelled = false;

        setRefreshing(true);

        dashboardService.get(period)
            .then(result => { if (!cancelled) setData(result); })
            .catch(() => {})
            .finally(() => { if (!cancelled) { setLoading(false); setRefreshing(false); } });

        return () => { cancelled = true; };
    }, [period]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <Spinner size={28} />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className={`space-y-6 transition-opacity duration-150 ${refreshing ? "opacity-50" : ""}`}>

            <DashboardHeader period={period} onPeriodChange={setPeriod} />

            <DashboardStatsCards stats={data.stats} />

            <ActivityEvolutionChart evolution={data.evolution} />

            <div className="grid gap-6 lg:grid-cols-2">
                <TaskDistribution distribution={data.distribution} />
                <RecentActivity activities={data.recentActivity} />
            </div>

            <RecentProjects projects={data.recentProjects} />

        </div>
    );
}
