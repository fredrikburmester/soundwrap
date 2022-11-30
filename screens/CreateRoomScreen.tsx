import React, { useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native'
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
import { SwitchComponent } from '../components/SwitchComponent'
import { Picker } from '@react-native-picker/picker'
import Toast from 'react-native-toast-message'
import { TextInputComponent } from '../components/TextInputComponent'
import { ButtonComponent } from '../components/ButtonComponent'

const generateRandomString = (length: number) => {
  let text = ''
  const possible = 'ABCDEFGHJKLMNPQRSTWXYZ23456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export default function CreateRoomScreen({ navigation }: RootStackScreenProps<'Create'>) {
  const colorScheme = useColorScheme()
  const [roomCode, setRoomCode] = useState(generateRandomString(4))
  const [songsPerUser, setSongsPerUser] = useState<number>(2)
  const [timeRange, setTimeRange] = useState<string>('medium_term')

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginVertical: 20,
      borderColor: Colors[colorScheme].primary,
      borderStyle: 'solid',
      borderWidth: 2,
    },
  })

  useEffect(() => {
    navigation.setOptions({
      title: 'Create room',
      headerBackTitle: 'Back',
      // headerLargeTitle: false,
      // headerLargeStyle: {
      //   backgroundColor: Colors.background,
      // },
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerBlurEffect: 'dark',
    })
  }, [])

  const showToast = (type: 'success' | 'error' | 'info', text1: string, text2: string) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    })
  }

  const createRoom = () => {
    navigation.navigate('Room', { roomCode: roomCode, songsPerUser: songsPerUser, timeRange: timeRange, createRoom: true })
  }

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 18, backgroundColor: Colors[colorScheme].background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
      <TextInputComponent title="Room code" onChange={(value: string) => {
        if (value.length <= 10) {
          setRoomCode(value)
        } else {
          showToast('error', 'Room code too long', 'Must be less than 10 characters long')
        }
      }} value={roomCode} placeholder="(ex. GFDS)" autoCapitalize='characters' />
      <View style={{ backgroundColor: Colors.backgroundDark, borderRadius: 10, marginBottom: 8 }}>
        <Text style={{ padding: 18, fontSize: 17 }}>Number of songs per user</Text>
        <Picker
          selectedValue={songsPerUser}
          itemStyle={{ color: 'white', fontSize: 18 }}
          style={{ backgroundColor: 'transparent', color: 'white' }}
          onValueChange={(itemValue) =>
            setSongsPerUser(itemValue)
          }>
          <Picker.Item label="One" value={1} />
          <Picker.Item label="Two" value={2} />
          <Picker.Item label="Three" value={3} />
          <Picker.Item label="Four" value={4} />
        </Picker>
      </View>
      <View style={{ backgroundColor: Colors.backgroundDark, borderRadius: 10, marginBottom: 8 }}>
        <Text style={{ padding: 18, fontSize: 17 }}>Time range</Text>
        <Picker
          selectedValue={timeRange}
          itemStyle={{ color: 'white', fontSize: 18 }}
          style={{ backgroundColor: 'transparent', color: 'white' }}
          onValueChange={(itemValue, itemIndex) =>
            setTimeRange(itemValue)
          }>
          <Picker.Item label="One Month" value="short_term" />
          <Picker.Item label="Half a year" value="medium_term" />
          <Picker.Item label="Over a year" value="long_term" />
        </Picker>
      </View>
      {/* <TouchableOpacity
        style={{
          backgroundColor: Colors[colorScheme].primary,
          padding: 10,
          borderRadius: 10,
          width: '100%',
          height: 45,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => createRoom()}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Create room</Text>
      </TouchableOpacity> */}
      <ButtonComponent title="Create room" onPress={createRoom} />
      {/* <SwitchComponent /> */}
    </ScrollView>
  )
}


