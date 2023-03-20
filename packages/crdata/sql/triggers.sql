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

CREATE TRIGGER IF NOT EXISTS cascade_tracks_attribution
AFTER DELETE ON tracks
FOR EACH ROW
BEGIN
  DELETE FROM attribution WHERE track = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS cascade_attribution_artists
AFTER DELETE ON attribution
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM attribution
    WHERE artist = OLD.artist
  UNION ALL SELECT 1 FROM following
    WHERE artist = OLD.artist
  LIMIT 1
)
BEGIN
  DELETE FROM artists WHERE id = OLD.artist;
END;

CREATE TRIGGER IF NOT EXISTS cascade_following_artists
AFTER DELETE ON following
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM attribution
    WHERE artist = OLD.artist
  UNION ALL SELECT 1 FROM following
    WHERE artist = OLD.artist
  LIMIT 1
)
BEGIN
  DELETE FROM artists WHERE id = OLD.artist;
END;

CREATE TRIGGER IF NOT EXISTS log_playback
AFTER UPDATE OF progress ON playback
FOR EACH ROW
WHEN NEW.progress >= 1
BEGIN
  INSERT INTO feed VALUES (ABS(RANDOM() % POWER(2, 32)), 0, NEW.track);
  INSERT INTO following SELECT artist, track as seen FROM attribution
    WHERE
      EXISTS (SELECT 1 FROM following WHERE following.artist = attribution.artist)
      AND track = NEW.track;
END;