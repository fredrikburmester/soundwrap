export interface IGuess {
  currentSongIndex: number, 
  guess: string
}

export interface IUser {
  id: string;
  name: string;
  avatar: string;
  score: number;
  guesses: IGuess[]
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

export type NonAuthUser = {
  name: string;
  songs: Item[];
}