export interface User {
  user_id: number;
  username: string;
  full_name: string;
  status: string; // 'active' | 'inactive'
  email: string;
  phone_number: string;
  address: string;
}
