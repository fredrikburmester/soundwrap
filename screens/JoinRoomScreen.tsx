import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { AuthContextType, IUser } from '../types/auth'
import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
import { RootStackParamList, RootStackScreenProps, RootTabScreenProps } from '../types'
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
  const showToast = (type: 'success' | 'error' | 'info', text1: string, text2: string) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    })
  }

  const joinRoom = () => {
    navigation.navigate('Room', { roomCode: roomCode, songsPerUser: undefined, timeRange: undefined, createRoom: false })
  }

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 18, backgroundColor: Colors[colorScheme].background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
      <TextInputComponent
        title="Room code"
        onChange={(value: string) => {
          if (value.length <= 4) {
            setRoomCode(value)
          } else {
            showToast('error', 'Room code too long', 'Room code must be 4 characters long')
          }
        }}
        value={roomCode}
        placeholder="(ex. GFDS)"
        autoCapitalize='characters'
        autoFocus={true} />
      <ButtonComponent title="Join room" onPress={joinRoom} />
    </ScrollView>
  )
}


