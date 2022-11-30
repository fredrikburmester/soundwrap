import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'
import AuthProvider from './context/authContext'
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message'

import socket from './utils/socket'
import Colors from './constants/Colors'

export default function App() {
  const isLoadingComplete = useCachedResources()
  const colorScheme = useColorScheme()

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        text1Style={{
          fontSize: 17,
          color: 'white'
        }}
        text2Style={{
          fontSize: 14,
          color: 'white'
        }}
        style={{ backgroundColor: Colors.primary, borderLeftColor: Colors.primary, height: 80, borderRadius: 15, marginTop: 20, width: '90%' }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 17,
          color: 'white'
        }}
        text2Style={{
          fontSize: 14,
          color: 'white'
        }}
        style={{ backgroundColor: Colors.error, borderLeftColor: Colors.error, height: 80, borderRadius: 15, marginTop: 20, width: '90%' }}
      />
    ),
  }

  const showToast = (type: 'success' | 'error' | 'info', text1: string, text2: string) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    })
  }

  useEffect(() => {
    socket.connect()

    socket.on('connect', () => {
      console.log('connect')
    })

    socket.on('disconnect', () => {
      console.log('disconnected')
    })

    socket.on('error', (title: string, error: string) => {
      showToast('error', title, error)
    })

    socket.on('info', (title: string, message: string) => {
      showToast('success', title, message)
    })

    return () => {
      socket.disconnect()
    }
  }, [])


  if (!isLoadingComplete) {
    return null
  } else {
    return (
      <AuthProvider>
        <SafeAreaProvider>
          {true && <Navigation colorScheme={colorScheme} />}
          <StatusBar style="light" />
          <Toast
            position="top"
            config={toastConfig}
          />
        </SafeAreaProvider>
      </AuthProvider>
    )
  }
}
