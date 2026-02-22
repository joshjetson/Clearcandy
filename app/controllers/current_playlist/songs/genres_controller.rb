# frozen_string_literal: true

class CurrentPlaylist::Songs::GenresController < ApplicationController
  before_action :find_current_playlist

  def update
    song_ids = Song.joins(:album).where(albums: { genre: params[:id] }).ids
    @current_playlist.replace(song_ids)

    @playlist = @current_playlist
    @songs = @playlist.songs_with_favorite
    @should_play = true
    @should_play_song_id = nil
    @shuffle = params[:shuffle] == "true"

    render "current_playlist/songs/index", layout: "playlist", formats: [:html]
  end

  private

  def find_current_playlist
    @current_playlist = Current.user.current_playlist
  end
end
