export type AuthResponse = {
  token: string;
  expiresIn: number;
  username: string;
  email: string;
  role: string;
};