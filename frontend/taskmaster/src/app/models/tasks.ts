// Định nghĩa cho một công việc chi tiết (dữ liệu nhận về từ API)
export interface TaskDetailData {
  task_id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  cate: string;
  start_time: string; // Thêm trường start_time
  due_date: string;
  project: Project;
  assignees: User[];
}

// Định nghĩa cho dữ liệu trên form (dữ liệu gửi đi)
export interface TaskForm {
  id: number | null;
  name: string;
  description: string;
  status: string;
  priority: string;
  cate: string;
  start_time: string; // Thêm trường start_time
  due_date: string;
  project_id: number | null;
  assignee_id: number | null; // ID của người được giao việc
}

// Định nghĩa cho Dự án
export interface Project {
  id: number;
  name: string;
}

// Định nghĩa cho Người dùng
export interface User {
  user_id: number;
  full_name: string;
}

export interface TaskNotification {
  id: number;
  message: string;
  status_read: boolean;
  created_at: string;
  recipient: {
    full_name: string;
    email: string;
  };
}
