import useAuth from "@/hooks/useAuth";
import { DASHBOARD_PERIOD_OPTIONS } from "@/types/dashboard";
import type { DashboardPeriod } from "@/types/dashboard";
import TableFilter from "@/components/table/TableFilter";

interface Props {
    period: DashboardPeriod;
    onPeriodChange: (period: DashboardPeriod) => void;
}

export default function DashboardHeader({ period, onPeriodChange }: Props) {

    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="mt-1 text-sm font-medium text-gray-700">
                    Bonjour{user ? `, ${user.firstname} ${user.lastname}` : ""} 👋
                </p>
                <p className="text-sm text-gray-500">
                    Voici un apercu de votre activite
                </p>
            </div>

            <TableFilter<DashboardPeriod>
                value={period}
                options={DASHBOARD_PERIOD_OPTIONS}
                onChange={onPeriodChange}
                placeholder="Periode"
            />

        </div>
    );
}
