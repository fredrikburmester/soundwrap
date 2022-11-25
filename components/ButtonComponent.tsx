import React from 'react'
import { TouchableOpacity, } from 'react-native'
import { Text } from '../components/Themed'
import Colors from '../constants/Colors'

interface Props {
  title: string
  onPress: () => void
  color?: string
}

export const ButtonComponent: React.FC<Props> = ({ title, onPress, color, }) => {

  return (
    <TouchableOpacity
      style={{
        backgroundColor: color ? color : Colors.primary,
        padding: 10,
        borderRadius: 10,
        width: '100%',
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={() => onPress()}
    >
      <Text style={{ color: 'white', fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
  )
}