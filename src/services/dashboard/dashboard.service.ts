import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { DashboardData, DashboardPeriodParams } from "@/types/dashboard";
import { StatsNotAvailableError } from "./errors";

export const dashboardService = {

    /**
     * Récupère les données du tableau de bord pour une période donnée.
     *
     * Stratégie d'erreur :
     * - Pas de réponse réseau (backend absent, CORS, etc.) → StatsNotAvailableError
     * - 404 (endpoint inexistant) → StatsNotAvailableError
     * - Erreur serveur réelle (5xx) → erreur propagée (état ERROR)
     * - Succès → DashboardData
     */
    get: async (params: DashboardPeriodParams & { projectId?: number }): Promise<DashboardData> => {
        try {
            return await apiClient.get<DashboardData>(
                API_ENDPOINTS.DASHBOARD.STATS,
                params as unknown as Record<string, unknown>,
                { silent: true },
            );
        } catch (err: unknown) {
            const axiosError = err as { response?: { status?: number } };

            if (axiosError.response?.status === 404) {
                throw new StatsNotAvailableError();
            }

            if (!axiosError.response) {
                throw new StatsNotAvailableError();
            }

            throw err;
        }
    },
};
