export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
}

export interface Users {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone_number?: string; // Optional field for user phone number
  address?: string; // Optional field for user address
  created_at: string;
  updated_at: string;
}


