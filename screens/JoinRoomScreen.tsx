import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { RootStackParamList, RootStackScreenProps } from '../types'
import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme'
import { TextInputComponent } from '../components/TextInputComponent'
import { ButtonComponent } from '../components/ButtonComponent'
import { Text, View } from '../components/Themed'

export default function JoinRoomScreen({ navigation }: RootStackScreenProps<'Join'>) {
  const colorScheme = useColorScheme()
  const [roomCode, setRoomCode] = useState('')
  const [name, setName] = useState<string>('')

  const joinRoom = () => {
    navigation.navigate('Room', { roomCode: roomCode, songsPerUser: undefined, timeRange: undefined, createRoom: false, nonAuthUser: undefined, name: name })
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Join Room',
      headerBackTitle: 'Back',
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerRight: () => (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          onPress={joinRoom}
        >
          <Text style={{ fontSize: 17, marginRight: 10, color: '#007AFF' }}>Join</Text>
        </TouchableOpacity>
      ),
      headerBlurEffect: 'dark',
    })
  }, [joinRoom])

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 18, backgroundColor: Colors[colorScheme].background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
      <TextInputComponent
        title="Your name"
        onChange={(value: string) => {
          setName(value)
        }}
        value={name}
        placeholder="White Rabbit"
        autoFocus={false} />
      <TextInputComponent
        title="Room code"
        onChange={(value: string) => {
          setRoomCode(value)
        }}
        value={roomCode.toUpperCase()}
        placeholder="(ex. GFDS)"
        autoCapitalize='characters'
        autoFocus={false} />
      {/* <ButtonComponent title="Join room" onPress={joinRoom} style={{ marginTop: 10 }} /> */}
    </ScrollView>
  )
}


