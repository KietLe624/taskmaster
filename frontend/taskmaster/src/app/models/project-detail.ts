
export interface User {
  id: number;
  full_name: string;
  email: string;
}

// Dữ liệu công việc
export interface Task {
  id: number;
  name: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  assignees: User[];
}

export interface ProjectMember {
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
  manager: User; // Người quản lý là một User
  members: ProjectMember[]; // Mảng các thành viên
  tasks: Task[]; // Mảng các công việc
}
