import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/constants";
import type { Role, RoleFormData, Permission } from "@/types/role";

export const roleService = {

    getAll: async (): Promise<Role[]> => {
        return apiClient.get<Role[]>(API_ENDPOINTS.ROLES.ALL);
    },

    getById: async (id: number): Promise<Role> => {
        return apiClient.get<Role>(`${API_ENDPOINTS.ROLES.BY_ID}/${id}`);
    },

    create: async (data: RoleFormData): Promise<Role> => {
        return apiClient.post<Role, RoleFormData>(API_ENDPOINTS.ROLES.CREATE, data);
    },

    update: async (id: number, data: RoleFormData): Promise<Role> => {
        return apiClient.put<Role, RoleFormData>(`${API_ENDPOINTS.ROLES.UPDATE}/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${API_ENDPOINTS.ROLES.DELETE}/${id}`);
    },

    getAllPermissions: async (): Promise<Permission[]> => {
        return apiClient.get<Permission[]>(API_ENDPOINTS.ROLES.PERMISSIONS);
    },

};
