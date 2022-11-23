
import React from 'react'
import { Text, View, StyleSheet, Pressable, ActivityIndicator, TouchableHighlight, TouchableOpacity } from 'react-native'

interface Props {
  title: string
  disabled?: boolean
  color?: 'green' | 'red'
  size?: 'sm' | 'lg'
  onPress?: () => void
}

const activeButton = ({ onPress, title, color, size }: Props) => {
  let bg = 'white'
  if (color === 'green') {
    bg = '#1DB753'
  } else if (color === 'red') {
    bg = '#FF0000'
  }

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: size == 'lg' ? 12 : 2,
      borderRadius: 50,
      border: 'solid',
      borderWidth: 3,
      borderColor: '#1DB753',
      elevation: 3,
      backgroundColor: 'transparent',
      width: size == 'lg' ? 150 : 135,
    },
    text: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'white',
    },
  })

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

const inactiveButton = ({ size, title }: Props) => {
  const styles = StyleSheet.create({
    inactiveButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: size == 'lg' ? 12 : 2,
      borderRadius: 50,
      border: 'solid',
      borderWidth: 3,
      borderColor: '#1DB753',
      elevation: 3,
      backgroundColor: 'transparent',
      width: size == 'lg' ? 150 : 135,
    },

  })
  return (
    <View style={styles.inactiveButton}>
      <ActivityIndicator />
    </View>
  )
}

export default function Button(props: Props) {
  const { onPress, title, disabled } = props
  return disabled ? inactiveButton(props) : activeButton(props)
}