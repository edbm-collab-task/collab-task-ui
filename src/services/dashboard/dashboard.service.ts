import type { DashboardData, DashboardPeriod } from "@/types/dashboard";
import { buildDashboardMockData } from "@/data/dashboard.mock";

export const dashboardService = {

    // TODO backend : brancher sur GET /dashboard/stats?period={period}
    get: async (period: DashboardPeriod): Promise<DashboardData> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return buildDashboardMockData(period);
    },
};
