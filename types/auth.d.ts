export interface IUser {
  id: string;
  name: string;
  avatar: string;
}

export interface IAuth {
  authenticated: boolean,
  token: string,
  user: IUser | null,
}

export type AuthContextType = {
  auth: IAuth;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => Promise<boolean>;
};