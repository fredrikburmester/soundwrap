import SegmentedControl from '@react-native-segmented-control/segmented-control'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, ImageBackground, ScrollView, StyleSheet, Animated, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AuthContextType } from '../types/auth'
import { ArtistItem, SpotifyTopArtistsResult } from '../types/spotify'
import { getTopArtists } from '../api/spotify'
import { Text, View } from '../components/Themed'
import Colors from '../constants/Colors'
import { AuthContext } from '../context/authContext'
import useColorScheme from '../hooks/useColorScheme'
import { useHeaderHeight } from '@react-navigation/elements'

enum TimeRange {
  SHORT = 'short_term',
  MEDIUM = 'medium_term',
  LONG = 'long_term',
}

export default function TopArtistsScreen() {
  const { logout, auth } = useContext(AuthContext) as AuthContextType
  const [artists, setArtists] = useState<ArtistItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedSegment, setSelectedSegment] = useState(0)
  const [timeRange, setTimeRange] = useState('short_term')

  useEffect(() => {
    setLoading(true)
    fadeAnim.setValue(0)
    getTopArtists(auth.token, timeRange).then((res: SpotifyTopArtistsResult) => {
      if (res && res.items) {
        setArtists(res.items)
        setLoading(false)
      } else {
        console.log("error", res)
        logout()
      }
    })
  }, [timeRange])

  const ArtistCard = ({ artist, index }: { artist: ArtistItem, index: number }) => (
    <View style={styles.artistCard}>
      <ImageBackground source={{ uri: artist.images[0].url }} resizeMode="cover" style={styles.image} imageStyle={{ borderRadius: 10, opacity: 0.3 }}>
        <Text style={styles.artistIndex}>#{index + 1}</Text>
        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>{artist.name}</Text>
        </View>
      </ImageBackground>
    </View>
  )

  const colorScheme = useColorScheme()

  const changeTimeRange = (index: number) => {
    setSelectedSegment(index)
    setTimeRange(index === 0 ? TimeRange.SHORT : index === 1 ? TimeRange.MEDIUM : TimeRange.LONG)
  }
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start()
  }, [fadeAnim, artists])

  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()

  return (
    <ScrollView style={{ backgroundColor: Colors[colorScheme].background }} contentInsetAdjustmentBehavior="automatic">
{
        Platform.OS === 'ios' ? (
        <SegmentedControl
          values={['Month', 'Half year', 'Over A Year']}
          selectedIndex={selectedSegment}
          onChange={(event) => {
            changeTimeRange(event.nativeEvent.selectedSegmentIndex)
          }}
          tintColor="#fefefe"
          appearance="light"
          style={{ margin: 20, marginTop: 20 }}
        />
        ) : (
          <View style={{ marginTop: headerHeight  }}>
            <SegmentedControl
              values={['Month', 'Half year', 'Over A Year']}
              selectedIndex={selectedSegment}
              onChange={(event) => {
                changeTimeRange(event.nativeEvent.selectedSegmentIndex)
              }}
              appearance="dark"
              tintColor={Colors.primary}
              style={{ margin: 20, marginTop: 20 }}
              fontStyle={{ color: 'white' }}
              tabStyle={{  }}
            />
          </View>
        )
      }
      {!loading && artists.map((artist, index) => (
        <Animated.View                 // Special animatable View
          style={{
            opacity: fadeAnim,         // Bind opacity to animated value
          }}
          key={index}
        >
          <View style={{ marginBottom: 20 }} >
            <ArtistCard artist={artist} index={index} />
          </View>
        </Animated.View>
      ))}
      {artists.length === 0 && !loading && <Text style={{ textAlign: 'center', marginTop: 20 }}>You have no top artists for this time period!</Text>}
      {loading && <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background, marginTop: 20 }}>
        <ActivityIndicator size="small" color="white" />
      </View>}
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  artistCard: {
    backgroundColor: 'black',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  artistIndex: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    opacity: 0.5,
  },

  image: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    resizeMode: "contain",
  },
  artistInfo: {
    flexDirection: 'column',
    marginLeft: 20,
    backgroundColor: 'transparent',
    width: '80%',
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artistArtist: {
    fontSize: 16,
    color: 'lightgray',
  },
  container: {
    width: '100%',
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
  },
})
