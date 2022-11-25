import { ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'

import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import { RootStackScreenProps, RootTabScreenProps } from '../types'
import Button from '../components/Button'
import { AuthContextType, IAuth } from '../types/auth'
import { AuthContext } from '../context/authContext'
import React, { useContext, useEffect, useState } from 'react'
import { getMe } from '../api/spotify'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session'
import Colors from '../constants/Colors'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'

WebBrowser.maybeCompleteAuthSession()

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
}

export default function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const { login } = useContext(AuthContext) as AuthContextType
  const [loading, setLoading] = useState(false)

  const requestTokenAndLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLoading(true)
    promptAsync()
  }

  const [request, response, promptAsync] = useAuthRequest({
    responseType: ResponseType.Token,
    clientId: 'b628fccd4e284c469c95f515f14d079e',
    scopes: ['user-read-email', 'playlist-modify-public', 'user-top-read', 'playlist-read-private', 'streaming', 'user-modify-playback-state', 'user-read-private', 'user-read-playback-state', 'user-read-playback-position', 'user-modify-playback-state', 'user-read-currently-playing'],
    // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
    // this must be set to false
    usePKCE: false,
    redirectUri: makeRedirectUri({
      scheme: 'myapp',
    }),
  },
    discovery
  )

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params
      login(access_token)
      setLoading(false)
    } else {
      console.log('[error] could not log in')
      setLoading(false)
    }
  }, [response])

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', margin: 18, marginBottom: 48 }}>
      <Text style={styles.title}>Soundcheck</Text>
      <Text style={styles.description}>Soundcheck is a game to play with your friends! Create a room, invite your friends, and guess each others favorite songs. Listen to music, chat and have fun together!
        After the game you can create a mix-tape of all your favorite songs, perfect for a party!</Text>
      <Text style={styles.description2}>Login with Spotify to get started!</Text>
      {/* <Button size='lg' title="AUTHENTICATE" onPress={() => requestTokenAndLogin()} disabled={loading} /> */}
      {!loading && <TouchableOpacity style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 10, marginHorizontal: 18, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', height: 48 }} onPress={requestTokenAndLogin}>
        <Text style={{ fontWeight: 'bold' }}>Login</Text>
      </TouchableOpacity>}
      {loading && <TouchableOpacity style={{ padding: 12, backgroundColor: Colors.primary, opacity: 0.1, borderRadius: 10, marginHorizontal: 18, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', height: 48 }} onPress={requestTokenAndLogin}>
        <ActivityIndicator size="small" color="white" />
      </TouchableOpacity>}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 'auto'
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  description2: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    color: '#1DB753',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  button: {
    margin: 20,
    backgroundColor: '#841584',
  },
})
