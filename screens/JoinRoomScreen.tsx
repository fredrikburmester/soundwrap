import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { RootStackParamList, RootStackScreenProps } from '../types'
import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme'
import { TextInputComponent } from '../components/TextInputComponent'
import { ButtonComponent } from '../components/ButtonComponent'

export default function JoinRoomScreen({ navigation }: RootStackScreenProps<'Join'>) {
  const colorScheme = useColorScheme()
  const [roomCode, setRoomCode] = useState('')

  const joinRoom = () => {
    navigation.navigate('Room', { roomCode: roomCode, songsPerUser: undefined, timeRange: undefined, createRoom: false, nonAuthUser: undefined })
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Join Room',
      headerBackTitle: 'Back',
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerBlurEffect: 'dark',
    })
  }, [])

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 18, backgroundColor: Colors[colorScheme].background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
      <TextInputComponent
        title="Room code"
        onChange={(value: string) => {
          setRoomCode(value)
        }}
        value={roomCode}
        placeholder="(ex. GFDS)"
        autoCapitalize='characters'
        autoFocus={false} />
      <ButtonComponent title="Join room" onPress={joinRoom} />
    </ScrollView>
  )
}


