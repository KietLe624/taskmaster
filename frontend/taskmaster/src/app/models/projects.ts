export interface ProjectManager {
  id: number;
  full_name: string;
  email: string;
}
export interface Projects {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  manager_id: number;
  created_at: string;
  updated_at: string;
  manager: ProjectManager; // Đối tượng người quản lý được join từ backend

}
