import React from 'react'
import { TouchableOpacity, View, } from 'react-native'
import { Text } from '../components/Themed'
import Colors from '../constants/Colors'

interface Props {
  title?: string
  onPress: () => void
  color?: string
  size?: 'sm' | 'lg'
  style?: any
  children?: any
}

export const ButtonComponent: React.FC<Props> = ({ title, onPress, color, size, style, children }) => {

  return (
    <TouchableOpacity
      style={[{
        backgroundColor: color ? color : Colors.primary,
        padding: size === 'sm' ? 5 : 10,
        borderRadius: 10,
        width: '100%',
        height: size === 'sm' ? 35 : 45,
        alignItems: 'center',
        justifyContent: 'center',
      }, style]}
      onPress={() => onPress()}
    >
      {title && <Text style={{ color: 'white', fontSize: 16 }}>{title}</Text>}
      {children && <View>
        {children}
      </View>}
    </TouchableOpacity>
  )
}