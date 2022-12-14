import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import { ColorSchemeName, Pressable, TouchableWithoutFeedback, Vibration, Image, TouchableOpacity, TouchableHighlight, AppState } from 'react-native'
import { AuthContextType, IAuth } from '../types/auth'

import { AuthContext } from '../context/authContext'
import LoginScreen from '../screens/LoginScreen'
import NotFoundScreen from '../screens/NotFoundScreen'
import TopArtistsScreen from '../screens/TopArtistsScreen'
import TopSongsScreen from '../screens/TopSongsScreen'
import { RootStackParamList } from '../types'
import LinkingConfiguration from './LinkingConfiguration'
import SoundcheckScreen from '../screens/SoundcheckScreen'
import CreateRoomScreen from '../screens/CreateRoomScreen'
import JoinRoomScreen from '../screens/JoinRoomScreen'
import RoomScreen from '../screens/RoomScreen'
import HomeScreen from '../screens/HomeScreen'
import ProfileScreen from '../screens/ProfileScreen'
import SearchScreen from '../screens/SeachScreen'
import AddNonAuthPlayerModal from '../components/AddNonAuthPlayerModal'
import PlayerGuessDetailsComponent from '../components/PlayerGuessDetailsComponent'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import socket from '../utils/socket'

type Props = {
  colorScheme: ColorSchemeName
}

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#1F1F1E',
  },
}

const Navigation: React.FC<Props> = ({ colorScheme }: Props) => {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={MyTheme}>
      <RootNavigator />
    </NavigationContainer>
  )
}

export default Navigation

const Stack = createNativeStackNavigator<RootStackParamList>()

function RootNavigator() {
  const { auth, logout } = useContext(AuthContext) as AuthContextType
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)
  const { getTokenStatus } = useSpotifyAuth()

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        const status = await getTokenStatus(auth.token)
        if (status === 401) {
          logout()
        } else {
        }
      }

      appState.current = nextAppState
      setAppStateVisible(appState.current)
    })

    socket.on('logout', () => {
      console.log('logout')
      logout()
    })

    return () => {
      subscription.remove()
    }
  }, [])

  if (!auth.authenticated) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    )
  } else {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
        <Stack.Screen name="TopSongs" component={TopSongsScreen} />
        <Stack.Screen name="TopArtists" component={TopArtistsScreen} options={{ title: 'Top Artists', headerLargeTitle: true, headerBlurEffect: 'dark', headerTransparent: true, headerLargeTitleShadowVisible: true }} />
        <Stack.Screen name="Soundcheck" component={SoundcheckScreen} />
        <Stack.Screen name="Create" component={CreateRoomScreen} />
        <Stack.Screen name="Join" component={JoinRoomScreen} />
        <Stack.Screen name="Room" component={RoomScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="AddNonAuthPlayerModal" options={{ title: 'Add a player' }} component={AddNonAuthPlayerModal} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="PlayerGuessDetails" component={PlayerGuessDetailsComponent} />
        </Stack.Group>
      </Stack.Navigator>
    )
  }
}