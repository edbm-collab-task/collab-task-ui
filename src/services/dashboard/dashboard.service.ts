import type { DashboardData, DashboardPeriodParams } from "@/types/dashboard";
import { buildDashboardMockData } from "@/data/dashboard.mock";

export const dashboardService = {

    // TODO backend : brancher sur GET /dashboard/stats?period={period}&startDate={...}&endDate={...}
    get: async (params: DashboardPeriodParams): Promise<DashboardData> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return buildDashboardMockData(params);
    },
};
