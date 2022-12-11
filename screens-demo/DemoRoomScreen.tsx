// @ts-nocheck
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, TextInput, Switch, Button, Alert, Pressable, TouchableHighlight, RefreshControl, ActivityIndicator } from 'react-native'
import { AuthContextType, IAuth, IGuess, IUser, NonAuthUser } from '../types/auth'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
import { RootStackParamList, RootStackScreenProps } from '../types'
import Colors from '../constants/Colors'
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
import { useSpotify } from '../hooks/useSpotify'
import * as Haptics from 'expo-haptics'
import { useFocusEffect } from '@react-navigation/native'
import { Toast } from 'react-native-toast-message/lib/src/Toast'

export default function DemoRoomScreen({ route, navigation }: RootStackScreenProps<'DemoRoom'>) {

  const createRoom = route.params.createRoom as boolean

  const { auth, logout } = useContext(AuthContext) as AuthContextType

  const _songs = [
    {
      song: {
        "album": {
          "href": "https://api.spotify.com/v1/albums/0NxA1D1taWpPdIc6uIlAi9",
          "id": "0NxA1D1taWpPdIc6uIlAi9",
          "images": [
            {
              "height": 640,
              "url": "https://i.scdn.co/image/ab67616d0000b27320fc6951e4d293707de2434c",
              "width": 640
            },
            {
              "height": 300,
              "url": "https://i.scdn.co/image/ab67616d00001e0220fc6951e4d293707de2434c",
              "width": 300
            },
            {
              "height": 64,
              "url": "https://i.scdn.co/image/ab67616d0000485120fc6951e4d293707de2434c",
              "width": 64
            }
          ],
        },
        "artists": [
          {
            "external_urls": {
              "spotify": "https://open.spotify.com/artist/47zz7sob9NUcODy0BTDvKx"
            },
            "href": "https://api.spotify.com/v1/artists/47zz7sob9NUcODy0BTDvKx",
            "id": "47zz7sob9NUcODy0BTDvKx",
            "name": "Sade",
            "type": "artist",
            "uri": "spotify:artist:47zz7sob9NUcODy0BTDvKx"
          }
        ],
        "href": "https://api.spotify.com/v1/tracks/7H3ojI1BsVy0dEJENqMt1k",
        "id": "7H3ojI1BsVy0dEJENqMt1k",
        "name": "By Your Side",
        "preview_url": "https://p.scdn.co/mp3-preview/e769ba95d7c23ef957df51982c8aaa6403b19069?cid=774b29d4f13844c495f206cafdad9c86",
        "type": "track",
        "uri": "spotify:track:7H3ojI1BsVy0dEJENqMt1k"
      },
      player: auth.user
    }
  ]

  const [loading, setLoading] = useState(false)
  const [songsPerUser, setSongsPerUser] = useState(route.params.songsPerUser)
  const [roomCode, setRoomCode] = useState(route.params.roomCode)
  const [timeRange, setTimeRange] = useState(route.params.timeRange)
  const [connected, setConnected] = useState(false)
  const [songs, setSongs] = useState<{ song: SongItem, player: IUser }[]>([])
  const [isHost, setIsHost] = useState<boolean>(false)
  const [players, setPlayers] = useState<IUser[]>([])
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(1)
  const [gamePosition, setGamePosition] = useState(0)
  const [guess, setGuess] = useState('')
  // const [nonAuthUsers, setNonAuthUsers] = useState<NonAuthUser[]>([])

  const res = {
    "items": [
      {
        "album": {
          "href": "https://api.spotify.com/v1/albums/0NxA1D1taWpPdIc6uIlAi9",
          "id": "0NxA1D1taWpPdIc6uIlAi9",
          "images": [
            {
              "height": 640,
              "url": "https://i.scdn.co/image/ab67616d0000b27320fc6951e4d293707de2434c",
              "width": 640
            },
            {
              "height": 300,
              "url": "https://i.scdn.co/image/ab67616d00001e0220fc6951e4d293707de2434c",
              "width": 300
            },
            {
              "height": 64,
              "url": "https://i.scdn.co/image/ab67616d0000485120fc6951e4d293707de2434c",
              "width": 64
            }
          ],
        },
        "artists": [
          {
            "external_urls": {
              "spotify": "https://open.spotify.com/artist/47zz7sob9NUcODy0BTDvKx"
            },
            "href": "https://api.spotify.com/v1/artists/47zz7sob9NUcODy0BTDvKx",
            "id": "47zz7sob9NUcODy0BTDvKx",
            "name": "Sade",
            "type": "artist",
            "uri": "spotify:artist:47zz7sob9NUcODy0BTDvKx"
          }
        ],
        "href": "https://api.spotify.com/v1/tracks/7H3ojI1BsVy0dEJENqMt1k",
        "id": "7H3ojI1BsVy0dEJENqMt1k",
        "name": "By Your Side",
        "preview_url": "https://p.scdn.co/mp3-preview/e769ba95d7c23ef957df51982c8aaa6403b19069?cid=774b29d4f13844c495f206cafdad9c86",
        "type": "track",
        "uri": "spotify:track:7H3ojI1BsVy0dEJENqMt1k"
      }
    ],
    "href": "https://api.spotify.com/v1/me/top/tracks?limit=1&offset=0&time_range=short_term",
  }

  const connectedRef = useRef(connected)
  connectedRef.current = connected

  const hostRef = useRef(isHost)
  hostRef.current = isHost

  const gamePositionRef = useRef(gamePosition)
  gamePositionRef.current = gamePosition

  const guessRef = useRef(guess)
  guessRef.current = guess

  const currentSongIndexRef = useRef(currentSongIndex)
  currentSongIndexRef.current = currentSongIndex

  const { createAndAddSongsToPlaylist } = useSpotify()

  if (!auth.user) {
    navigation.navigate('Home')
    return null
  }

  const guessOnPress = (newGuess: string) => {
    // Takes the user ID as the guess and sends it to the server
    setGuess(newGuess)
    socket.emit(ClientEmits.GUESS, { guess: newGuess, roomCode: roomCode, user: auth.user, currentSongIndex: currentSongIndex })
  }

  const leaveRoom = () => {
    navigation.navigate('DemoHome')
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

  const openSaveSongsAlert = () => {
    Alert.alert('Save Songs To Playlist', 'Do you want to save the songs in this game to a playlist in your Spotify account?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'Save', onPress: saveSongs },
    ])
  }

  const saveSongs = () => {
  }

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  useEffect(() => {
    if (route.params?.nonAuthUser) {
      // setNonAuthUsers([...nonAuthUsers, route.params.nonAuthUser])

      // convert non-auth user to user for merging with players
      const newUser: IUser = {
        id: generateRandomId(),
        name: route.params.nonAuthUser.name,
        avatar: 'https://picsum.photos/200',
        score: 0,
        guesses: []
      }

      socket.emit('addNonAuthUser', { roomCode: roomCode, nonAuthUser: newUser, songs: route.params.nonAuthUser.songs })

      setPlayers([...players, newUser])
    }
  }, [route.params?.nonAuthUser])

  useEffect(() => {
    if (createRoom) {
      setConnected(true)
      setIsHost(true)
      setSongs(_songs)
      setPlayers([{
        id: 'demo',
        name: 'Demo',
        avatar: 'https://picsum.photos/200',
        score: 0,
        guesses: []
      }])
    } else {
      setIsHost(false)
      setSongs(_songs)
      setPlayers([{
        id: 'demo',
        name: 'Demo',
        avatar: 'https://picsum.photos/200',
        score: 0,
        guesses: []
      }])
      setCurrentSongIndex(0)
      setGamePosition(0)
      setConnected(true)
      Toast.show({
        type: 'error',
        text1: 'No room found',
        text2: 'Try another room code!',
      })
    }
  }, [])

  const nextSong = () => {
    setGuess('')
    if (gamePosition === 0) {
      setGamePosition(1)
      setCurrentSongIndex(0)
      console.log(songs, currentSongIndex)
    } else if (gamePosition === 1) {
      setCurrentSongIndex(currentSongIndex + 1)
    }

    if (currentSongIndex === songs.length - 1) {
      setGamePosition(2)
    }
  }

  useEffect(() => {
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
      headerRight: () => (
        <>
          {gamePositionRef.current === 0 && <Ionicons name="close" size={24} color="red" style={{ marginRight: 0 }} onPress={() => openLeaveRoomAlert()} />}
          {gamePositionRef.current === 2 && <Ionicons name="add" size={24} color="white" style={{ marginRight: 0 }} onPress={() => openSaveSongsAlert()} />}
        </>
      ),
    })
  }, [gamePositionRef.current])

  const openGuessDetailModal = (user: IUser) => {
    navigation.navigate('PlayerGuessDetails', { user: user, songs: songs })
  }

  if (gamePosition === 0) {
    return (
      <FlashList
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => { }} />}
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
          <Text style={{ fontStyle: 'italic' }}>
            {isHost && "Other users can join the game by entering the room code. Start the game when everyone's ready! "}
            {!isHost && 'Waiting for host to start the game... Invite others by sharing the room code with them! '}
            <Text style={{ color: Colors.primary }}>Who's gonna win?</Text></Text>
          {/* <View style={{ marginTop: 10, opacity: 1 }}>
            <ButtonComponent size='sm' title="Add non-spotify player" onPress={addNonAuthPlayer} style={{ width: 200, backgroundColor: Colors.backgroundDark }} />
          </View> */}
        </View>}
        ListFooterComponent={() =>
          <>
            {isHost && <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
              <ButtonComponent title="Start" onPress={() => nextSong()} />
            </View>}
          </>
        }
        keyExtractor={(player) => player.id}
        estimatedItemSize={100}
      />
    )
  } else if (gamePosition === 1) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" refreshControl={<RefreshControl refreshing={false} onRefresh={() => { }} />}>
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
            <View style={guess == item.id ? { borderRadius: 10, shadowColor: Colors.primary, shadowRadius: 7, shadowOpacity: 1, elevation: 24 } : {}}>
              <UserCard avatar={item.avatar} name={item.name} description={item.guesses.some(guess => guess.currentSongIndex == currentSongIndex) ? 'Guessed' : ''} />
            </View>
          </TouchableHighlight>
        )}
        <View style={{ height: 90, marginTop: 0 }}>
          {songs && songs.length > currentSongIndex &&
            <SpotifyPlayer songUri={songs[currentSongIndex].song.uri} />}
        </View>
        {isHost && !loading && <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
          <ButtonComponent title="Next song" onPress={nextSong} />
        </View>}
        {isHost && loading && <View style={{ marginHorizontal: 20, marginVertical: 20, opacity: 0.5 }}>
          <ButtonComponent onPress={nextSong}>
            <ActivityIndicator size="small" color="white" />
          </ButtonComponent>
        </View>}
      </ScrollView>
    )
  } else {
    return (
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        data={players.sort((a, b) => b.score - a.score)}
        renderItem={({ item, index }) =>
          <View style={{ marginHorizontal: 20, flexDirection: 'row', alignItems: 'center' }} key={index}>
            <Text style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: Colors.primary,
              marginRight: 20,
            }}>{index + 1}</Text>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openGuessDetailModal(item)}>
              <UserCard avatar={item.avatar} name={item.name} style={{ flex: 1 }} description={`Score: ${item.score} of ${currentSongIndex + 1}`} />
            </TouchableOpacity>
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
  description?: string
}

const UserCard = ({ avatar, name, style, description }: IUserCard) => {
  const localStyles = { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundDark, padding: 20, borderRadius: 10, height: 80 }
  const allStyles = [localStyles, style]

  return (
    <View style={allStyles}>
      <Image source={{ uri: avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
      <View style={{ backgroundColor: 'transparent' }}>
        <Text style={{ fontSize: 17, marginLeft: 20 }}>{name}</Text>
        {description && <Text style={{ fontSize: 12, marginLeft: 20, opacity: 0.6, color: Colors.primary }}>{description}</Text>}
      </View>
    </View>
  )
}

