import { useEffect, useState } from "react";
import { Download, Users, FolderKanban, AlertCircle, Clock, TrendingUp } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { adminDashboardService } from "@/services/dashboard/adminDashboard.service";
import type { AdminDashboardStatsResDto } from "@/types/adminDashboard";
import type { DashboardPeriod } from "@/types/dashboard";
import { DASHBOARD_PERIODS, DASHBOARD_PERIOD_OPTIONS } from "@/types/dashboard";
import TableFilter from "@/components/table/TableFilter";
import Sparkline from "./dashboard/Sparkline";
import AdminEvolutionChart from "./dashboard/AdminEvolutionChart";

function generateIncreasingSparkline(baseValue: number, points: number = 7): number[] {
    const target = Math.max(0, baseValue ?? 0);
    if (target === 0) return Array(points).fill(0);
    const start = Math.max(1, Math.floor(target * 0.45));
    const step = (target - start) / (points - 1);
    let seed = Math.abs(target) * 1664525 + 1013904223;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
    const res: number[] = [];
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

function getAdminSparkline(evolution: { label: string; created: number; completed: number }[] | null | undefined, metric: "created" | "completed", fallback: number): number[] {
    if (!evolution || evolution.length === 0) return generateIncreasingSparkline(fallback, 7);
    const pts = evolution.slice(-7);
    let cum = 0;
    const vals = pts.map(p => cum += metric === "created" ? p.created : p.completed);
    if (vals.length !== 7) return generateIncreasingSparkline(fallback, 7);
    const maxCum = vals[vals.length - 1] || 1;
    if (fallback > maxCum && maxCum > 0) {
        const ratio = fallback / maxCum;
        return vals.map(v => Math.round(v * ratio));
    }
    return vals;
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    sparklineData?: number[];
    sparklineColor?: string;
    trend?: { value: number; label: string };
}

function StatCard({ title, value, icon, color, sparklineData, trend }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className="mt-2 flex items-end gap-3">
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        {sparklineData && sparklineData.length > 0 && (
                            <div className="h-10 w-28 flex-shrink-0">
                                <Sparkline data={sparklineData} color="#3b82f6" height={30} width={100} />
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
                <div className={`rounded-xl p-3 ${color} flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {

    const [period, setPeriod] = useState<DashboardPeriod>(DASHBOARD_PERIODS.LAST_30_DAYS);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState<AdminDashboardStatsResDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isCustom = period === DASHBOARD_PERIODS.CUSTOM;

    useEffect(() => {
        let cancelled = false;

        const isCustomReady = period === DASHBOARD_PERIODS.CUSTOM && startDate && endDate;
        const shouldFetch = period !== DASHBOARD_PERIODS.CUSTOM || isCustomReady;

        if (!shouldFetch) return;

        setLoading(true);
        setError(null);

        const params = {
            period,
            ...(isCustomReady ? { startDate, endDate } : {}),
        };

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
            const params: { period: string; startDate?: string; endDate?: string } = { period };
            if (isCustom && startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            }
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
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <AlertCircle size={24} className="text-red-400" />
                <p className="text-sm text-gray-500">{error}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); setPeriod(p => p); }}
                    className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
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
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Admin</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Vue globale utilisateurs, projets et tâches
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
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
            {period === DASHBOARD_PERIODS.CUSTOM && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Date de début
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Date de fin
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    icon={<Users size={24} className="text-blue-600" />}
                    color="bg-blue-50"
                    sparklineData={generateIncreasingSparkline(data.totalUsers, 7)}
                />
                <StatCard
                    title="Projets actifs"
                    value={data.activeProjects}
                    icon={<FolderKanban size={24} className="text-emerald-600" />}
                    color="bg-emerald-50"
                    sparklineData={generateIncreasingSparkline(data.activeProjects, 7)}
                />
                <StatCard
                    title="Tâches en retard"
                    value={data.overdueTasks}
                    icon={<AlertCircle size={24} className="text-red-600" />}
                    color="bg-red-50"
                    sparklineData={generateIncreasingSparkline(data.overdueTasks, 7)}
                />
                <StatCard
                    title="Tâches terminées"
                    value={data.completedTasks}
                    icon={<Clock size={24} className="text-amber-600" />}
                    color="bg-amber-50"
                    sparklineData={getAdminSparkline(data.evolution, "completed", data.completedTasks)}
                />
            </div>

            {/* Evolution Chart */}
            <AdminEvolutionChart evolution={data.evolution ?? null} />

            {/* Users Table */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Users size={20} className="text-gray-600" />
                        Top 10 Utilisateurs (par tâches assignées)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-3">Utilisateur</th>
                                <th className="px-6 py-3">Rôle</th>
                                <th className="px-6 py-3">Direction</th>
                                <th className="px-6 py-3 text-center">Assignées</th>
                                <th className="px-6 py-3 text-center">Terminées</th>
                                <th className="px-6 py-3 text-center">En retard</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.topUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        Aucune donnée
                                    </td>
                                </tr>
                            ) : (
                                data.topUsers.map((user) => (
                                    <tr key={user.userId} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                                                    {user.firstname[0]}{user.lastname[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {user.firstname} {user.lastname}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.direction}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-800">{user.assignedTasks}</td>
                                        <td className="px-6 py-4 text-center text-emerald-600 font-medium">{user.completedTasks}</td>
                                        <td className="px-6 py-4 text-center text-red-600 font-medium">{user.overdueTasks}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Projects Table */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm mt-6">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FolderKanban size={20} className="text-gray-600" />
                        Top 10 Projets (par volume de tâches)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-3">Projet</th>
                                <th className="px-6 py-3">Propriétaire</th>
                                <th className="px-6 py-3 text-center">Total tâches</th>
                                <th className="px-6 py-3 text-center">Terminées</th>
                                <th className="px-6 py-3 text-center">En retard</th>
                                <th className="px-6 py-3 text-center">Progression</th>
                                <th className="px-6 py-3">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.topProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                                        Aucun projet
                                    </td>
                                </tr>
                            ) : (
                                data.topProjects.map((project) => (
                                    <tr key={project.projectId} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{project.title}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{project.ownerName}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-800">{project.totalTasks}</td>
                                        <td className="px-6 py-4 text-center text-emerald-600 font-medium">{project.completedTasks}</td>
                                        <td className="px-6 py-4 text-center text-red-600 font-medium">{project.overdueTasks}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="w-24 mx-auto">
                                                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                                    <div
                                                        className="h-full rounded-full bg-blue-500 transition-all"
                                                        style={{ width: `${project.progressPercent}%` }}
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">{project.progressPercent}%</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                project.status === "Actif"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}