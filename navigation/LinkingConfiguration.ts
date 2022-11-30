/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Login: 'login',
      Home: 'home',
      Profile: 'profile',
      TopSongs: 'top-songs',
      TopArtists: 'top-artists',
      Soundcheck: 'soundcheck',
      Search: 'search',
      Create: 'create',
      Room: 'room',
      Join: 'join',
      AddNonAuthPlayerModal: 'add-non-auth-player',
      PlayerGuessDetails: 'player-guess-details',
      NotFound: '*',
    },
  },
};

export default linking;
