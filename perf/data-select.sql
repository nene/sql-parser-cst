WITH
  FullAlbum AS (
    SELECT
      AlbumId,
      Album.Title AS AlbumName,
      Artist.ArtistId AS ArtistId,
      Artist.Name as ArtistName
    FROM
      Album
      LEFT JOIN Artist ON Album.ArtistId = Artist.ArtistId
  ),
  FullTrack AS (
    SELECT
      TrackId,
      Track.Name AS TrackName,
      AlbumId,
      MediaType.Name AS Media,
      Genre.Name AS Genre,
      Composer,
      Milliseconds,
      Bytes,
      UnitPrice
    FROM
      Track
      LEFT JOIN MediaType USING (MediaTypeId)
      LEFT JOIN Genre USING (GenreId)
  ),
  ArtistTrackCount AS (
    SELECT
      ArtistId,
      ArtistName,
      COUNT(TrackId) AS TrackCount
    FROM
      FullAlbum
      LEFT JOIN FullTrack USING (AlbumId)
    GROUP BY
      ArtistId
    ORDER BY
      TrackCount DESC,
      ArtistName ASC
  ),
  ArtistPlaylistCount AS (
    SELECT
      ArtistId,
      ArtistName,
      COUNT(DISTINCT PlaylistId) AS PlaylistCount
    FROM
      FullAlbum
      LEFT JOIN Track USING (AlbumId)
      LEFT JOIN PlaylistTrack USING (TrackId)
    GROUP BY
      ArtistId
    ORDER BY
      PlaylistCount DESC,
      ArtistName ASC
  )
SELECT
  ArtistTrackCount.ArtistName AS ArtistName,
  TrackCount,
  PlaylistCount,
  TrackCount / PlaylistCount AS TracksPerPlaylist
FROM
  ArtistTrackCount
  LEFT JOIN ArtistPlaylistCount USING (ArtistId)
ORDER BY
  TracksPerPlaylist DESC,
  TrackCount DESC,
  PlaylistCount DESC
LIMIT
  15;
