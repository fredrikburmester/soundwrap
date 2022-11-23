import React, { useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native'
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
import { SwitchComponent } from '../components/SwitchComponent'
import { Picker } from '@react-native-picker/picker'
import Toast from 'react-native-toast-message'

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
  const [songsPerUser, setSongsPerUser] = useState(1)

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
    const socket = io('ws://localhost:5005', {
      transports: ["websocket"],
    })
    socket.emit('hey')
  }, [])

  const showToast = (type: 'success' | 'error' | 'info', text1: string, text2: string) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    })
  }

  const createRoom = () => {
    if (roomCode.length !== 4) {
      showToast('success', 'Room code too long', 'Room code must be 4 characters long')
      return
    }
    navigation.navigate('Room', { roomCode: roomCode, songsPerUser: songsPerUser })
  }

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 18, backgroundColor: Colors[colorScheme].background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        backgroundColor: Colors.backgroundDark,
        padding: 17,
        marginBottom: 8,
      }}>
        <Text style={{ fontSize: 17 }}>Room code</Text>
        <TextInput
          style={{
            color: 'lightgray',
            fontSize: 17,
            textAlign: 'right',
          }}
          onChangeText={(value: string) => {
            if (value.length <= 4) {
              setRoomCode(value)
            } else {
              showToast('error', 'Room code too long', 'Room code must be 4 characters long')
            }
          }}
          value={roomCode}
          placeholder="(ex. GFDS)"
          autoCapitalize='characters'
        />
      </View>
      <View style={{ backgroundColor: Colors.backgroundDark, borderRadius: 10, marginBottom: 20 }}>
        <Text style={{ padding: 18, fontSize: 17 }}>Number of songs per user</Text>
        <Picker
          selectedValue={songsPerUser}
          itemStyle={{ color: 'white', fontSize: 18 }}
          style={{ backgroundColor: 'transparent' }}
          onValueChange={(itemValue, itemIndex) =>
            setSongsPerUser(itemValue)
          }>
          <Picker.Item label="One" value="1" />
          <Picker.Item label="Two" value="2" />
          <Picker.Item label="Three" value="3" />
          <Picker.Item label="Four" value="4" />
        </Picker>
      </View>
      <TouchableOpacity
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
      </TouchableOpacity>
      {/* <SwitchComponent /> */}
    </ScrollView>
  )
}


