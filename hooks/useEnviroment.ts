import Constants from 'expo-constants';
import { Platform } from 'react-native';



interface IEnv {
  dev: {
    wsurl: string;
  },
  staging: {
    wsurl: string;
  },
  prod: {
    wsurl: string;
  }
}
  

const ENV: IEnv = {
  dev: {
    wsurl: 'http://0.0.0.0:5000',
  },
  staging: {
    wsurl: 'https://soundcheckgame-ts-ws-backend.fdrive.se',
  },
  prod: {
    wsurl: 'https://soundcheckgame-ts-ws-backend.fdrive.se',
  },
};

export const getEnvVars = (env = Constants.manifest?.releaseChannel): { wsurl: string } => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  if (__DEV__) {
    return ENV.dev;
  } else if (env === 'staging') {
    return ENV.staging;
  }
  
  return ENV.prod;
};