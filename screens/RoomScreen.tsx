import React, { useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, TextInput, Switch, Button } from 'react-native'
import { AuthContextType, IAuth, IUser } from '../types/auth'
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
import { SwitchComponent } from '../components/SwitchComponent'
import { Picker } from '@react-native-picker/picker'
import Toast from 'react-native-toast-message'
import socket from '../utils/socket'
import { Ionicons } from '@expo/vector-icons'
import { IRoom } from '../types/room'

export default function RoomScreen({ route, navigation }: RootStackScreenProps<'Room'>) {

  const colorScheme = useColorScheme()
  const [songsPerUser, setSongsPerUser] = useState(route.params.songsPerUser)
  const [roomCode, setRoomCode] = useState(route.params.roomCode)
  const [connected, setConnected] = useState(false)
  const [songs, setSongs] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const { auth } = useContext(AuthContext) as AuthContextType
  const connectedRef = useRef(connected)
  connectedRef.current = connected

  const showToast = (type: 'success' | 'error' | 'info', text1: string, text2: string, time = 3000) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
      visibilityTime: time,
    })
  }

  setTimeout(() => {
    if (!connectedRef.current) {
      showToast('error', 'Error', 'Please restart the app.', 10000)
      setTimeout(() => {
        // navigation.navigate('Root')
      }, 10000)
    }
  }, 5000)

  useEffect(() => {
    socket.connect()
    console.log('socket', socket)
    socket.emit('joinRoom', { roomCode: roomCode, songsPerUser: songsPerUser, user: auth.user })

    socket.on('roomCreated', () => {
      setConnected(true)
      setIsHost(true)
      showToast('success', 'Room created', 'You are the host of this room')
    })

    socket.on('joinedRoom', (room: IRoom) => {
      console.log(room)
      setConnected(true)
      setIsHost(false)
      showToast('success', 'Joined', 'You joined room ' + room.roomCode)
    })

    navigation.setOptions({
      title: `${roomCode}`,
      headerLargeTitle: false,
      headerBlurEffect: 'prominent',
      headerTransparent: true,
      headerRight: () => (
        <Ionicons name="close" size={24} color="red" style={{ marginRight: 20 }} onPress={() => navigation.navigate('Root')} />
      ),
    })
  }, [])

  if (auth.user) {
    return (
      <ScrollView style={{ flex: 1, paddingHorizontal: 18, backgroundColor: Colors[colorScheme].background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
        {/* <Button title="Connect" onPress={() => socket.emit('hey')} /> */}
        <Text style={{
          fontSize: 12,
          opacity: 0.5,
        }}>Room code</Text>
        <Text style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: Colors.primary,
        }}>{roomCode}</Text>
        <Text style={{ fontStyle: 'italic' }}>Invite others to play! While wating, write something in the chat! <Text style={{ color: Colors.primary }}>Who's gonna win?</Text></Text>
        <UserCard avatar={auth.user.avatar} name={auth.user.name} />
      </ScrollView>
    )
  }
}

interface IUserCard {
  avatar: string
  name: string
}

const UserCard = ({ avatar, name }: IUserCard) => {
  return <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, backgroundColor: Colors.backgroundDark, padding: 10, borderRadius: 10 }}>
    <Image source={{ uri: avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
    <Text style={{ fontSize: 17, marginLeft: 20 }}>{name}</Text>
  </View>
}

