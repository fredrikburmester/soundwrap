export interface SpotifyTopTracksResult {
  items: SongItem[]
  total: number
  limit: number
  offset: number
  href: string
  previous: any
  next: string
}

export interface SpotifyTopArtistsResult {
  items: ArtistItem[]
  total: number
  limit: number
  offset: number
  href: string
  previous: any
  next: string
}

export interface SongItem {
  album: Album
  artists: Artist2[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: ExternalIds
  external_urls: ExternalUrls4
  href: string
  id: string
  is_local: boolean
  name: string
  popularity: number
  preview_url: string
  track_number: number
  type: string
  uri: string
}

export interface Album {
  album_type: string
  artists: Artist[]
  available_markets: string[]
  external_urls: ExternalUrls2
  href: string
  id: string
  images: Image[]
  name: string
  release_date: string
  release_date_precision: string
  total_tracks: number
  type: string
  uri: string
}

export interface Artist {
  external_urls: ExternalUrls
  href: string
  id: string
  name: string
  type: string
  uri: string
}

export interface Artist2 {
  external_urls: ExternalUrls
  href: string
  id: string
  name: string
  type: string
  uri: string
}

export interface ExternalIds {
  isrc: string
}

export interface SpotifyMeResult {
  display_name: string
  email: string
  external_urls: ExternalUrls
  followers: Followers
  href: string
  id: string
  images: Image[]
  type: string
  uri: string
}

export interface ExternalUrls {
  spotify: string
}

export interface Followers {
  href: any
  total: number
}

export interface ArtistItem {
  external_urls: ExternalUrls
  followers: Followers
  genres: string[]
  href: string
  id: string
  images: Image[]
  name: string
  popularity: number
  type: string
  uri: string
}

export interface SpotifyMyPlaylistsResult {
  href: string
  items: PlaylsitItem[]
  limit: number
  next: string
  offset: number
  previous: any
  total: number
}

export interface PlaylsitItem {
  collaborative: boolean
  description: string
  external_urls: ExternalUrls
  href: string
  id: string
  images: Image[]
  name: string
  owner: Owner
  primary_color: any
  public: boolean
  snapshot_id: string
  tracks: Tracks
  type: string
  uri: string
}

export interface Image {
  height: any
  url: string
  width: any
}

export interface Owner {
  display_name: string
  external_urls: ExternalUrls
  href: string
  id: string
  type: string
  uri: string
}

export interface Tracks {
  href: string
  total: number
}