export interface UserStatsResDto {
    userId: number;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    direction: string;
    assignedTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    lastActivity: string;
}

export interface ProjectStatsResDto {
    projectId: number;
    title: string;
    ownerName: string;
    direction: string;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    progressPercent: number;
    status: string;
}

export interface DirectionStatsResDto {
    directionId: number;
    name: string;
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
}

export interface EvolutionPointResDto {
    label: string;
    created: number;
    completed: number;
}

export interface PriorityDistributionResDto {
    priorityName: string;
    color: string;
    count: number;
}

export interface AssigneeWorkloadResDto {
    userId: number;
    firstname: string;
    lastname: string;
    email: string;
    direction: string;
    totalAssigned: number;
    completed: number;
    inProgress: number;
    overdue: number;
}

export interface RecentActivityResDto {
    id: number;
    type: string;
    description: string;
    userName: string;
    projectName: string;
    createdAt: string;
}

export interface AdminDashboardStatsResDto {
    totalUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    evolution: EvolutionPointResDto[];
    priorityDistribution: PriorityDistributionResDto[];
    assigneeWorkload: AssigneeWorkloadResDto[];
    topUsers: UserStatsResDto[];
    topProjects: ProjectStatsResDto[];
    directionStats: DirectionStatsResDto[];
    recentActivity: RecentActivityResDto[];
}

export interface EvolutionPointResDto {
    label: string;
    created: number;
    completed: number;
}

export interface PriorityDistributionResDto {
    priorityName: string;
    color: string;
    count: number;
}

export interface AssigneeWorkloadResDto {
    userId: number;
    firstname: string;
    lastname: string;
    email: string;
    direction: string;
    totalAssigned: number;
    completed: number;
    inProgress: number;
    overdue: number;
}

export interface RecentActivityResDto {
    id: number;
    type: string;
    description: string;
    userName: string;
    projectName: string;
    createdAt: string;
}