import React, { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/authContext"
import { AuthContextType } from "../types/auth"
import { WebView } from 'react-native-webview'
import Colors from "../constants/Colors"
import { ActivityIndicator } from "react-native"

interface Props {
  title?: string
  onPress?: () => void
  songUri?: string
}
export const SpotifyPlayer: React.FC<Props> = ({ title, songUri }) => {
  const correctSongUri = songUri?.replace('spotify:track:', '')

  // https://open.spotify.com/embed/track/4iV5W9uYEdYUVa79Axb7Rh
  const [opacity, setOpacity] = useState(0)
  return (
    <>
      {!opacity && <ActivityIndicator style={{marginTop: 30}}/>}
      <WebView 
      style={{ marginHorizontal: 12, opacity: opacity }}
      onLoad={() => setOpacity(1)}
      useWebKit={true}
      originWhitelist={['*']}
      allowsInlineMediaPlayback={true}
      source={{ 
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background-color: ${Colors.background};
              color: #fff;
            }
            iframe {
              width: 100%;
              height: 80px;
              border: none;
              overflow: hidden;
            }
            </style>
        </head>
        <body>
        <iframe src="https://open.spotify.com/embed/track/${correctSongUri}" allowfullscreen="false" allowtransparency="false" allow="encrypted-media"></iframe>
        </body>
        </html>
      ` }} />
    </>
  )
}