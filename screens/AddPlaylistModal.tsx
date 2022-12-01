import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native'

import { Text, View } from '../components/Themed'
import Button from '../components/Button'
import { AuthContextType, IAuth } from '../types/auth'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/authContext'
import { addSongsToPlaylist, createPlaylist, getUserPlaylists } from '../hooks/useSpotify'
import Colors from '../constants/Colors'
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context'

export default function ModalScreen() {
  const { logout, auth } = useContext(AuthContext) as AuthContextType
  const [text, onChangeText] = useState('')
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)

  const create = () => {
    setLoading(true)

    createPlaylist(auth.token, text).then((res) => {
      addSongsToPlaylist(auth.token, res.id, []).then((res) => {
        setLoading(false)
      })
    })
  }


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add your top songs to a playlist</Text>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Playlist name</Text>
      <TextInput
        style={{
          height: 45,
          borderColor: 'gray',
          borderWidth: 1,
          width: '100%',
          marginBottom: 20,
          borderRadius: 10,
          color: 'white',
          padding: 8,
          fontSize: 16,
        }}
        onChangeText={onChangeText}
        value={text}
        placeholder="Playlist name"
      />
      {!loading && <TouchableOpacity onPress={create} style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 10, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', height: 48 }} >
        <Text style={{ fontWeight: 'bold' }}>Create</Text>
      </TouchableOpacity>}
      {loading && <TouchableOpacity style={{ padding: 12, backgroundColor: Colors.primary, opacity: 0.1, borderRadius: 10, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', height: 48 }}>
        <ActivityIndicator size="small" color="white" />
      </TouchableOpacity>}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
  },
})
