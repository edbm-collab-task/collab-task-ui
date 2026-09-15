import { useEffect, useState } from "react";
import { Download, Users, FolderKanban, AlertCircle, Clock, TrendingUp, CalendarDays } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { adminDashboardService } from "@/services/dashboard/adminDashboard.service";
import type { AdminDashboardStatsResDto } from "@/types/adminDashboard";
import type { DashboardPeriod } from "@/types/dashboard";
import { DASHBOARD_PERIOD_OPTIONS } from "@/types/dashboard";
import TableFilter from "@/components/table/TableFilter";
import Sparkline from "./dashboard/Sparkline";
import AdminEvolutionChart from "./dashboard/AdminEvolutionChart";
import OverdueTasksModal from "./dashboard/OverdueTasksModal";
import { generateIncreasingSparkline, getAdminSparkline } from "@/utils/sparkline";
import { useDashboardPeriod } from "@/hooks/useDashboardPeriod";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    sparklineData?: number[];
    sparklineColor?: string;
    trend?: { value: number; label: string };
    highlighted?: boolean;
    onClick?: () => void;
}

function StatCard({ title, value, icon, color, sparklineData, trend, highlighted = false, onClick }: StatCardProps) {
    const isClickable = !!onClick;
    return (
        <div
            onClick={isClickable ? onClick : undefined}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); } : undefined}
            className={`rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                highlighted ? "border-accent hover:bg-accent/5" : "border-secondary/60"
            } ${isClickable ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" : ""}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className="mt-2 flex items-end gap-3">
                        <p className={`text-3xl font-bold ${highlighted ? "text-accent" : "text-primary"}`}>{value}</p>
                        {sparklineData && sparklineData.length > 0 && (
                            <div className="h-10 w-28 flex-shrink-0">
                                <Sparkline data={sparklineData} color="#d07694" height={30} width={100} />
                            </div>
                        )}
                    </div>
                    {trend && (
                        <p className="mt-1 text-sm text-emerald-600 flex items-center gap-1">
                            <TrendingUp size={14} />
                            +{trend.value}% {trend.label}
                        </p>
                    )}
                </div>
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {

    const { period, setPeriod, startDate, setStartDate, endDate, setEndDate, isCustom, shouldFetch, periodParams } = useDashboardPeriod();
    const [data, setData] = useState<AdminDashboardStatsResDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOverdueModal, setShowOverdueModal] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (!shouldFetch) return;

        setLoading(true);
        setError(null);

        const params = periodParams;

        adminDashboardService.getStats(params)
            .then(result => {
                if (!cancelled) {
                    setData(result);
                }
            })
            .catch(() => {
                if (!cancelled) setError("Impossible de charger les données");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [period, startDate, endDate]);

    // ===== EXPORT PDF GLOBAL PAR PÉRIODE =====
    const handleExportPdf = async () => {
        try {
            const params = periodParams;
            const response = await adminDashboardService.exportPdf(params);
            let blob: Blob;
            if (response && typeof response === 'object' && 'data' in response) {
                blob = (response as any).data as Blob;
            } else {
                blob = response as Blob;
            }
            if (!(blob instanceof Blob)) {
                throw new Error('Le service n’a pas retourné un fichier valide.');
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `rapport-suivi-des-projets-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erreur lors de l'export PDF :", error);
            alert("Impossible de générer le rapport. Veuillez réessayer.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <Spinner size={28} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-secondary/60 bg-white shadow-sm">
                <AlertCircle size={24} className="text-accent" />
                <p className="text-sm text-gray-500">{error}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); setPeriod(p => p); }}
                    className="text-sm font-medium text-primary transition hover:text-primary/80"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <p className="text-sm text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Dashboard Admin</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Vue globale utilisateurs, projets et tâches
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-2 rounded-xl border border-secondary/60 bg-white px-4 py-2.5 text-sm font-medium text-primary shadow-sm transition hover:bg-secondary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <Download size={16} />
                        Exporter PDF
                    </button>
                    <TableFilter<DashboardPeriod>
                        value={period}
                        options={DASHBOARD_PERIOD_OPTIONS}
                        onChange={(v) => setPeriod(v)}
                        placeholder="Période"
                    />
                </div>
            </div>

            {/* Date range for custom period */}
            {isCustom && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <CalendarDays size={14} className="text-primary/60" />
                            Date de début
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-xl border border-secondary/60 bg-white px-4 py-2.5 text-sm text-primary outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/40"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <CalendarDays size={14} className="text-primary/60" />
                            Date de fin
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-xl border border-secondary/60 bg-white px-4 py-2.5 text-sm text-primary outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/40"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Utilisateurs totaux"
                    value={data.totalUsers}
                    icon={<Users size={22} className="text-primary" />}
                    color="bg-secondary/40 ring-1 ring-secondary"
                    sparklineData={generateIncreasingSparkline(data.totalUsers, 7)}
                />
                <StatCard
                    title="Projets actifs"
                    value={data.activeProjects}
                    icon={<FolderKanban size={22} className="text-primary" />}
                    color="bg-secondary/40 ring-1 ring-secondary"
                    sparklineData={generateIncreasingSparkline(data.activeProjects, 7)}
                />
                <StatCard
                    title="Tâches en retard"
                    value={data.overdueTasks}
                    icon={<AlertCircle size={22} className="text-accent" />}
                    color="bg-accent/15 ring-1 ring-accent/40"
                    highlighted={data.overdueTasks > 0}
                    onClick={() => setShowOverdueModal(true)}
                    sparklineData={generateIncreasingSparkline(data.overdueTasks, 7)}
                />
                <StatCard
                    title="Tâches terminées"
                    value={data.completedTasks}
                    icon={<Clock size={22} className="text-primary" />}
                    color="bg-secondary/40 ring-1 ring-secondary"
                    sparklineData={getAdminSparkline(data.evolution, "completed", data.completedTasks)}
                />
            </div>

            {/* Evolution Chart */}
            <AdminEvolutionChart evolution={data.evolution ?? null} />

            {/* Users Table */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-primary">Top 10 Utilisateurs</h3>
                    <Users size={18} className="text-primary/50" />
                </div>
                {data.topUsers.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-gray-400">
                        <p className="text-sm">Aucune donnée</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {data.topUsers.map((user) => (
                            <li key={user.userId} className="py-3 transition-all duration-200 hover:bg-gray-50 hover:px-3 rounded-lg">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-primary text-xs font-bold">
                                            {user.firstname[0]}{user.lastname[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                    {user.firstname} {user.lastname}
                                                </p>
                                                <span className="shrink-0 rounded-full bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-primary">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-gray-500">{user.direction}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0 text-sm">
                                        <div className="text-center">
                                            <p className="font-bold text-primary">{user.assignedTasks}</p>
                                            <p className="text-[11px] text-gray-400">assignées</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-accent">{user.completedTasks}</p>
                                            <p className="text-[11px] text-gray-400">terminées</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-bold ${user.overdueTasks > 0 ? "text-accent" : "text-gray-400"}`}>{user.overdueTasks}</p>
                                            <p className="text-[11px] text-gray-400">retard</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Projects Table */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-primary">Top 10 Projets</h3>
                    <FolderKanban size={18} className="text-primary/50" />
                </div>
                {data.topProjects.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-gray-400">
                        <p className="text-sm">Aucun projet</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {data.topProjects.map((project) => (
                            <li key={project.projectId} className="py-3 transition-all duration-200 hover:bg-gray-50 hover:px-3 rounded-lg">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-gray-800">{project.title}</p>
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                                project.status === "Actif"
                                                    ? "bg-secondary/40 text-primary"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-gray-500">{project.ownerName}</p>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0 text-sm">
                                        <div className="text-center">
                                            <p className="font-bold text-primary">{project.totalTasks}</p>
                                            <p className="text-[11px] text-gray-400">tâches</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-accent">{project.completedTasks}</p>
                                            <p className="text-[11px] text-gray-400">terminées</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-bold ${project.overdueTasks > 0 ? "text-accent" : "text-gray-400"}`}>{project.overdueTasks}</p>
                                            <p className="text-[11px] text-gray-400">retard</p>
                                        </div>
                                        <div className="w-20 text-right">
                                            <p className="text-sm font-bold text-gray-700">{project.progressPercent}%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className={`h-full rounded-full ${project.progressPercent === 100 ? "bg-primary" : "bg-accent"}`}
                                        style={{ width: `${project.progressPercent}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showOverdueModal && (
                <OverdueTasksModal onClose={() => setShowOverdueModal(false)} />
            )}
        </div>
    );
}