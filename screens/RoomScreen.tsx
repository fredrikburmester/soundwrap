import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, TextInput, Switch, Button, Alert, Pressable, TouchableHighlight, RefreshControl, ActivityIndicator, Animated, Easing } from 'react-native'
import { AuthContextType, IAuth, IUser, NonAuthUser } from '../types/auth'
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
import { LottieAnimation } from '../components/LottieAnimation'

export default function RoomScreen({ route, navigation }: RootStackScreenProps<'Room'>) {

  const createRoom = route.params.createRoom as boolean

  const [loading, setLoading] = useState(false)
  const [songsPerUser, setSongsPerUser] = useState(route.params.songsPerUser)
  const [name, setName] = useState<string>(route.params.name)
  const [roomCode, setRoomCode] = useState(route.params.roomCode)
  const [timeRange, setTimeRange] = useState(route.params.timeRange)
  const [songs, setSongs] = useState<{ song: SongItem, player: IUser }[]>([])
  const [isHost, setIsHost] = useState<boolean>(false)
  const [players, setPlayers] = useState<IUser[]>([])
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(1)
  const [gamePosition, setGamePosition] = useState(0)
  const [guess, setGuess] = useState('')
  const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState<number>(0)
  const [playAnimation, setPlayAnimation] = useState(false)
  const [animationJSON, setAnimationJSON] = useState<any>(null)
  // const [nonAuthUsers, setNonAuthUsers] = useState<NonAuthUser[]>([])

  const { auth, logout } = useContext(AuthContext) as AuthContextType

  const hostRef = useRef(isHost)
  hostRef.current = isHost

  const timeSinceLastUpdateRef = useRef(timeSinceLastUpdate)
  timeSinceLastUpdateRef.current = timeSinceLastUpdate

  const songsRef = useRef(songs)
  songsRef.current = songs

  const gamePositionRef = useRef(gamePosition)
  gamePositionRef.current = gamePosition

  const guessRef = useRef(guess)
  guessRef.current = guess

  const currentSongIndexRef = useRef(currentSongIndex)
  currentSongIndexRef.current = currentSongIndex

  const localsocket = useRef(socket)
  localsocket.current = socket

  const { createAndAddSongsToPlaylist } = useSpotify()

  if (!auth.user) {
    navigation.navigate('Home')
    return null
  }

  const getCorrectGuessAnimationJSON = () => {
    return require('../assets/lottie/correctGuess2.json')
  }

  const getWrongGuessAnimationJSON = () => {
    return require('../assets/lottie/wrongGuess.json')
  }

  const guessOnPress = (newGuess: string) => {
    // Takes the user ID as the guess and sends it to the server
    setGuess(newGuess)
    localsocket.current.emit(ClientEmits.GUESS, { guess: newGuess, roomCode: roomCode, user: auth.user, currentSongIndex: currentSongIndex })
  }

  const leaveRoom = () => {
    localsocket.current.emit(ClientEmits.LEAVE_ROOM, { roomCode: roomCode, user: auth.user })
    navigation.navigate('Home')
  }

  const openLeaveRoomAlert = () => {
    Alert.alert('Leave room', 'Are you sure you want to leave the room?', [
      {
        text: 'Cancel',
        onPress: () => { },
        style: 'cancel',
      },
      { text: 'Leave', onPress: () => leaveRoom() },
    ])
  }

  const saveSongs = () => {
    const newPlaylistName = `Soundcheck - ${roomCode}`
    createAndAddSongsToPlaylist(auth.token, newPlaylistName, songsRef.current.map((song: any) => song.song))
  }

  const openSaveSongsAlert = () => {
    Alert.alert('Save Songs To Playlist', 'Do you want to save the songs in this game to a playlist in your Spotify account?', [
      {
        text: 'Cancel',
        onPress: () => { },
        style: 'cancel',
      },
      { text: 'Save', onPress: saveSongs },
    ])
  }

  const onRefresh = () => {
    if (localsocket.current.disconnected) {
      localsocket.current.connect()
    }
    localsocket.current.emit('requestRoomUpdate', roomCode)
  }

  const openGuessDetailModal = (user: IUser) => {
    navigation.navigate('PlayerGuessDetails', { user: user, songs: songsRef.current })
  }

  const confirmNextSongAlert = () => {
    let count = 0

    for (let player of players) {
      let guess = player.guesses.some(guess => guess.currentSongIndex == currentSongIndex)
      if (guess) {
        count++
      }
    }

    if (count < players.length) {
      Alert.alert(
        'Next song?',
        'Not everyone has guessed. Are you sure you want to move on?',
        [
          {
            text: 'Cancel',
            onPress: () => { },
            style: 'cancel'
          },
          { text: 'OK', onPress: () => nextSong() }
        ],
        { cancelable: false }
      )
    } else {
      nextSong()
    }
  }

  const nextSong = () => {
    setLoading(true)
    localsocket.current.emit('nextSong', { roomCode: roomCode })
  }

  const requestRoomUpdate = () => {
    localsocket.current.emit('requestRoomUpdate', roomCode)
  }

  const setHeader = (pos: number) => {
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
          {pos === 0 && <Ionicons name="close" size={24} color="red" style={{ marginRight: 0 }} onPress={() => openLeaveRoomAlert()} />}
          {pos === 2 && <Ionicons name="add" size={24} color="white" style={{ marginRight: 0 }} onPress={() => openSaveSongsAlert()} />}
        </>
      ),
    })
  }

  // useEffect(() => {
  //   if (route.params?.nonAuthUser) {
  //     // setNonAuthUsers([...nonAuthUsers, route.params.nonAuthUser])
  //     // convert non-auth user to user for merging with players
  //     const newUser: IUser = {
  //       id: generateRandomId(),
  //       name: route.params.nonAuthUser.name,
  //       avatar: 'https://picsum.photos/200',
  //       score: 0,
  //       guesses: []
  //     }
  //     localsocket.current.emit('addNonAuthUser', { roomCode: roomCode, nonAuthUser: newUser, songs: route.params.nonAuthUser.songs })
  //     setPlayers([...players, newUser])
  //   }
  // }, [route.params?.nonAuthUser])

  const handleGuessResult = (room: IRoom) => {
    if (gamePositionRef.current == 0) {
      return
    }

    // Don't play animation on guess
    if (room.gamePosition == 1 && room.currentSongIndex === currentSongIndexRef.current) {
      return
    }

    if (room.currentSongIndex == currentSongIndexRef.current) {
      // Don't play animation when starting game
      if (gamePositionRef.current == 0 && room.gamePosition == 1) {
        return
      }
    }

    if (room.gamePosition == 2 && gamePositionRef.current == 2) {
      return
    }

    const guess = guessRef.current
    const correct = room.songs[currentSongIndexRef.current].player.name

    if (guess === correct) {
      setAnimationJSON(getCorrectGuessAnimationJSON)
      setPlayAnimation(true)
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      )
    } else {
      setAnimationJSON(getWrongGuessAnimationJSON)
      setPlayAnimation(true)
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      )
    }
  }

  useEffect(() => {
    localsocket.current.connect()
    setHeader(0)

    if (createRoom) {
      localsocket.current.emit(ClientEmits.REQUEST_TO_CREATE_ROOM, {
        roomCode: roomCode,
        user: { ...auth.user, name: name },
        token: auth.token,
        songsPerUser: songsPerUser,
        timeRange: timeRange
      })
    } else {
      localsocket.current.emit(ClientEmits.REQUEST_TO_JOIN_ROOM, {
        roomCode: roomCode,
        user: { ...auth.user, name: name },
        token: auth.token
      })
    }

    localsocket.current.on(ServerEmits.REQUEST_TO_CREATE_ROOM_ACCEPTED, (room: IRoom) => {
      setIsHost(true)
      setSongs(room.songs)
      setPlayers(room.players)
    })

    localsocket.current.on(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED, () => {
      navigation.navigate('Home')
    })

    localsocket.current.on(ServerEmits.REQUEST_TO_JOIN_ROOM_ACCEPTED, (room: IRoom) => {
      setIsHost(false)
      setSongs(room.songs)
      setPlayers(room.players)
      setCurrentSongIndex(room.currentSongIndex)
      setGamePosition(room.gamePosition)
    })

    localsocket.current.on(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED, () => {
      navigation.navigate('Home')
    })

    localsocket.current.on(ServerEmits.ROOM_UPDATED, (room: IRoom) => {
      if (room.roomCode !== roomCode) {
        return
      }

      // If less than 1s has passed, ignore the room update
      if (Date.now() - timeSinceLastUpdateRef.current < 200) {
        return
      }

      if (room.gamePosition == 1 && gamePositionRef.current == 0) {
        setSongs(room.songs)
      }

      if (room.gamePosition === 0) {
        setPlayers(room.players)
        try {
          setIsHost(room.host?.id === auth.user?.id)
        } catch (e) {
          setIsHost(false)
        }
      }

      setPlayers(room.players)

      handleGuessResult(room)

      if (room.gamePosition === 2) {
        setTimeout(() => {
          // Clear the guess
          setGuess('')

          // Set current song
          setCurrentSongIndex(0)

          // Update game position
          setGamePosition(2)

          // Set header
          setHeader(2)
        }, 1000)
      } else {
        if (room.currentSongIndex !== currentSongIndexRef.current) {
          setGuess('')
        }

        // Update game position
        setGamePosition(room.gamePosition)

        // Set current song 
        setCurrentSongIndex(room.currentSongIndex)

        // Set header
        setHeader(room.gamePosition)
      }

      // Set the exact unix time this function ran
      setTimeSinceLastUpdate(Date.now())
      setLoading(false)
    })

    return () => {
      localsocket.current.emit(ClientEmits.LEAVE_ROOM, { roomCode: roomCode, user: auth.user })
      localsocket.current.off(roomCode)
    }
  }, [])

  if (gamePosition === 0) {
    return (
      <>
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

            </>
          }
          keyExtractor={(player) => player.id}
          estimatedItemSize={100}
        />
        {isHost && <View style={{ marginHorizontal: 20, marginBottom: 40 }}>
          <ButtonComponent title="Start" onPress={() => socket.emit('startGame', { roomCode })} />
        </View>}
      </>

    )
  } else if (gamePosition === 1) {
    return (
      <>
        <View style={{ height: 90, marginTop: 0 }}>
          {songs && songs.length > currentSongIndex &&
            <SpotifyPlayer songUri={songsRef.current[currentSongIndex].song.uri} />}
        </View>
        <ScrollView contentInsetAdjustmentBehavior="automatic" refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}>
          <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
            <Text style={{
              fontSize: 12,
              opacity: 0.5,
            }}>Question: {currentSongIndex + 1} of {songs.length}</Text>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: Colors.primary,
            }}>Whos song is this?</Text>
            <Text style={{
              fontSize: 12,
              color: 'white',
              marginTop: 2
            }}>Click on the player you think this song belongs to.</Text>
          </View>
          {players.map((item) =>
            <TouchableHighlight style={{ marginHorizontal: 20, marginBottom: 10 }} onPress={() => guessOnPress(item.name)} key={item.id}>
              <View style={guess == item.name ? { borderRadius: 10, shadowColor: Colors.primary, shadowRadius: 7, shadowOpacity: 1, elevation: 24 } : {}}>
                <UserCard avatar={item.avatar} name={item.name} description={item.guesses.some(guess => guess.currentSongIndex == currentSongIndex) ? 'Guessed' : ''} />
              </View>
            </TouchableHighlight>
          )}
        </ScrollView>
        <View style={{ marginBottom: 20 }}>
          {isHost && !loading && <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
            <ButtonComponent title="Next song" onPress={confirmNextSongAlert} />
          </View>}
          {isHost && loading && <View style={{ marginHorizontal: 20, marginVertical: 20, opacity: 0.5 }}>
            <ButtonComponent onPress={nextSong}>
              <ActivityIndicator size="small" color="white" />
            </ButtonComponent>
          </View>}
        </View>
        {playAnimation &&
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            justifyContent: 'flex-end',
          }}>
            <LottieAnimation animationData={animationJSON} onAnimationFinish={() => { setPlayAnimation(false) }} />
          </View>
        }
      </>

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
              <UserCard avatar={item.avatar} name={item.name} style={{ flex: 1 }} description={`Score: ${item.score} of ${songs.length}`} />
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

