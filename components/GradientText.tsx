import MaskedView from "@react-native-masked-view/masked-view"
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"
import Colors from "../constants/Colors"
import { Text, View } from '../components/Themed'

interface Props {
  props?: any
  text: string

}

export const GradientText: React.FC<Props> = ({ props, text }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      useNativeDriver: true,
      toValue: 1,
      duration: 40000,
      easing: Easing.linear
    }).start()
  }, [fadeAnim])

  let ga = []
  for (let i = 0; i < 20; i++) {
    ga.push(Colors.primaryDark)
    ga.push(Colors.primaryDark)
    ga.push(Colors.primaryDark)
    ga.push(Colors.primaryLight)
  }

  return (

    <MaskedView
      style={{ flex: 1, flexDirection: 'row' }}
      maskElement={
        <View
          style={{
            // Transparent background because mask is based off alpha channel.
            backgroundColor: 'transparent',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 40,
              width: '100%',
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            {'Welcome to Soundcheck.\n'}
          </Text>
          <Text
            style={{
              fontSize: 20,
              color: 'black',
              width: '100%',
              fontWeight: 'bold',
            }}
          >
            {'Play games with your friends, check out your top songs and artists from Spotify, create mix-tapes and playlists!\n\n'}
          </Text>
        </View>
      }
    >
      <Animated.View style={{
        transform: [
          {
            translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-9000, 0]
            })

          }
        ],
        flex: 1,
        width: 10000,
        backgroundColor: 'blue'
      }}>
        <LinearGradient
          colors={ga}
          style={{ flex: 1, width: 10000 }}
          start={{ x: 0.0, y: 1.0 }}
          end={{ x: 1.0, y: 1.0 }}
        />
      </Animated.View>
      {/* <View style={{ flex: 1, height: '100%', backgroundColor: 'blue' }} /> */}
    </MaskedView >
  )
}