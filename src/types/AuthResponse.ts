export interface AuthResponse {
  userID: string;
  token: string;
  expiresIn: number;
  username: string;
  email: string;
  role: string;
};