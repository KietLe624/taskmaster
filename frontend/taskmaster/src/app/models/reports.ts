export interface TaskStatusDistribution {
  status: string;
  count: number;
}

export interface TasksPerProject {
  name: string;
  taskCount: number;
}

export interface ReportData {
  taskStatusDistribution: TaskStatusDistribution[];
  tasksPerProject: TasksPerProject[];
}
