import { useContext } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { AuthContextType } from '../types/auth'
import Button from '../components/Button'
import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
import { Card } from '../components/Card'
import { useHeaderHeight } from '@react-navigation/elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


export default function TabTwoScreen() {

  const { logout } = useContext(AuthContext) as AuthContextType

  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()

  return (
    <ScrollView style={{ flex: 1, paddingTop: 18, paddingHorizontal: 18 }} contentInsetAdjustmentBehavior="automatic">
      <Card title="Logout" color="red" description='Logs you out of the spotify session' onPress={logout} />
    </ScrollView>
  )
}

