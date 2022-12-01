import { StatusBar } from 'expo-status-bar'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Switch } from 'react-native'

import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Colors from '../constants/Colors'
import { TextInputComponent } from './TextInputComponent'
import { AuthContext } from '../context/authContext'
import { AuthContextType, NonAuthUser } from '../types/auth'
import { Item, Tracks2 } from '../types/spotify'
import { Card } from './Card'
import SearchBar from 'react-native-platform-searchbar'
import { searchForTracks } from '../hooks/useSpotify'
import { ButtonComponent } from './ButtonComponent'
import { RootStackScreenProps } from '../types'

export default function AddNonAuthPlayerModal({ navigation }: RootStackScreenProps<'AddNonAuthPlayerModal'>) {
  const [value, setValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<Tracks2>()
  const [songs, setSongs] = useState<Item[]>([])
  const [name, setName] = useState<string>('')
  const { auth } = useContext(AuthContext) as AuthContextType

  const timeout = useRef<any>()

  useEffect(() => {
    clearTimeout(timeout.current)

    timeout.current = setTimeout(() => {
      search()
    }, 500)
  }, [value])

  const search = () => {
    console.log('searching')
    setLoading(true)
    searchForTracks(auth.token, value, 3).then((res) => {
      setResult(res.tracks)
      setLoading(false)
    })
  }

  const addSongToUser = (item: Item) => {
    setSongs([...songs, item])
  }


  const addUser = async () => {
    // @ts-ignore
    navigation.navigate({
      name: 'Room',
      params: {
        nonAuthUser: { name, songs } as NonAuthUser,
      },
      merge: true,
    })
  }

  return (
    <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
      <TextInputComponent placeholder="John Doe" title="Player name" value={name} onChange={(value: string) => setName(value)} />
      <SearchBar
        value={value}
        onChangeText={setValue}
        placeholder="Search"
        theme="light"
        platform="ios"
        style={{ marginVertical: 10 }}
      >
        {loading ? (
          <ActivityIndicator style={{ marginRight: 10 }} />
        ) : undefined}
      </SearchBar>
      <ScrollView>
        {songs.map((track: Item) =>
          result?.items.includes(track) ? (
            <></>
          ) : (<View key={track.id} style={{ marginVertical: 0 }}>
            <Card title={track.name} description={track.artists[0].name} onPress={() => { }} icon='checkmark' style={{ height: 60, backgroundColor: Colors.dark }} />
          </View>)
        )}
        {result && result.items.map((track: Item, index: number) => (
          <View key={track.id} style={{ marginVertical: 0 }}>
            <Card title={track.name} description={track.artists[0].name} onPress={() => addSongToUser(track)} icon={songs.includes(track) ? 'checkmark' : 'add'} style={{ height: 60, backgroundColor: Colors.dark }} />
          </View>
        ))}
        <ButtonComponent size="lg" onPress={addUser} title="Add" style={{ marginTop: 10 }} />
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})
