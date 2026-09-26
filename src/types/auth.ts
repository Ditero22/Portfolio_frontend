export type Role = "admin";

export interface QRLoginPayload {
  token: string;
}

export interface AuthUser {
  role: Role;
}

export interface QRLoginResponse {
  accessToken: string;
  user: AuthUser;
}
