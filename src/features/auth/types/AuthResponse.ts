export interface AuthResponse {
  userID: string;
  playerID?: string,
  token: string;
  expiresIn: number;
  username: string;
  email: string;
  role: string;
};