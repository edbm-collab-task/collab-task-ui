import { apiClient } from "@/api/api-client";
import type { RequestOptions } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type {
    Role,
    RoleBody,
    RoleActionsMap,
    RoleActionsMapEntry,
    PermissionWithActionMask,
    Action
} from "@/types/role";

export const roleService = {

    getAll: async (): Promise<Role[]> => {
        return apiClient.get<Role[]>(API_ENDPOINTS.ROLES.ALL);
    },

    getById: async (id: number): Promise<Role> => {
        return apiClient.get<Role>(`${API_ENDPOINTS.ROLES.BY_ID}/${id}`);
    },

    create: async (data: RoleBody): Promise<Role> => {
        return apiClient.post<Role, RoleBody>(API_ENDPOINTS.ROLES.CREATE, data);
    },

    update: async (id: number, data: RoleBody): Promise<Role> => {
        return apiClient.put<Role, RoleBody>(`${API_ENDPOINTS.ROLES.UPDATE}/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${API_ENDPOINTS.ROLES.DELETE}/${id}`);
    },

    /**
     * Table de conversion des actions (`ActionResDto`) : nom technique,
     * code binaire (`codeAction`) et libellé. Sert à hydrater le catalogue
     * `ACT` côté front (`hydrateActionCatalog`).
     *
     * Appel `silent` : en cas d'échec le front garde ses codes à 0
     * (fail-closed) sans toast au démarrage.
     */
    getActions: async (): Promise<Action[]> => {
        return apiClient.get<Action[]>(API_ENDPOINTS.ROLES.ACTIONS, undefined, {
            silent: true
        });
    },

    /**
     * Catalogue des permissions avec le masque de leurs actions possibles
     * (`totalActions`). L'API ne renvoie plus la liste `actions`, mais un
     * masque binaire exploité via `maskToActions`.
     */
    getPermissionsWithActionMasks: async (): Promise<PermissionWithActionMask[]> => {
        return apiClient.get<PermissionWithActionMask[]>(
            API_ENDPOINTS.ROLES.PERMISSIONS_ACTIONS
        );
    },

    /**
     * Actions de tous les rôles, regroupées par permission, en un seul appel.
     * Chaque entrée porte `totalActions` et `totalActionsAccordees` (masques).
     */
    getActionsMap: async (options?: RequestOptions): Promise<RoleActionsMap> => {
        return apiClient.get<RoleActionsMap>(
            API_ENDPOINTS.ROLES.ACTIONS_MAP,
            undefined,
            { silent: options?.silent }
        );
    },

    /**
     * Remplace les actions d'un rôle. Le corps attend une association
     * `nom de permission → actions` (voir {@link RoleActionsMapEntry.permissions}).
     */
    setActions: async (
        id: number,
        actions: Record<string, string[]>
    ): Promise<RoleActionsMapEntry> => {
        return apiClient.put<RoleActionsMapEntry, Record<string, string[]>>(
            API_ENDPOINTS.ROLES.ROLE_ACTIONS(id),
            actions
        );
    },

};
