import { User } from "./users";

export interface ProjectManager {
  id: number;
  full_name: string;
  email: string;
}
export interface ProjectsData {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  manager_id: number;
  countMember?: number; // Số lượng thành viên tham gia dự án
  progress?: number; // Tiến độ dự án (0-100)
  created_at: string;
  updated_at: string;
  manager: ProjectManager; // Đối tượng người quản lý được join từ backend[];
  members: User[]; // Mảng các thành viên tham gia dự án
}

