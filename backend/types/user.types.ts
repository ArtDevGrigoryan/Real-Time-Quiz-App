export interface IUser {
  id: string;
  role: "ADMIN" | "USER";
  username: string;
  password: string;
  createdAt: Date;
  refresh_token: string | null;
}

export interface IRefreshTokenDto {
  accessToken: string;
  refreshToken: string;
}
