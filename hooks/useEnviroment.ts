import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface IEnv {
  development: {
    wsurl: string;
  },
  preview: {
    wsurl: string;
  },
  production: {
    wsurl: string;
  }
}
  

const ENV: IEnv = {
  development: {
    wsurl: 'http://localhost:5000',
  },
  preview: {
    wsurl: 'https://ws.soundwrap.app',
  },
  production: {
    wsurl: 'https://ws.soundwrap.app',
  },
};

export const getEnvVars = (env = Constants.manifest?.releaseChannel): { wsurl: string } => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  if (__DEV__) {
    return ENV.development;
  } else if (env === 'staging') {
    return ENV.preview;
  }
  
  return ENV.production;
};