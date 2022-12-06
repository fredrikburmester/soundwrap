import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'

import { Text, View } from '../components/Themed'
import { RootStackScreenProps } from '../types'
import { AuthContextType, IAuth } from '../types/auth'
import { AuthContext } from '../context/authContext'
import React, { useContext, useEffect, useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session'
import Colors from '../constants/Colors'
import * as Haptics from 'expo-haptics'
import { GradientText } from '../components/GradientText'

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
    clientId: 'bad02ecfaf4046638a1daa7f60cbe42b',
    scopes: ['user-read-email', 'playlist-modify-public', 'user-top-read', 'playlist-read-private', 'streaming', 'user-modify-playback-state', 'user-read-private', 'user-read-playback-state', 'user-read-playback-position', 'user-modify-playback-state', 'user-read-currently-playing'],
    usePKCE: false,
    redirectUri: makeRedirectUri({
      scheme: 'soundcheckgame',
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
    <SafeAreaView style={{ flex: 1, marginBottom: 48, margin: 17 }}>
      <Text style={{
        fontSize: 40,
        fontWeight: 'bold',
        marginTop: 'auto',
        marginBottom: -10
      }}>
        Welcome to
      </Text>
      <GradientText text='Soundcheck' style={{ marginBottom: 30 }} />
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        {'Check out your top songs and artists from Spotify, create mix-tapes and playlists!\n\nPlay and win over your friends by guessing their favourite songs!'}
      </Text>
      <Text style={[styles.description3]}>This app is not affiliated with Spotify AB or any of it's partners in any way</Text>
      {!loading && <Pressable
        style={({ pressed }) =>
          [{
            padding: 12,
            backgroundColor: Colors.primary,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: 48
          }, pressed ? { opacity: 0.5 } : {}]}
        onPress={requestTokenAndLogin}
      >
        <Text style={{ fontWeight: 'bold' }}>Login with Spotify</Text>
      </Pressable>}
      {loading && <View style={{ padding: 12, backgroundColor: Colors.primary, opacity: 0.5, borderRadius: 10, width: '100%', justifyContent: 'center', alignItems: 'center', height: 48 }}>
        <ActivityIndicator size="small" color="white" />
      </View>}

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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  description: {
    fontSize: 14,
    textAlign: 'start',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  description2: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    color: 'gray',
    marginTop: 'auto',
    opacity: 0.5
  },
  description3: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    color: 'gray',
    opacity: 0.4,
    marginTop: 'auto'
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
