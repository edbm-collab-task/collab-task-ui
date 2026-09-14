import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";

import type { AdminDashboardStatsResDto } from "@/types/adminDashboard";

export const adminDashboardService = {

    getStats: async (params: {
        period: string;
        startDate?: string;
        endDate?: string;
    }): Promise<AdminDashboardStatsResDto> => {

        const queryParams = new URLSearchParams();
        queryParams.append('period', params.period);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        return apiClient.get<AdminDashboardStatsResDto>(
            `${API_ENDPOINTS.ADMIN_DASHBOARD.STATS}?${queryParams.toString()}`
        );
    },

    exportPdf: async (params: {
        period: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Blob> => {

        const queryParams = new URLSearchParams();
        queryParams.append('period', params.period);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        return apiClient.get<Blob>(
            `${API_ENDPOINTS.ADMIN_DASHBOARD.REPORT_PDF}?${queryParams.toString()}`,
            undefined,
            { responseType: 'blob' }
        );
    }
};