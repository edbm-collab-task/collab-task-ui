import { CalendarDays, Download } from "lucide-react";
import { DASHBOARD_PERIODS, DASHBOARD_PERIOD_OPTIONS } from "@/types/dashboard";
import type { DashboardPeriod } from "@/types/dashboard";
import TableFilter from "@/components/table/TableFilter";
import { API_ENDPOINTS } from "@/api/constants";
import { api } from "@/api/axios";

interface Props {
    period: DashboardPeriod;
    onPeriodChange: (period: DashboardPeriod) => void;
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
}

const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function DashboardHeader({
    period,
    onPeriodChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: Props) {

    const isCustom = period === DASHBOARD_PERIODS.CUSTOM;

    const handleExportPdf = async () => {
        try {
            const params: Record<string, string> = { period };
            if (isCustom && startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            }
            const response = await api.get(API_ENDPOINTS.DASHBOARD.REPORT_PDF, {
                params,
                responseType: "blob",
                silent: true,
            } as any);
            const blob = new Blob([response.data as BlobPart], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `rapport-statistiques-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            // silent error
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Statistiques et performances de votre activité
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
                    >
                        <Download size={16} />
                        Exporter en PDF
                    </button>
                    <TableFilter<DashboardPeriod>
                        value={period}
                        options={DASHBOARD_PERIOD_OPTIONS}
                        onChange={onPeriodChange}
                        placeholder="Période"
                    />
                </div>
            </div>

            {isCustom && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                Date de début
                            </span>
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            max={endDate || undefined}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                Date de fin
                            </span>
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            min={startDate || undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
