export interface Notification {
  id: number;
  user_id: number;
  type: string; // Loại thông báo (ví dụ: 'task', 'project', v.v.)
  message: string;
  status_read: boolean; // Trạng thái đã đọc hay chưa
  created_at: string;
  updated_at: string;
}
