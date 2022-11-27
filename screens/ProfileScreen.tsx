import { useContext, useEffect } from 'react'
import { ScrollView, StyleSheet, Image } from 'react-native'
import { AuthContextType } from '../types/auth'
import Button from '../components/Button'
import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
import { Card } from '../components/Card'
import { useHeaderHeight } from '@react-navigation/elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import { RootTabScreenProps } from '../types'
import Colors from '../constants/Colors'
import { RootStackScreenProps } from '../types'


export default function TabTwoScreen({ navigation }: RootStackScreenProps<'Profile'>) {

  const { logout, auth } = useContext(AuthContext) as AuthContextType

  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()

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
      <Card title="Logout" description='Logs you out of the spotify session' onPress={logout} style={{ backgroundColor: Colors.error }} />
    </ScrollView>
  )
}

