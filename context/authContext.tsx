import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { createContext, useEffect, useState } from 'react'
import { AuthContextType, IAuth, IUser } from '../types/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface Props {
  children: React.ReactNode
}

export const AuthContext = createContext<AuthContextType | null>(null)

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [auth, setAuth] = useState<IAuth>(
    {
      authenticated: false,
      token: '',
      user: null,
    }
  )

  const [demo, setDemo] = useState<boolean>(false)

  const { getMe } = useSpotifyAuth()

  // const isAuthenticated = async () => {
  //   const jsonValue = await AsyncStorage.getItem('@auth')
  //   if (jsonValue) {
  //     const authObject = JSON.parse(jsonValue) as IAuth
  //     if (authObject) {
  //       setAuth({
  //         authenticated: false,
  //         token: '',
  //         user: null,
  //       })
  //     }
  //   }
  //   return auth.authenticated
  // }

  const loginDemo = () => {
    const me: IUser = {
      id: 'demo',
      name: 'Demo',
      avatar: 'https://picsum.photos/200',
      score: 0,
      guesses: []
    }

    const authObject = {
      authenticated: false,
      token: 'demo',
      user: me,
    }

    setAuth(authObject)
    setDemo(true)
  }


  const login = async (token: string) => {
    try {
      const res = await getMe(token)

      const me = {
        id: res.id,
        name: res.display_name,
        avatar: res.images.length > 0 ? res.images[0].url : 'https://picsum.photos/200',
        score: 0,
        guesses: []
      }

      const authObject = {
        authenticated: true,
        token: token,
        user: me,
      }

      setAuth(authObject)

      await AsyncStorage.setItem('@auth', JSON.stringify(authObject))
    } catch (e) {
      console.log('[error] getting me')
    }
  }

  const logout = async () => {
    setAuth({ authenticated: false, token: '', user: null })
    setDemo(false)
    await AsyncStorage.removeItem('@auth')
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, demo, loginDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;


