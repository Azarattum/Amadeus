CREATE TRIGGER IF NOT EXISTS cascade_playlists_library
AFTER DELETE ON playlists
FOR EACH ROW
BEGIN
  DELETE FROM library WHERE playlist = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS cascade_library_tracks
AFTER DELETE ON library
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM library 
    WHERE track = OLD.track 
  UNION ALL SELECT 1 FROM playback
    WHERE track = OLD.track
  UNION ALL SELECT 1 FROM feed 
    WHERE track = OLD.track
  LIMIT 1
)
BEGIN
  DELETE FROM tracks WHERE id = OLD.track;
END;

CREATE TRIGGER IF NOT EXISTS cascade_playback_tracks
AFTER DELETE ON playback
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM library
    WHERE track = OLD.track
  UNION ALL SELECT 1 FROM playback
    WHERE track = OLD.track
  UNION ALL SELECT 1 FROM feed 
    WHERE track = OLD.track
  LIMIT 1
)
BEGIN
  DELETE FROM tracks WHERE id = OLD.track;
END;

CREATE TRIGGER IF NOT EXISTS cascade_feed_tracks
AFTER DELETE ON feed
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM library
    WHERE track = OLD.track
  UNION ALL SELECT 1 FROM playback
    WHERE track = OLD.track
  UNION ALL SELECT 1 FROM feed 
    WHERE track = OLD.track
  LIMIT 1
)
BEGIN
  DELETE FROM tracks WHERE id = OLD.track;
END;

CREATE TRIGGER IF NOT EXISTS cascade_tracks_albums
AFTER DELETE ON tracks
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM tracks WHERE album = OLD.album LIMIT 1
)
BEGIN
  DELETE FROM albums WHERE id = OLD.album;
END;

CREATE TRIGGER IF NOT EXISTS cascade_albums_attribution
AFTER DELETE ON albums
FOR EACH ROW
BEGIN
  DELETE FROM attribution WHERE album = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS cascade_attribution_artists
AFTER DELETE ON attribution
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM attribution
    WHERE artist = OLD.artist
)
BEGIN
  DELETE FROM artists WHERE id = OLD.artist;
END;

CREATE TRIGGER IF NOT EXISTS cascade_tracks_resources
AFTER DELETE ON tracks
FOR EACH ROW
BEGIN
  DELETE FROM sources WHERE owner = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS cascade_albums_resources
AFTER DELETE ON albums
FOR EACH ROW
BEGIN
  DELETE FROM sources WHERE owner = OLD.id;
  DELETE FROM assets WHERE owner = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS cascade_artists_resources
AFTER DELETE ON artists
FOR EACH ROW
BEGIN
  DELETE FROM sources WHERE owner = OLD.id;
  DELETE FROM assets WHERE owner = OLD.id;
END;
