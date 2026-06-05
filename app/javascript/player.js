import { dispatchEvent } from './helper'
import Playlist from './playlist'

// The player drives a single, persistent HTMLAudioElement and changes
// tracks by swapping its `src`. This is essential for iOS: Safari only
// allows an already-unlocked audio element to keep playing (and to start
// the next track) while the screen is locked or the PWA is backgrounded.
// Creating a new element per song — as a fresh `new Audio()` or a new
// Howl would — gets blocked in the background, which is what previously
// stopped playback and broke the lock-screen / Bluetooth controls.
class Player {
  currentSong = {}
  isPlaying = false
  playlist = new Playlist()

  constructor () {
    this.audio = new Audio()
    this.audio.preload = 'auto'
    this._loading = false

    this.audio.addEventListener('playing', () => {
      this._loading = false
      this.isPlaying = true
      dispatchEvent(document, 'player:playing')
    })

    this.audio.addEventListener('pause', () => {
      // Ignore pauses caused by loading a new track, the natural end of a
      // track, or stopping (currentSong cleared). Only a real user pause
      // should surface as player:pause.
      if (this._loading || this.audio.ended || !this.currentSong.id) { return }

      this.isPlaying = false
      dispatchEvent(document, 'player:pause')
    })

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false
      dispatchEvent(document, 'player:end')
    })

    this.audio.addEventListener('error', () => {
      // Ignore errors from clearing the src on stop().
      if (!this.currentSong.id) { return }

      dispatchEvent(document, 'player:playerror', { error: this.audio.error })
    })
  }

  playOn (index) {
    if (this.playlist.length === 0) { return }

    dispatchEvent(document, 'player:beforePlaying')

    const song = this.playlist.songs[index]
    this.currentSong = song
    this.isPlaying = true
    this._loading = true

    // Swap the source on the existing element rather than creating a new
    // one, so iOS keeps the audio session alive in the background.
    this.audio.src = song.url
    this.audio.play().catch(() => {})
  }

  play () {
    this.isPlaying = true

    if (this.currentSong.id && this.audio.src) {
      this.audio.play().catch(() => {})
    } else {
      this.playOn(this.currentIndex)
    }
  }

  pause () {
    this.isPlaying = false
    this.audio.pause()
  }

  stop () {
    this.isPlaying = false

    // Clear current song first so the pause/error handlers know this is a
    // stop and don't emit spurious events.
    this.currentSong = {}

    this.audio.pause()
    this.audio.removeAttribute('src')
    this.audio.load()

    dispatchEvent(document, 'player:stop')
  }

  next () {
    this.skipTo(this.currentIndex + 1)
  }

  previous () {
    this.skipTo(this.currentIndex - 1)
  }

  skipTo (index) {
    if (index >= this.playlist.length) {
      index = 0
    } else if (index < 0) {
      index = this.playlist.length - 1
    }

    this.playOn(index)
  }

  seek (seconds) {
    this.audio.currentTime = seconds
  }

  volume (value) {
    this.audio.volume = Number(value)
  }

  get currentTime () {
    return this.audio.currentTime || 0
  }

  get duration () {
    return this.currentSong.duration || this.audio.duration || 0
  }

  get playbackRate () {
    return this.audio.playbackRate || 1
  }

  get currentIndex () {
    return Math.max(this.playlist.indexOf(this.currentSong.id), 0)
  }
}

export default Player
