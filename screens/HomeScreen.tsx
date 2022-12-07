import React, { useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native'
import { AuthContextType, IUser } from '../types/auth'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
import { Card } from '../components/Card'
import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme'
import { RootStackScreenProps } from '../types'
import { Accelerometer } from 'expo-sensors'

export default function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const colorScheme = useColorScheme()
  const { auth } = useContext(AuthContext) as AuthContextType


  const cards = [
    {
      id: 0,
      title: 'Top songs',
      description: 'Check out your top songs',
      onPress: () => navigation.navigate('TopSongs'),
      icon: 'musical-notes-outline'
    },
    {
      id: 1,
      title: 'Top artists',
      description: 'Check out your top artists',
      onPress: () => navigation.navigate('TopArtists'),
      icon: 'person-outline'
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
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerShadowVisible: false,
      headerBlurEffect: 'dark',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: auth.user?.avatar }} style={{ width: 30, height: 30, borderRadius: 100, marginRight: 0 }} />
        </TouchableOpacity>
      ),
    })
  }, [])

  // Accelerometer

  const rotateYAnim = useRef(new Animated.Value(0)).current
  const rotateXAnim = useRef(new Animated.Value(0)).current
  const rotateZAnim = useRef(new Animated.Value(0)).current
  const [subscription, setSubscription] = useState(null)
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: -0.75,
    z: -0.75,
  })

  useEffect(() => {
    Animated.timing(rotateXAnim, {
      toValue: x,
      duration: 100,
      useNativeDriver: false,

    }).start()
  }, [rotateXAnim, x])

  useEffect(() => {
    Animated.timing(rotateYAnim, {
      toValue: y,
      duration: 100,
      useNativeDriver: false,

    }).start()
  }, [rotateYAnim, y])

  useEffect(() => {
    Animated.timing(rotateZAnim, {
      toValue: z,
      duration: 100,
      useNativeDriver: false,

    }).start()
  }, [rotateZAnim, z])

  const _unsubscribe = () => {
    subscription && subscription.remove()
    setSubscription(null)
  }

  const _subscribe = () => {
    Accelerometer.setUpdateInterval(50)
    Accelerometer.addListener(accelerometerData => {
      let { x, y, z } = accelerometerData
      y += 0
      z += 0
      setData({ x, y, z })
    })
  }

  useEffect(() => {
    _subscribe()
    return () => _unsubscribe()
  }, [])

  return (
    <ScrollView style={{ paddingHorizontal: 18, backgroundColor: Colors.background, paddingTop: 18 }} contentInsetAdjustmentBehavior="automatic">
      <Animated.View
        style={{
          transform: [
            {
              perspective: 400,
            },
            {
              rotateX: rotateYAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '20deg'],
              }),
            },
            {
              rotateY: rotateXAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '10deg'],
              }),
            },
            {
              rotateZ: rotateXAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-0deg'],
              }),
            },
            // {
            //   skewY: rotateYAnim.interpolate({
            //     inputRange: [-1, 1],
            //     outputRange: ['-100deg', '100deg'],
            //   }),
            // },
            // {
            //   translateY: rotateYAnim.interpolate({
            //     inputRange: [-1, 1],
            //     outputRange: [-5, 5],
            //   }),
            // },
            // {
            //   translateX: rotateXAnim.interpolate({
            //     inputRange: [-1, 1],
            //     outputRange: [5, -5],
            //   }),
            // },

            // {
            //   rotateZ: rotateZAnim.interpolate({
            //     inputRange: [-1, 1],
            //     outputRange: ['-100deg', '100deg'],
            //   }),
            // },
          ],
        }}
      >
        <Card title="Soundcheck" style={{ backgroundColor: Colors.primary, shadowColor: Colors.primaryLight, shadowRadius: 5, shadowOpacity: 1, shadowOffset: { width: 0, height: 1 } }} description="Play the game!" onPress={() => navigation.navigate('Soundcheck')} />
      </Animated.View>
      <View style={{ marginVertical: 20, backgroundColor: 'white', opacity: 0.1, height: 1 }}></View>
      {cards.map(card => (
        <Card iconRight={card.icon} title={card.title} description={card.description} onPress={card.onPress} key={card.id} style={{ marginBottom: 20, backgroundColor: Colors.primaryDark, height: 70 }} />
      ))}
    </ScrollView>
  )
}


