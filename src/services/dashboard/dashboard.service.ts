import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { DashboardData, DashboardPeriodParams } from "@/types/dashboard";
import { StatsNotAvailableError } from "./errors";

export const dashboardService = {

    /**
     * Récupère les données du tableau de bord pour une période donnée.
     *
     * Stratégie d'erreur (importante pour l'UX) :
     * - Pas de réponse réseau (backend absent, CORS, etc.) → StatsNotAvailableError
     *   → Le composant Dashboard affiche un état "vide" neutre (pas de toast d'erreur).
     * - 404 (endpoint inexistant, backend pas encore implémenté) → StatsNotAvailableError
     *   → Même comportement : état vide, pas d'erreur bloquante.
     * - Erreur serveur réelle (5xx, 400, etc.) → erreur propagée
     *   → Le composant passe en état ERROR et affiche un message.
     * - Succès → DashboardData
     *
     * L'option { silent: true } empêche l'intercepteur global de toast d'afficher
     * une erreur pour les cas 404/réseau (gérés ici via StatsNotAvailableError).
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
