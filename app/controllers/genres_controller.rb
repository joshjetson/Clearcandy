# frozen_string_literal: true

class GenresController < ApplicationController
  def index
    @genres = Album.where.not(genre: [nil, ""])
      .group(:genre)
      .select("genre, COUNT(DISTINCT albums.id) as albums_count, COUNT(songs.id) as songs_count")
      .joins(:songs)
      .order(:genre)
  end

  def show
    @genre = params[:id]
    @albums = Album.where(genre: @genre).with_attached_cover_image.includes(:artist)
    @pagy, @songs = pagy(
      Song.joins(:album).where(albums: { genre: @genre }).includes(:artist, :album)
    )
  end
end
