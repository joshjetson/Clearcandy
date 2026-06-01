import { Controller } from '@hotwired/stimulus'
import { installEventHandler } from './mixins/event_handler'
import { isiOSApp } from '../helper'

export default class extends Controller {
  DEFAULT_SKIP_TIME = 10

  initialize () {
    installEventHandler(this)
  }

  connect () {
    if (!('mediaSession' in navigator)) { return }

    this.handleEvent('player:playing', { with: this.#setPlayingStatus })
    this.handleEvent('player:pause', { with: this.#setPausedStatus })
    this.handleEvent('player:stop', { with: this.#setStoppedStatus })

    Object.entries(this.mediaSessionActions).forEach(([actionName, actionHandler]) => {
      try {
        navigator.mediaSession.setActionHandler(actionName, actionHandler)
      } catch (error) {
        // The media session action is not supported.
      }
    })
  }

  #setPlayingStatus = () => {
    navigator.mediaSession.playbackState = 'playing'
    this.#updateMetadata()
    this.#updatePositionState()
  }

  #setPausedStatus = () => {
    navigator.mediaSession.playbackState = 'paused'
    this.#updatePositionState()
  }

  #setStoppedStatus = () => {
    navigator.mediaSession.playbackState = 'none'
  }

  #updateMetadata = () => {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: this.currentSong.name,
      artist: this.currentSong.artist_name,
      album: this.currentSong.album_name,
      artwork: [
        { src: this.currentSong.album_image_url.small, sizes: '200x200' },
        { src: this.currentSong.album_image_url.medium, sizes: '300x300' },
        { src: this.currentSong.album_image_url.large, sizes: '400x400' }
      ]
    })
  }

  #updatePositionState = () => {
    if (!('setPositionState' in navigator.mediaSession)) { return }

    const duration = this.player.duration

    // setPositionState throws if duration is missing/zero or position is
    // out of range, which would break the whole handler. Guard against it.
    if (!duration || !isFinite(duration)) { return }

    const position = Math.min(Math.max(this.player.currentTime, 0), duration)

    navigator.mediaSession.setPositionState({
      duration,
      playbackRate: this.player.playbackRate,
      position
    })
  }

  #play = () => {
    this.player.play()
  }

  #pause = () => {
    this.player.pause()
  }

  #next = () => {
    this.player.next()
  }

  #previous = () => {
    this.player.previous()
  }

  #stop = () => {
    this.player.stop()
  }

  #seekBackward = (event) => {
    const skipTime = event.seekOffset || this.DEFAULT_SKIP_TIME

    this.player.seek(this.player.currentTime - skipTime)
    this.#updatePositionState()
  }

  #seekForward = (event) => {
    const skipTime = event.seekOffset || this.DEFAULT_SKIP_TIME

    this.player.seek(this.player.currentTime + skipTime)
    this.#updatePositionState()
  }

  #seekTo = (event) => {
    this.player.seek(event.seekTime)
    this.#updatePositionState()
  }

  get mediaSessionActions () {
    const actions = {
      play: this.#play,
      pause: this.#pause,
      previoustrack: this.#previous,
      nexttrack: this.#next,
      stop: this.#stop,
      seekto: this.#seekTo
    }

    // On iOS, registering seekbackward/seekforward handlers causes the
    // lock-screen and Bluetooth Next/Previous track buttons to disappear.
    // Skip them on iOS so users keep working track-change controls.
    if (!this.#isiOS) {
      actions.seekbackward = this.#seekBackward
      actions.seekforward = this.#seekForward
    }

    return actions
  }

  get #isiOS () {
    return isiOSApp() ||
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }

  get player () {
    return App.player
  }

  get currentSong () {
    return this.player.currentSong
  }

  get currentIndex () {
    return this.player.currentIndex
  }
}
