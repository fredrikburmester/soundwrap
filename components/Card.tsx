import { View, Text, StyleSheet, Touchable, TouchableOpacity, TouchableHighlight } from "react-native"
import Colors from "../constants/Colors"
import Button from "./Button"
import useColorScheme from '../hooks/useColorScheme'
import React from "react"
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'

interface Props {
  title: string
  description: string
  color?: 'error' | string
  onPress: () => void
  style?: any
  icon?: string
  onAdd?: () => void
}

export const Card: React.FC<Props> = ({ title, description, onPress, color, style, icon }) => {
  const colorScheme = useColorScheme()

  let _color = Colors.primary

  if (color === 'error') {
    _color = Colors.error
  } else if (color) {
    _color = color
  }

  const styles = StyleSheet.create({
    card: {
      padding: 18,
      backgroundColor: _color,
      borderRadius: 10,
      justifyContent: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[colorScheme].text,
    },
    cardDescription: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.6,
    },
  })

  const click = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <TouchableOpacity onPress={click}>
      <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, style]}>
        <View style={{ flexDirection: 'column', width: '80%' }}>
          <Text style={styles.cardDescription}>{description}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        { /* @ts-ignore */}
        <Ionicons name={icon ? icon : 'chevron-forward-outline'} size={24} color="white" style={{ opacity: 0.8 }} />
      </View>
    </TouchableOpacity>
  )
}

