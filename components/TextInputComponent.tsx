import { View, Text, TextInput } from "react-native"
import Colors from "../constants/Colors"
import React from "react"

interface Props {
  title: string
  value: string
  onChange: (value: string) => void
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  placeholder?: string
}

export const TextInputComponent: React.FC<Props> = ({ title, onChange, value, autoCapitalize, placeholder }) => {

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 10,
      backgroundColor: Colors.backgroundDark,
      padding: 17,
      marginBottom: 8,
    }}>
      <Text style={{ fontSize: 17, color: 'white' }}>{title}</Text>
      <TextInput
        style={{
          color: 'lightgray',
          fontSize: 17,
          textAlign: 'right',
        }}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
      />
    </View>
  )
}

