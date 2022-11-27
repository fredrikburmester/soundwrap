import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../components/Themed'
import Colors from '../constants/Colors'

interface Props {
  title?: string
}

export const HeaderComponent: React.FC<Props> = ({ title }) => {
  return (
    <SafeAreaView style={{ height: 120, backgroundColor: Colors.backgroundDark, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ justifyContent: 'center' }}>
        <Text style={{ fontSize: 17 }}>Home</Text>
      </View>
    </SafeAreaView>
  )
}