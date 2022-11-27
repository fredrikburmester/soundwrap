import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { AuthContextType, IUser } from '../types/auth'
import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
// import { RootTabScreenProps } from '../types'
import { getMe } from '../api/spotify'
import { io } from "socket.io-client"
import { Card } from '../components/Card'
import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'
import { RootStackScreenProps } from '../types'
import { HeaderComponent } from '../components/HeaderComponent'


export default function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const colorScheme = useColorScheme()
  const { auth } = useContext(AuthContext) as AuthContextType
  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()

  const cards = [
    {
      id: 0,
      title: 'Top songs',
      description: 'Check out your top songs',
      onPress: () => navigation.navigate('TopSongs'),
    },
    {
      id: 1,
      title: 'Top artists',
      description: 'Check out your top artists',
      onPress: () => navigation.navigate('TopArtists')
    },
  ]

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
      headerLargeTitle: true,
      headerLargeStyle: {
        backgroundColor: Colors.background,
      },
      headerBlurEffect: 'dark',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: auth.user?.avatar }} style={{ width: 30, height: 30, borderRadius: 100, marginRight: 0 }} />
        </TouchableOpacity>
      ),
    })
  }, [])

  return (
    <ScrollView style={{ paddingHorizontal: 18, backgroundColor: Colors[colorScheme].background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
      <Card title="Soundcheck" style={{ backgroundColor: Colors.primary, shadowColor: Colors.primaryLight, shadowRadius: 5, shadowOpacity: 1, shadowOffset: { width: 0, height: 1 } }} description="Play the game!" onPress={() => navigation.navigate('Soundcheck')} />
      <View style={{ marginVertical: 20, backgroundColor: 'white', opacity: 0.1, height: 1 }}></View>
      {cards.map(card => (
        <Card title={card.title} description={card.description} onPress={card.onPress} key={card.id} style={{ marginBottom: 20, backgroundColor: Colors.secondary, height: 100 }} />
      ))}
    </ScrollView>


  )
}


