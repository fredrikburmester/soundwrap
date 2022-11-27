import React, { useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, TextInput, Switch, Button, Alert, Pressable, TouchableHighlight, RefreshControl } from 'react-native'
import { AuthContextType, IAuth, IUser } from '../types/auth'
import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
import { RootStackParamList, RootStackScreenProps } from '../types'
import { getMe, getTopSongs } from '../api/spotify'
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
import { FlashList } from '@shopify/flash-list'
import { ButtonComponent } from '../components/ButtonComponent'
import { SpotifyPlayer } from '../components/SpotifyPlayer'
import { SongItem } from '../types/spotify'
import {
  ClientEmits,
  ServerEmits
} from '../types/socket'

export default function RoomScreen({ route, navigation }: RootStackScreenProps<'Room'>) {

  const createRoom = route.params.createRoom as boolean

  const colorScheme = useColorScheme()
  const [songsPerUser, setSongsPerUser] = useState(route.params.songsPerUser)
  const [roomCode, setRoomCode] = useState(route.params.roomCode)
  const [timeRange, setTimeRange] = useState(route.params.timeRange)
  const [connected, setConnected] = useState(false)
  const [songs, setSongs] = useState<{ song: SongItem, player: IUser }[]>([])
  const [isHost, setIsHost] = useState<boolean>(false)
  const [players, setPlayers] = useState<IUser[]>([])
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0)
  const [gamePosition, setGamePosition] = useState(0)
  const [guess, setGuess] = useState('')

  const { auth, logout } = useContext(AuthContext) as AuthContextType
  const connectedRef = useRef(connected)
  connectedRef.current = connected

  const hostRef = useRef(isHost)
  hostRef.current = isHost

  const gamePositionRef = useRef(gamePosition)
  gamePositionRef.current = gamePosition

  const guessRef = useRef(guess)
  guessRef.current = guess

  const guessOnPress = (newGuess: string) => {
    setGuess(newGuess)
    socket.emit(ClientEmits.GUESS, { guess: newGuess, roomCode: roomCode, user: auth.user, currentSongIndex: currentSongIndex })
  }

  const leaveRoom = () => {
    socket.emit(ClientEmits.LEAVE_ROOM, { roomCode: roomCode, user: auth.user })
    navigation.navigate('Home')
  }

  const openLeaveRoomAlert = () => {
    Alert.alert('Leave room', 'Are you sure you want to leave the room?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'Leave', onPress: () => leaveRoom() },
    ])
  }

  useEffect(() => {
    if (createRoom) {
      socket.emit('requestToCreateRoom', {
        roomCode: roomCode,
        user: auth.user,
        token: auth.token,
        songsPerUser: songsPerUser,
        timeRange: timeRange
      })
    } else {
      socket.emit(ClientEmits.REQUEST_TO_JOIN_ROOM, {
        roomCode: roomCode,
        user: auth.user,
        token: auth.token
      })
    }

    socket.on(ServerEmits.REQUEST_TO_CREATE_ROOM_ACCEPTED, (room: IRoom) => {
      setConnected(true)
      setIsHost(true)
      setSongs(room.songs)
      setPlayers(room.players)
    })

    socket.on(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED, () => {
      navigation.navigate('Home')
    })

    socket.on(ServerEmits.REQUEST_TO_JOIN_ROOM_ACCEPTED, (room: IRoom) => {
      setIsHost(false)
      setSongs(room.songs)
      setPlayers(room.players)
      setCurrentSongIndex(room.currentSongIndex)
      setGamePosition(room.gamePosition)
      setConnected(true)
    })

    socket.on(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED, () => {
      navigation.navigate('Home')
    })

    socket.on(ServerEmits.ROOM_UPDATED, (room: IRoom) => {
      setPlayers(room.players)
      setGamePosition(room.gamePosition)
      setSongs(room.songs)
      setIsHost(room.host.id === auth.user?.id)

      if (room.currentSongIndex !== currentSongIndex || room.gamePosition !== gamePosition) {
        setGuess('')
      }

      setCurrentSongIndex(room.currentSongIndex)

      console.log("[update]", room)
    })

    navigation.setOptions({
      title: ``,
      headerBackTitleVisible: true,
      headerBackTitle: 'Back',
      headerBackVisible: true,
      headerLargeTitle: false,
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerShadowVisible: false,
      // headerBlurEffect: 'dark',
      // headerTransparent: true,
      headerRight: () => (
        <>
          {gamePositionRef.current === 0 && <Ionicons name="close" size={24} color="red" style={{ marginRight: 20 }} onPress={() => openLeaveRoomAlert()} />}
        </>
      ),
    })
  }, [])

  if (!auth.user) {
    navigation.navigate('Home')
    return null
  }

  const onRefresh = () => {
    socket.connect()
    socket.emit('requestRoomUpdate', { roomCode: roomCode })
  }

  if (gamePosition === 0) {
    return (
      <FlashList
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        data={players}
        renderItem={({ item }) =>
          <View style={{ marginHorizontal: 20 }}>
            <UserCard avatar={item.avatar} name={item.name} />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={() => <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
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
        </View>}
        ListFooterComponent={() =>
          <>
            {isHost && <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
              <ButtonComponent title="Start" onPress={() => socket.emit('startGame', { roomCode })} />
            </View>}
          </>
        }
        keyExtractor={(player) => player.id}
        estimatedItemSize={100}
      />
    )
  } else if (gamePosition === 1) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}>
        <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
          <Text style={{
            fontSize: 12,
            opacity: 0.5,
          }}>{currentSongIndex + 1} of {songs.length}</Text>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.primary,
          }}>Whos song is this?</Text>
          <Text style={{
            fontSize: 12,
            color: 'white',
          }}>Click on the player you think this song belongs to.</Text>
        </View>
        {players.map((item) =>
          <TouchableHighlight style={{ marginHorizontal: 20, marginBottom: 10 }} onPress={() => guessOnPress(item.id)} key={item.id}>
            <View style={guess === item.id ? { borderRadius: 10, shadowColor: Colors.primary, shadowRadius: 7, shadowOpacity: 1, elevation: 24 } : {}}>
              <UserCard avatar={item.avatar} name={item.name} />
            </View>
          </TouchableHighlight>
        )}
        <View style={{ height: 90, marginTop: 0 }}>
          <SpotifyPlayer songUri={songs[currentSongIndex].song.uri} />
        </View>
        {isHost && <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
          <ButtonComponent title="Next song" onPress={() => socket.emit('nextSong', { roomCode })} />
        </View>}
      </ScrollView>
    )
  } else {
    return (
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        data={players.sort((a, b) => b.score - a.score)}
        renderItem={({ item, index }) =>
          <View style={{ marginHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: Colors.primary,
              marginRight: 20,
            }}>{index + 1}</Text>
            <UserCard avatar={item.avatar} name={item.name} style={{ flex: 1 }} text={`Score: ${item.score} of ${currentSongIndex + 1}`} />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={() => <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
          <Text style={{
            fontSize: 12,
            opacity: 0.5,
          }}>{roomCode}</Text>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: Colors.primary,
          }}>Hey you made it to the end!</Text>
        </View>}
        ListFooterComponent={() =>
          <View>
          </View>
        }
        keyExtractor={(player) => player.id}
        estimatedItemSize={100}
      />
    )
  }
}

interface IUserCard {
  avatar: string
  name: string
  style?: any
  text?: string
}

const UserCard = ({ avatar, name, style, text }: IUserCard) => {
  const localStyles = { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundDark, padding: 20, borderRadius: 10, height: 80 }
  const allStyles = [localStyles, style]

  return (
    <View style={allStyles}>
      <Image source={{ uri: avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
      <View style={{ backgroundColor: 'transparent' }}>
        <Text style={{ fontSize: 17, marginLeft: 20 }}>{name}</Text>
        {text && <Text style={{ fontSize: 12, marginLeft: 20 }}>{text}</Text>}
      </View>
    </View>
  )
}

