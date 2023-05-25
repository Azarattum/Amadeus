CREATE VIRTUAL TABLE IF NOT EXISTS tracks_fts USING fts5 (
  title,
  album,
  artists,
  content='',
  tokenize='trigram'
);

CREATE VIRTUAL TABLE IF NOT EXISTS albums_fts USING fts5 (
  title,
  artists,
  content='',
  tokenize='trigram'
);

CREATE VIRTUAL TABLE IF NOT EXISTS artists_fts USING fts5 (
  title,
  content='',
  tokenize='trigram'
);

---------------------------- Artists Triggers ----------------------------
CREATE TRIGGER IF NOT EXISTS fts_artists_insert AFTER INSERT ON artists BEGIN
  -- Update artists index
  INSERT INTO artists_fts(rowid,title) VALUES (NEW.id, NEW.title);
  -- Update albums index
  INSERT INTO albums_fts(albums_fts,rowid,title,artists)
    SELECT 'delete', albums.id, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist AND artists.id != NEW.id)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
    WHERE attribution.artist = NEW.id;
  INSERT INTO albums_fts(rowid,title,artists)
    SELECT albums.id, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
    WHERE attribution.artist = NEW.id;
  -- Update tracks index
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', tracks.id, tracks.title,
      CASE WHEN EXISTS (SELECT 1 FROM artists WHERE artists.id = attribution.artist AND artists.id != NEW.id) THEN albums.title ELSE NULL END,
      (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist AND artists.id != NEW.id)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.artist = NEW.id;
  INSERT INTO tracks_fts(rowid,title,album,artists)
    SELECT tracks.id, tracks.title, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.artist = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS fts_artists_update AFTER UPDATE OF title ON artists WHEN (OLD.title IS NOT NEW.title) BEGIN
  -- Update artists index
  INSERT INTO artists_fts(artists_fts,rowid,title) VALUES ('delete', OLD.id, OLD.title);
  INSERT INTO artists_fts(rowid,title) VALUES (NEW.id, NEW.title);
  -- Update albums index
  INSERT INTO albums_fts(albums_fts,rowid,title,artists)
    SELECT 'delete', albums.id, albums.title, (SELECT group_concat(CASE WHEN artists.id = OLD.id THEN OLD.title ELSE title END) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
    WHERE attribution.artist = OLD.id;
  INSERT INTO albums_fts(rowid,title,artists)
    SELECT albums.id, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
    WHERE attribution.artist = NEW.id;
  -- Update tracks index
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', tracks.id, tracks.title, albums.title, (SELECT group_concat(CASE WHEN artists.id = OLD.id THEN OLD.title ELSE title END) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.artist = OLD.id;
  INSERT INTO tracks_fts(rowid,title,album,artists)
    SELECT tracks.id, tracks.title, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.artist = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS fts_artists_delete BEFORE DELETE ON artists BEGIN
  -- Update artists index
  INSERT INTO artists_fts(artists_fts,rowid,title) VALUES ('delete', OLD.id, OLD.title);
  -- Update albums index
  INSERT INTO albums_fts(albums_fts,rowid,title,artists)
    SELECT 'delete', albums.id, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
    WHERE attribution.artist = OLD.id;
  -- Update tracks index
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', tracks.id, tracks.title, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.artist = OLD.id;
END;

---------------------------- Albums Triggers ----------------------------
CREATE TRIGGER IF NOT EXISTS fts_albums_insert AFTER INSERT ON albums BEGIN
  -- Update albums index
  INSERT INTO albums_fts(rowid,title,artists)
    SELECT NEW.id, NEW.title, group_concat(artists.title)
    FROM attribution
      INNER JOIN artists ON artists.id = attribution.artist
    WHERE attribution.album = NEW.id;
  -- Update tracks index
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', tracks.id, tracks.title, NULL, NULL
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.album = NEW.id;
  INSERT INTO tracks_fts(rowid,title,album,artists)
    SELECT tracks.id, tracks.title, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.album = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS albums_fts_update AFTER UPDATE OF title ON albums WHEN (OLD.title IS NOT NEW.title) BEGIN
  -- Update albums index
  INSERT INTO albums_fts(albums_fts,rowid,title,artists)
    SELECT 'delete', OLD.id, OLD.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
    WHERE attribution.album = OLD.id;
  INSERT INTO albums_fts(rowid,title,artists)
    SELECT NEW.id, NEW.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
    WHERE attribution.album = OLD.id;
  -- Update tracks index
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', tracks.id, tracks.title, OLD.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN tracks ON tracks.album = attribution.album
    WHERE attribution.album = OLD.id;
  INSERT INTO tracks_fts(rowid,title,album,artists)
    SELECT tracks.id, tracks.title, NEW.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN tracks ON tracks.album = attribution.album
    WHERE attribution.album = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS albums_fts_delete BEFORE DELETE ON albums BEGIN
  -- Update albums index
  INSERT INTO albums_fts(albums_fts,rowid,title,artists)
    SELECT 'delete', OLD.id, OLD.title, group_concat(artists.title)
    FROM attribution
      INNER JOIN artists ON artists.id = attribution.artist
    WHERE attribution.album = OLD.id
    GROUP BY OLD.id;
  -- Update tracks index
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', tracks.id, tracks.title, OLD.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN tracks ON tracks.album = attribution.album
    WHERE attribution.album = OLD.id;
END;

---------------------------- Attribution Triggers ----------------------------
CREATE TRIGGER IF NOT EXISTS fts_attribution_insert AFTER INSERT ON attribution
  WHEN EXISTS (SELECT 1 FROM artists WHERE id = NEW.artist) AND EXISTS (SELECT 1 FROM albums WHERE id = NEW.album)
BEGIN
  -- Update albums index
  INSERT INTO albums_fts(albums_fts,rowid,title,artists)
    SELECT 'delete', albums.id, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist AND artists.id != NEW.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
    WHERE attribution.album = NEW.album AND attribution.artist = NEW.artist;
  INSERT INTO albums_fts(rowid,title,artists)
    SELECT albums.id, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
    WHERE attribution.album = NEW.album AND attribution.artist = NEW.artist;
  -- Update tracks index
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', tracks.id, tracks.title, NULL, NULL
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.album = NEW.album AND attribution.artist = NEW.artist;
  INSERT INTO tracks_fts(rowid,title,album,artists)
    SELECT  tracks.id, tracks.title, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.album = NEW.album AND attribution.artist = NEW.artist;
END;

CREATE TRIGGER IF NOT EXISTS fts_attribution_delete BEFORE DELETE ON attribution BEGIN
  -- Update albums index
  INSERT INTO albums_fts(albums_fts,rowid,title,artists)
    SELECT 'delete', albums.id, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
    WHERE attribution.album = OLD.album AND attribution.artist = OLD.artist;
  -- Update tracks index
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', tracks.id, tracks.title, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM attribution
      INNER JOIN albums ON albums.id = attribution.album
      INNER JOIN tracks ON tracks.album = albums.id
    WHERE attribution.album = OLD.album AND attribution.artist = OLD.artist;
END;

---------------------------- Tracks Triggers ----------------------------
CREATE TRIGGER IF NOT EXISTS fts_tracks_insert AFTER INSERT ON tracks BEGIN
  INSERT INTO tracks_fts(rowid,title,album,artists)
    SELECT NEW.id, NEW.title, albums.title, group_concat(artists.title)
    FROM albums
      INNER JOIN attribution ON attribution.album = albums.id
      INNER JOIN artists ON artists.id = attribution.artist
    WHERE albums.id = NEW.album;
END;

CREATE TRIGGER IF NOT EXISTS fts_tracks_update AFTER UPDATE OF title ON tracks WHEN (OLD.title IS NOT NEW.title) BEGIN
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', OLD.id, OLD.title, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM albums
      INNER JOIN attribution ON attribution.album = albums.id
    WHERE albums.id = OLD.album;
  INSERT INTO tracks_fts(rowid,title,album,artists)
    SELECT NEW.id, NEW.title, albums.title, (SELECT group_concat(title) FROM artists WHERE artists.id = attribution.artist)
    FROM albums
      INNER JOIN attribution ON attribution.album = albums.id
    WHERE albums.id = NEW.album;
END;

CREATE TRIGGER IF NOT EXISTS fts_tracks_delete BEFORE DELETE ON tracks BEGIN
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', OLD.id, OLD.title, albums.title, group_concat(artists.title)
    FROM albums
      INNER JOIN attribution ON attribution.album = albums.id
      INNER JOIN artists ON artists.id = attribution.artist
    WHERE albums.id = OLD.album
    GROUP BY OLD.id;
END;