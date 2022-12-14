/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { IUser, NonAuthUser } from './types/auth'
import { SongItem } from './types/spotify'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  // Root: NavigatorScreenParams<RootTabParamList> | undefined
  AddPlaylistModal: undefined
  NotFound: undefined
  Login: undefined
  TopSongs: undefined
  TopArtists: undefined
  Soundcheck: undefined
  Create: undefined
  Join: undefined
  Home: undefined
  Profile: undefined
  Search: undefined
  AddNonAuthPlayerModal: undefined
  PlayerGuessDetails: { user: IUser, songs: {song: SongItem, player: IUser}[]} 
  Room: { roomCode: string, songsPerUser: number | undefined, timeRange: string | undefined, createRoom: boolean, nonAuthUser: NonAuthUser | undefined }
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>

// export type RootTabParamList = {
//   TabOne: undefined
//   TabTwo: undefined
// }

// export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
//   BottomTabScreenProps<RootTabParamList, Screen>,
//   NativeStackScreenProps<RootStackParamList>
// >
