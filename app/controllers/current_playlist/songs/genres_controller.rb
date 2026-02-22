# frozen_string_literal: true

class CurrentPlaylist::Songs::GenresController < ApplicationController
  before_action :find_current_playlist

  def update
    song_ids = Song.joins(:album).where(albums: { genre: params[:id] }).ids
    @current_playlist.replace(song_ids)

    redirect_to current_playlist_songs_path(
      should_play: true,
      shuffle: params[:shuffle]
    )
  end

  private

  def find_current_playlist
    @current_playlist = Current.user.current_playlist
  end
end
