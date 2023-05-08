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

CREATE TRIGGER IF NOT EXISTS tracks_fts_insert BEFORE INSERT ON tracks BEGIN
  INSERT INTO tracks_fts(rowid,title,album,artists)
    SELECT NEW.id, NEW.title, albums.title, group_concat(artists.title)
    FROM albums
      INNER JOIN attribution ON attribution.album = albums.id
      INNER JOIN artists ON artists.id = attribution.artist
    WHERE albums.id = NEW.album;
END;

CREATE TRIGGER IF NOT EXISTS tracks_fts_delete BEFORE DELETE ON tracks BEGIN
  INSERT INTO tracks_fts(tracks_fts,rowid,title,album,artists)
    SELECT 'delete', OLD.id, OLD.title, albums.title, group_concat(artists.title)
    FROM albums
      INNER JOIN attribution ON attribution.album = albums.id
      INNER JOIN artists ON artists.id = attribution.artist
    WHERE albums.id = OLD.album;
END;

CREATE TRIGGER IF NOT EXISTS albums_fts_insert BEFORE INSERT ON albums BEGIN
  INSERT INTO albums_fts(rowid,title,artists)
    SELECT NEW.id, NEW.title, group_concat(artists.title)
    FROM attribution
      INNER JOIN artists ON artists.id = attribution.artist
    WHERE attribution.album = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS albums_fts_delete BEFORE DELETE ON albums BEGIN
  INSERT INTO albums_fts(albums_fts,rowid,title,artists)
    SELECT 'delete', OLD.id, OLD.title, group_concat(artists.title)
    FROM attribution
      INNER JOIN artists ON artists.id = attribution.artist
    WHERE attribution.album = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS artists_fts_insert BEFORE INSERT ON artists BEGIN
  INSERT INTO artists_fts(rowid,title) VALUES (NEW.id, NEW.title);
END;

CREATE TRIGGER IF NOT EXISTS artists_fts_delete BEFORE DELETE ON artists BEGIN
  INSERT INTO artists_fts(artists_fts,rowid,title) VALUES ('delete', OLD.id, OLD.title);
END;