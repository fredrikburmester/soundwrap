import { FlashList } from '@shopify/flash-list'
import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Animated, ImageBackground, ImageBackgroundBase, ScrollView, StyleSheet, Alert, TouchableOpacity, FlatList, Platform } from 'react-native'
import { AuthContextType } from '../types/auth'
import { createAndAddSongsToPlaylist, getTopSongs } from '../api/spotify'
import { Text, View } from '../components/Themed'
import { AuthContext } from '../context/authContext'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { SongItem, SpotifyTopTracksResult } from '../types/spotify'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'
import Colors from '../constants/Colors'

enum TimeRange {
  SHORT = 'short_term',
  MEDIUM = 'medium_term',
  LONG = 'long_term',
}

const SongCard = ({ song, index }: { song: SongItem, index: number }) => (
  <View style={styles.songCard}>
    <ImageBackground source={{ uri: song.album.images[0].url }} resizeMode="cover" style={styles.image} imageStyle={{ borderRadius: 10, opacity: 0.3 }}>
      <Text style={styles.songIndex}>#{index + 1}</Text>
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{song.name}</Text>
        <Text style={styles.songArtist}>{song.artists[0].name}</Text>
      </View>
    </ImageBackground>
  </View>
)

interface ICachedSongs {
  [key: string]: SongItem[]
}

export default function TopSongsScreen({ navigation }: any) {
  const { logout, auth } = useContext(AuthContext) as AuthContextType
  const [songs, setSongs] = useState<SongItem[]>([])
  // const [songsShortTerm, setSongsShortTerm] = useState<SongItem[]>([])
  // const [songsMediumTerm, setSongsMediumTerm] = useState<SongItem[]>([])
  // const [songsLongTerm, setSongsLongTerm] = useState<SongItem[]>([])
  const [cachedSongs, setCachedSongs] = useState<ICachedSongs>({'short_term': [], 'medium_term': [], 'long_term': []})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [timeRange, setTimeRange] = useState('short_term')
  const [selectedSegment, setSelectedSegment] = useState(0)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const newPlaylistName = '⭐️ Top songs ' + timeRange.split('_').join(' ') + ' ⭐️ ' + new Date().toLocaleDateString()
  const stateRef = useRef<SongItem[]>([])
  stateRef.current = songs
  
  const timeRangeRef = useRef<string>('')
  timeRangeRef.current = timeRange

  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()

  const createTwoButtonAlert = () => {
    Alert.alert('Save as playlist', 'Do you want to save your top songs to a playlist in your Spotify account?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'Save', onPress: () => createAndAddSongsToPlaylist(auth.token, newPlaylistName, stateRef.current) },
    ])
  }

  const getMoreSongs = async () => {
    setLoadingMore(true)
    const newSongs = await getTopSongs(auth.token, timeRange, songs.length, 5)
    setSongs([...songs, ...newSongs.items])
    setLoadingMore(false)
  }

  const changeTimeRange = (index: number) => {
    setSelectedSegment(index)
    setTimeRange(index === 0 ? TimeRange.SHORT : index === 1 ? TimeRange.MEDIUM : TimeRange.LONG)
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Top Songs', headerLargeTitle: true, headerBlurEffect: 'dark', headerTransparent: true, headerRight: () => (
        <TouchableOpacity onPress={() => {
          createTwoButtonAlert()
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}>
          <Ionicons name="add" size={24} color="white" style={{ marginRight: 0 }} />
        </TouchableOpacity>
      ),
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    fadeAnim.setValue(0)
   
    getTopSongs(auth.token, timeRange).then((res: SpotifyTopTracksResult) => {
      if (res && res.items) {
        setSongs(res.items)
        // setCachedSongs({...cachedSongs, [timeRange]: res.items})
        setLoading(false)
      } else {
        console.log("error", res)
        logout()
      }
    }).catch((err) => {
      console.log(err)
    })
  }, [timeRange])

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [fadeAnim, songs])

  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      data={songs}
      estimatedItemSize={100}
      ListHeaderComponent={
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
      refreshing={loading}
      renderItem={({item, index}) => (
        <>
          {
            <Animated.View
              style={{
                opacity: fadeAnim,
              }}
              key={index}
            >
              <View style={{ marginBottom: 20 }}>
                <SongCard song={item} index={index} />
              </View>
            </Animated.View>}
        </>
      )}
      ListFooterComponent={
        <>
          {cachedSongs[timeRange].length === 0 && !loading && <Text style={{ textAlign: 'center', marginTop: 20 }}>You have no top songs for this time period!</Text>}
          {loading || loadingMore && <ActivityIndicator size="small" color="white" style={{ marginTop: 20 }} />}
        </>
      }
      onEndReached={() => getMoreSongs()}
    />
      // <ScrollView>
      //   <>
      //     {/* <SegmentedControl
      //       values={['Month', 'Half year', 'Over A Year']}
      //       selectedIndex={selectedSegment}
      //       onChange={(event) => {
      //         changeTimeRange(event.nativeEvent.selectedSegmentIndex)
      //       }}
      //       tintColor="#fefefe"
      //       appearance="light"
      //       style={{ margin: 20, marginTop: 200 }}
      //     /> */}
      //     {cachedSongs[timeRange].map((item: SongItem, index: number) => {
      //         <Animated.View
      //         style={{
      //           opacity: fadeAnim,
      //         }}
      //         key={index}
      //         >
      //           <View style={{ marginBottom: 20 }}>
      //             <SongCard song={item} index={index} />
      //           </View>
      //         </Animated.View>
      //       })
      //     }
      //   </>
      // </ScrollView>
  )
}

const styles = StyleSheet.create({
  songCard: {
    borderRadius: 10,
    marginHorizontal: 20,
  },
  songIndex: {
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
  songInfo: {
    flexDirection: 'column',
    marginLeft: 20,
    width: '80%',
    backgroundColor: 'transparent',
  },
  songName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  songArtist: {
    fontSize: 16,
    color: 'lightgray',
  },
  container: {
    width: '100%',
    flex: 1,
    marginTop: 0,
  },
  loadingContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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