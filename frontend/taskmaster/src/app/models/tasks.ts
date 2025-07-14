// Interface cho các đối tượng lồng nhau
interface ProjectInfo {
  id: number;
  name: string;
}

interface UserInfo {
  id: number;
  full_name: string;
  email: string;
}

// Interface chính cho dữ liệu chi tiết công việc
export interface TaskDetailData {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  project: ProjectInfo;
  assignees: UserInfo[];
}
