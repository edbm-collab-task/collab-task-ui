export interface AttacheRole {
    email: string;
    role: string;
}

export interface Permission {
    id: number;
    name: string;
    description: string;
}

export interface Role {
    id: number;
    name: string;
    permissions: string[];
}

export interface RoleFormData {
    name: string;
    permissions: string[];
}
