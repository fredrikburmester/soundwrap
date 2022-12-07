import MaskedView from "@react-native-masked-view/masked-view"
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"
import Colors from "../constants/Colors"
import { Text, View } from '../components/Themed'
import { transform } from "@babel/core"

interface Props {
  text: string
  style: any
}

export const GradientText: React.FC<Props> = ({ style, text }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      useNativeDriver: true,
      toValue: 1,
      duration: 50000,
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
      maskElement={
        <View
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <Text
            style={[{
              fontSize: 40,
              fontWeight: 'bold',
            }]}
          >
            {text}
          </Text>
        </View >
      }
    >
      <Animated.View style={[{
        transform: [
          {
            translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-9000, 0]
            }),
          },
          {
            translateY: 0
          }
        ],
        width: 10000,
        height: 50,
      }, style]}>
        <LinearGradient
          colors={ga}
          style={{ flex: 1, width: 10000 }}
          start={{ x: 0.0, y: 1.0 }}
          end={{ x: 1.0, y: 1.0 }}
        />
      </Animated.View>
    </MaskedView >
  )
}