import { useContext, useEffect } from 'react'
import { ScrollView, StyleSheet, Image } from 'react-native'
import { AuthContextType } from '../types/auth'
import { AuthContext } from '../context/authContext'
import { Card } from '../components/Card'
import Colors from '../constants/Colors'
import { RootStackScreenProps } from '../types'

import * as WebBrowser from 'expo-web-browser'

export default function DemoTabTwoScreen({ navigation }: RootStackScreenProps<'DemoProfile'>) {

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
      <Card iconRight='refresh-outline' title="Refresh account" description='If something went wrong' onPress={logout} style={{ backgroundColor: Colors.primaryDark, marginBottom: 20 }} />
      <Card iconRight='exit-outline' title="Log out and change account" description={"If you want to switch account,\nyou will need to log in again\n"} onPress={openSpotifyAndLogOut} style={{ backgroundColor: Colors.error, marginBottom: 20 }} />
    </ScrollView>
  )
}

