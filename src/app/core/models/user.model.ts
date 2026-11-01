export interface User {
  id: number;
  email: string;
  fullName?: string;
  username?: string;
  role?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  message?: string;
}
