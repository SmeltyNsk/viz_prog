export interface User {
  id: string;
  email: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}