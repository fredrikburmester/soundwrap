import { useEffect } from 'react'
import { ScrollView } from 'react-native'
import { RootStackScreenProps } from '../types'
import { Card } from '../components/Card'
import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme'

export default function SoundcheckScreen({ navigation }: RootStackScreenProps<'Soundcheck'>) {
  const colorScheme = useColorScheme()

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerBlurEffect: 'dark',
      title: "Let's play!"
    })
  }, [])

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 18, backgroundColor: Colors[colorScheme].background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
      <Card title="Join a room" description="Someone already created a room?" onPress={() => navigation.navigate('Join')} style={{ height: 100, marginBottom: 20 }} />
      <Card title="Create a room" description="You'll be the host!" onPress={() => navigation.navigate('Create')} style={{ marginBottom: 20, backgroundColor: Colors.primaryDark }} />
    </ScrollView>
  )
}


