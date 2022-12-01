import { View, Text, TextInput, Pressable } from "react-native"
import Colors from "../constants/Colors"
import React, { useRef } from "react"

interface Props {
  title: string
  value: string
  onChange: (value: string) => void
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  placeholder?: string
  autoFocus?: boolean
}

export const TextInputComponent: React.FC<Props> = ({ title, onChange, value, autoCapitalize, placeholder, autoFocus }) => {
  let inputRef = useRef<TextInput | null>(null)

  return (
    <Pressable onPress={() => {
      if(inputRef && inputRef.current) {
        inputRef.current.focus()
      }
      }
    }>
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
          autoFocus={autoFocus}
          style={{
            color: 'lightgray',
            fontSize: 17,
            textAlign: 'right',
          }}
          onChangeText={onChange}
          value={value}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          ref={inputRef}
          
        />
      </View>
    </Pressable>

  )
}

