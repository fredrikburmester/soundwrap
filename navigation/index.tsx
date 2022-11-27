/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { ColorSchemeName, Pressable, TouchableWithoutFeedback, Vibration, Image, TouchableOpacity, TouchableHighlight } from 'react-native'
import { AuthContextType, IAuth } from '../types/auth'

import Colors from '../constants/Colors'
import { AuthContext } from '../context/authContext'
import useColorScheme from '../hooks/useColorScheme'
import LoginScreen from '../screens/LoginScreen'
import NotFoundScreen from '../screens/NotFoundScreen'
import TabOneScreen from '../screens/HomeScreen'
import TabTwoScreen from '../screens/ProfileScreen'
import TopArtistsScreen from '../screens/TopArtistsScreen'
import TopSongsScreen from '../screens/TopSongsScreen'
import { RootStackParamList } from '../types'
import LinkingConfiguration from './LinkingConfiguration'
import * as Haptics from 'expo-haptics'
import AddPlaylistModal from '../screens/AddPlaylistModal'
import SoundcheckScreen from '../screens/SoundcheckScreen'
import CreateRoomScreen from '../screens/CreateRoomScreen'
import JoinRoomScreen from '../screens/JoinRoomScreen'
import RoomScreen from '../screens/RoomScreen'
import HomeScreen from '../screens/HomeScreen'
import ProfileScreen from '../screens/ProfileScreen'


type Props = {
  colorScheme: ColorSchemeName
}

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#1F1F1E',
  },
}

const Navigation: React.FC<Props> = ({ colorScheme }: Props) => {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={MyTheme}>
      <RootNavigator />
    </NavigationContainer>
  )
}

export default Navigation

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>()

function RootNavigator() {
  const { auth } = useContext(AuthContext) as AuthContextType
  const colorScheme = useColorScheme()

  if (!auth.authenticated) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    )
  } else {
    return (
      <Stack.Navigator>
        {/* <Stack.Screen name="Root" component={BottomTabNavigator} options={{
          title: 'Home',
          headerShown: true,
          headerLargeTitle: true,
          headerStyle: {
            height: 100,
          },
          headerLargeStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <Image source={{ uri: auth.user?.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
          ),
        }} /> */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
        <Stack.Screen name="TopSongs" component={TopSongsScreen} />
        <Stack.Screen name="TopArtists" component={TopArtistsScreen} options={{ title: 'Top Artists', headerLargeTitle: true, headerBlurEffect: 'dark', headerTransparent: true, headerLargeTitleShadowVisible: true }} />
        <Stack.Screen name="Soundcheck" component={SoundcheckScreen} />
        <Stack.Screen name="Create" component={CreateRoomScreen} />
        <Stack.Screen name="Join" component={JoinRoomScreen} />
        <Stack.Screen name="Room" component={RoomScreen} />
        {/* <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="AddPlaylistModal" options={{ title: 'Add playlist' }} component={AddPlaylistModal} />
        </Stack.Group> */}
      </Stack.Navigator>
    )
  }
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
// const BottomTab = createBottomTabNavigator<RootTabParamList>()

// function BottomTabNavigator() {
//   return (
//     <BottomTab.Navigator
//       initialRouteName="TabOne"
//       screenOptions={{
//         tabBarActiveTintColor: 'white',
//         tabBarInactiveTintColor: 'gray',
//         headerShown: false,
//       }}>
//       <BottomTab.Screen
//         name="TabOne"
//         component={TabOneScreen}
//         options={({ navigation }: RootTabScreenProps<'TabOne'>) => ({
//           title: 'Home',
//           tabBarIcon: ({ color }) => <Ionicons name="md-home" size={20} color={color} />,
//           tabBarButton: (props) => (
//             <TouchableOpacity
//               {...props}
//               onPress={() => {
//                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
//                 props.onPress()
//               }
//               }
//             />
//           ),
//         })}
//       />
//       <BottomTab.Screen
//         name="TabTwo"
//         component={TabTwoScreen}
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color }) => (
//             <Ionicons name="md-person" size={20} color={color} />
//           ),
//           tabBarButton: (props) => (
//             <TouchableOpacity
//               {...props}
//               onPress={() => {
//                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
//                 props.onPress()
//               }
//               }
//             />
//           ),
//         }}

//       />
//     </BottomTab.Navigator>
//   )
// }
