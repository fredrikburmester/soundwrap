import React, { useContext, useState } from "react"
import { View, Text, ActivityIndicator, ScrollView } from "react-native"
import { RootStackScreenProps } from "../types"
import SearchBar from 'react-native-platform-searchbar'
import Button from "../components/Button"
import { searchForTracks } from "../api/spotify"
import { AuthContext } from "../context/authContext"
import { AuthContextType } from "../types/auth"
import { ButtonComponent } from "../components/ButtonComponent"
import { Item, Tracks2 } from "../types/spotify"
import { Card } from "../components/Card"
import * as Linking from 'expo-linking'


export default function SearchScreen({ route, navigation }: RootStackScreenProps<'Search'>) {
  const [value, setValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<Tracks2>()
  const { auth } = useContext(AuthContext) as AuthContextType

  const search = () => {
    setLoading(true)
    searchForTracks(auth.token, value).then((res) => {
      setResult(res.tracks)
      setLoading(false)
    })
  }

  return (
    <ScrollView>
      <View style={{ flex: 1, flexDirection: 'row', width: '100%', marginHorizontal: 20, marginVertical: 10 }}>
        <View style={{ flexDirection: 'column' }}>
          <SearchBar
            value={value}
            onChangeText={setValue}
            placeholder="Search"
            theme="dark"
            platform="ios"
            style={{ flex: 1 }}
          >
            {loading ? (
              <ActivityIndicator style={{}} />
            ) : undefined}
          </SearchBar>
        </View>

        <View style={{ marginLeft: 10, width: 90 }} >
          <ButtonComponent size="sm" onPress={search} title="Search" />
        </View>
      </View>

      {result && result.items.map((track: Item) => (
        <View key={track.id} style={{ marginHorizontal: 20, marginVertical: 10 }}>
          <Card title={track.name} description={track.artists[0].name} onPress={() => Linking.openURL(track.href)} />
        </View>
      ))}
    </ScrollView>
  )
}