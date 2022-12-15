export type IUserGuess = {
  currentSongIndex: number, 
  guess: string
}

export type IUser = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  guesses: IUserGuess[]
}

export interface IAuth {
  authenticated: boolean,
  token: string,
  user: IUser | null,
}

export type AuthContextType = {
  auth: IAuth;
  login: (token: string) => void;
  loginDemo: () => void;
  logout: () => void;
  demo: boolean;
};

export type NonAuthUser = {
  name: string;
  songs: Item[];
}