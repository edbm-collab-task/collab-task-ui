import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type {
    Role,
    RoleBody,
    RoleActions,
    PermissionWithActions
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
     * Catalogue des permissions avec, pour chacune, ses actions disponibles.
     * Remplace {@link getAllPermissions} en apportant les actions.
     */
    getPermissionsWithActions: async (): Promise<PermissionWithActions[]> => {
        return apiClient.get<PermissionWithActions[]>(
            API_ENDPOINTS.ROLES.PERMISSIONS_ACTIONS
        );
    },

    /**
     * Actions actuellement accordées à un rôle, regroupées par permission.
     */
    getActions: async (id: number): Promise<RoleActions> => {
        return apiClient.get<RoleActions>(`${API_ENDPOINTS.ROLES.ACTIONS}/${id}`);
    },

    /**
     * Remplace les actions d'un rôle. Le corps attend une association
     * `nom de permission → actions` (voir {@link RoleActions.permissions}).
     */
    setActions: async (
        id: number,
        actions: Record<string, string[]>
    ): Promise<RoleActions> => {
        return apiClient.put<RoleActions, Record<string, string[]>>(
            `${API_ENDPOINTS.ROLES.ACTIONS}/${id}`,
            actions
        );
    },

};
