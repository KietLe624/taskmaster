export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
}

export interface Users {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number?: string; // Optional field for user phone number
  address?: string; // Optional field for user address
}


