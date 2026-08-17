export interface ProjectRes {
    projectId: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    ownerId: number;
    ownerName: string;
}

export interface ProjectReq {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    ownerId: number;
}

export const projectTr: Record<string, string> = {
    projectId: "ID",
    title: "Titre",
    description: "Description",
    startDate: "Début",
    endDate: "Fin",
    ownerName: "Propriétaire",
    isActive: "Actif",
};
