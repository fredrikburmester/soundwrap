import { StatusBar } from 'expo-status-bar'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, ImageBackground, Platform, ScrollView, StyleSheet, Switch } from 'react-native'

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
import { searchForTracks } from '../api/spotify'
import { ButtonComponent } from './ButtonComponent'
import { RootStackScreenProps } from '../types'

export default function PlayerGuessDetailsComponent({ navigation, route }: RootStackScreenProps<'PlayerGuessDetails'>) {
  const { auth } = useContext(AuthContext) as AuthContextType
  const { user, songs } = route.params

  useEffect(() => {
    navigation.setOptions({
      headerTitle: user.name,
      headerShown: true,
      headerStyle: {
        backgroundColor: Colors.background,
      },
    })
    
  }, [])

  const getUserGuessForSong = (index: number) => {
    const userGuess = user.guesses.find((guess) => guess.currentSongIndex === index)

    if (userGuess) {
      return userGuess.guess
    }

    return ''
  }

  return (
    <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
      <ScrollView>
        {songs.map((song, index) => {
          return (
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 40, color: Colors.primary, marginRight: 20}}>{index + 1 }</Text>
              <ImageBackground key={index} source={{ uri: song.song.album.images[0].url }} imageStyle={{ borderRadius: 10, opacity: 0.3 }} style={{ width: '93%', marginVertical: 10, borderRadius: 10, overflow: 'hidden' }}>
                <View key={index} style={{ marginVertical: 10, backgroundColor: 'transparent', paddingVertical: 10, paddingHorizontal: 20 }}>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', width: '90%' }}>{song.song.name}</Text>
                  <Text style={{ color: 'white', fontSize: 16 }}>{song.song.artists[0].name}</Text>
                  <Text style={{ color: getUserGuessForSong(index) === song.player.id ? Colors.primary : Colors.error, fontSize: 16, marginTop: 20 }}>Guess: {getUserGuessForSong(index)}</Text>
                  <Text style={{ color: 'white', fontSize: 16, marginTop: 5 }}>Correct was: {song.player.id}</Text>
                </View>
              </ImageBackground>
            </View>
          )
        })}
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
