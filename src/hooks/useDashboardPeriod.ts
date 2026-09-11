/**
 * Hook centralisé pour la gestion de la période du tableau de bord.
 * Évite la duplication entre Dashboard.tsx, AdminDashboard.tsx et DashboardHeader.tsx.
 */
import { useState } from "react";
import { DASHBOARD_PERIODS } from "@/types/dashboard";
import type { DashboardPeriod } from "@/types/dashboard";

export function useDashboardPeriod(initial: DashboardPeriod = DASHBOARD_PERIODS.LAST_30_DAYS) {
    const [period, setPeriod] = useState<DashboardPeriod>(initial);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const isCustom = period === DASHBOARD_PERIODS.CUSTOM;
    const isCustomReady = isCustom && !!startDate && !!endDate;
    const shouldFetch = !isCustom || isCustomReady;

    const periodParams = {
        period,
        ...(isCustomReady ? { startDate, endDate } : {}),
    };

    return {
        period,
        setPeriod,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isCustom,
        isCustomReady,
        shouldFetch,
        periodParams,
    };
}
