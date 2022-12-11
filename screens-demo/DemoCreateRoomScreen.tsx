import React, { useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native'
import { Text, View } from '../components/Themed'
import { RootStackParamList, RootStackScreenProps } from '../types'
import useColorScheme from '../hooks/useColorScheme'
import { Picker } from '@react-native-picker/picker'
import Toast from 'react-native-toast-message'
import { TextInputComponent } from '../components/TextInputComponent'
import { ButtonComponent } from '../components/ButtonComponent'
import { useFocusEffect } from '@react-navigation/native'
import Colors from '../constants/Colors'

const generateRandomString = (length: number) => {
  let text = ''
  const possible = 'ABCDEFGHJKLMNPQRSTWXYZ23456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export default function DemoCreateRoomScreen({ navigation }: RootStackScreenProps<'DemoCreate'>) {
  const colorScheme = useColorScheme()
  const [roomCode, setRoomCode] = useState<string>('')
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
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerBlurEffect: 'dark',
    })
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      setRoomCode(generateRandomString(4))
    }, [])
  )

  const showToast = (type: 'success' | 'error' | 'info', text1: string, text2: string) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    })
  }

  const createRoom = () => {
    navigation.navigate('DemoRoom', { roomCode: roomCode, songsPerUser: songsPerUser, timeRange: timeRange, createRoom: true, nonAuthUser: undefined })
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
          <Picker.Item label="Five" value={5} />
          <Picker.Item label="Six" value={6} />
          <Picker.Item label="Seven" value={7} />
          <Picker.Item label="Eight" value={8} />
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
      <ButtonComponent title="Create room" onPress={createRoom} />
    </ScrollView>
  )
}


