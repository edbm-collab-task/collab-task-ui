import { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";

import Spinner from "@/components/common/Spinner";
import { dashboardService } from "@/services/dashboard/dashboard.service";
import { projectService } from "@/services/project/project.service";
import { StatsNotAvailableError } from "@/services/dashboard/errors";
import { DASHBOARD_PERIODS } from "@/types/dashboard";
import type { DashboardData, DashboardPeriod, DashboardPeriodParams } from "@/types/dashboard";
import usePermissions from "@/hooks/usePermissions";
import type { ProjectRes } from "@/types/project";

import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardStatsCards from "./dashboard/DashboardStatsCards";
import ActivityEvolutionChart from "./dashboard/ActivityEvolutionChart";
import TaskDistribution from "./dashboard/TaskDistribution";
import RecentActivity from "./dashboard/RecentActivity";
import RecentProjects from "./dashboard/RecentProjects";
import OverdueTasksModal from "./dashboard/OverdueTasksModal";

export default function Dashboard() {

    const { hasPermission } = usePermissions();

    if (!hasPermission("VIEW_REPORTS")) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <ShieldAlert size={32} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-600">Accès refusé</p>
                <p className="text-xs text-gray-400">Vous n'avez pas la permission d'accéder au tableau de bord.</p>
            </div>
        );
    }

    const [period, setPeriod] = useState<DashboardPeriod>(DASHBOARD_PERIODS.LAST_30_DAYS);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statsUnavailable, setStatsUnavailable] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Project filter
    const [projects, setProjects] = useState<ProjectRes[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all");
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);

    // Overdue tasks modal
    const [showOverdueModal, setShowOverdueModal] = useState(false);

    // Load projects for filter
    useEffect(() => {
        projectService.getAllIncludingArchived()
            .then(setProjects)
            .catch(console.error);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const isCustomReady = period === DASHBOARD_PERIODS.CUSTOM && startDate && endDate;
        const shouldFetch = period !== DASHBOARD_PERIODS.CUSTOM || isCustomReady;

        if (!shouldFetch) return;

        setRefreshing(true);
        setError(null);

        const params: DashboardPeriodParams = {
            period,
            ...(isCustomReady ? { startDate, endDate } : {}),
        };

        // Add project filter to params
        if (selectedProjectId !== "all") {
            params.projectId = selectedProjectId;
        }

        dashboardService.get(params)
            .then(result => {
                if (cancelled) return;
                setData(result);
                setStatsUnavailable(false);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                if (err instanceof StatsNotAvailableError) {
                    setStatsUnavailable(true);
                    setData(null);
                } else {
                    setError("Impossible de charger les données du tableau de bord.");
                }
            })
            .finally(() => {
                if (!cancelled) { setLoading(false); setRefreshing(false); }
            });

        return () => { cancelled = true; };
    }, [period, startDate, endDate, selectedProjectId]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner size={28} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <DashboardHeader
                    period={period}
                    onPeriodChange={setPeriod}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    onProjectChange={setSelectedProjectId}
                    showProjectDropdown={showProjectDropdown}
                    setShowProjectDropdown={setShowProjectDropdown}
overdueCount={0}
                    onOverdueClick={() => setShowOverdueModal(true)}
                />
                <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <AlertTriangle size={24} className="text-red-400" />
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={() => { setError(null); setLoading(true); setPeriod(p => p); }}
                        className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const empty = statsUnavailable || !data;
    const overdueCount = data?.stats?.overdueTasks ?? 0;

    return (
        <div className={`space-y-6 transition-opacity duration-150 ${refreshing ? "opacity-50" : ""}`}>

            <DashboardHeader
                period={period}
                onPeriodChange={setPeriod}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                projects={projects}
                selectedProjectId={selectedProjectId}
                onProjectChange={setSelectedProjectId}
                showProjectDropdown={showProjectDropdown}
                setShowProjectDropdown={setShowProjectDropdown}
                overdueCount={overdueCount}
                onOverdueClick={() => setShowOverdueModal(true)}
            />

            <DashboardStatsCards
                stats={empty ? null : data.stats}
                evolution={empty ? null : data.evolution}
            />

            <ActivityEvolutionChart
                evolution={empty ? null : data.evolution}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <TaskDistribution
                    distribution={empty ? null : data.distribution}
                />
                <RecentActivity
                    activities={empty ? null : data.recentActivity}
                />
            </div>

            <RecentProjects
                projects={empty ? null : data.recentProjects}
            />

            {showOverdueModal && (
                <OverdueTasksModal
                    projectId={selectedProjectId === "all" ? undefined : selectedProjectId}
                    onClose={() => setShowOverdueModal(false)}
                />
            )}
        </div>
    );
}