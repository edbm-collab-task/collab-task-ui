import { CalendarDays } from "lucide-react";
import { DASHBOARD_PERIODS, DASHBOARD_PERIOD_OPTIONS } from "@/types/dashboard";
import type { DashboardPeriod } from "@/types/dashboard";
import TableFilter from "@/components/table/TableFilter";

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

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Statistiques et performances de votre activite
                    </p>
                </div>

                <TableFilter<DashboardPeriod>
                    value={period}
                    options={DASHBOARD_PERIOD_OPTIONS}
                    onChange={onPeriodChange}
                    placeholder="Periode"
                />
            </div>

            {isCustom && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                Date de debut
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
