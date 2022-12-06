import { useContext, useEffect } from 'react'
import { ScrollView, StyleSheet, Image } from 'react-native'
import { AuthContextType } from '../types/auth'
import { AuthContext } from '../context/authContext'
import { Card } from '../components/Card'
import Colors from '../constants/Colors'
import { RootStackScreenProps } from '../types'

import * as WebBrowser from 'expo-web-browser'

export default function TabTwoScreen({ navigation }: RootStackScreenProps<'Profile'>) {

  const { logout } = useContext(AuthContext) as AuthContextType

  const openSpotifyAndLogOut = async () => {
    let result = await WebBrowser.openAuthSessionAsync('https://accounts.spotify.com/logout/', 'soundcheckgame://', {
      showInRecents: false,
      showTitle: false,
    }).then(({ type }: { type: any }) => {
      logout()

      // how do i close the broswer window?
    })
  }

  useEffect(() => {
    navigation.setOptions({
      headerLargeTitle: true,
      headerLargeStyle: {
        backgroundColor: Colors.background,
      },
      headerBlurEffect: 'dark',
    })
  }, [])

  return (
    <ScrollView style={{ flex: 1, paddingTop: 18, paddingHorizontal: 18 }} contentInsetAdjustmentBehavior="automatic">
      <Card iconRight='exit-outline' title="Logout" description='Log out of current Spotify account' onPress={openSpotifyAndLogOut} style={{ backgroundColor: Colors.error }} />
    </ScrollView>
  )
}

