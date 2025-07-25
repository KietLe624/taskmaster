
export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
}

// Dữ liệu công việc
export interface Task {
  task_id: number;
  name: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  cate : string; // Thêm trường cate
  createdAt: string;
  updatedAt: string;
  assignees: User[];
}

export interface ProjectMember {
  id: number;
  user_id: number;
  users: User;
}

// Dữ liệu chi tiết của một dự án
export interface ProjectDetailData {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  manager_id: number;
  created_at: string;
  updated_at: string;
  priority?: string;
  progress: number;
  completedTasksCount?: number;
  totalTasksCount?: number;
  countMember?: number; // Số lượng thành viên tham gia dự án
  manager: User; // Người quản lý là một User
  members: ProjectMember[]; // Mảng các thành viên
  tasks: Task[]; // Mảng các công việc
}
