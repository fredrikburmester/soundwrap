import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { AuthContextType, IUser } from '../types/auth'
import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
import { RootStackParamList, RootStackScreenProps } from '../types'
import { getMe } from '../api/spotify'
import { io } from "socket.io-client"
import { Card } from '../components/Card'
import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'
import { TextInputComponent } from '../components/TextInputComponent'
import Toast from 'react-native-toast-message'
import { ButtonComponent } from '../components/ButtonComponent'

export default function JoinRoomScreen({ navigation }: RootStackScreenProps<'Join'>) {
  const colorScheme = useColorScheme()
  const [roomCode, setRoomCode] = useState('')

  const joinRoom = () => {
    navigation.navigate('Room', { roomCode: roomCode, songsPerUser: undefined, timeRange: undefined, createRoom: false })
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Join Room',
      // headerLargeTitle: false,
      // headerLargeStyle: {
      //   backgroundColor: Colors.background,
      // },
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


