import MaskedView from "@react-native-masked-view/masked-view"
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useRef } from "react"
import { Animated } from "react-native"
import { Colors } from "react-native/Libraries/NewAppScreen"
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
      duration: 5000
    }).start()
  }, [])


  return (
    <MaskedView
      style={{ flex: 1, flexDirection: 'row', height: '100%' }}
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
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            {text}
          </Text>
        </View>
      }
    >
      <Animated.View>
        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={{ height: '100%', flex: 1 }} />
      </Animated.View>
    </MaskedView>
}