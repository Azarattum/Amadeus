INSERT OR IGNORE INTO devices VALUES (crsql_siteid(), NULL, 0, 0, 0, 0);

CREATE VIEW IF NOT EXISTS queue AS
  WITH ordered AS
    (SELECT playback.*, row_number() OVER (
      ORDER BY
        CASE WHEN "direction" != 1 THEN "order" ELSE NULL END ASC,
        CASE WHEN "direction" = 1 THEN "order" ELSE NULL END DESC,
        CASE WHEN "direction" != 1 THEN "playback"."id" ELSE NULL END ASC,
        CASE WHEN "direction" = 1 THEN "playback"."id" ELSE NULL END DESC
    ) as position FROM devices INNER JOIN playback ON playback.device = devices.id
    WHERE devices.id = crsql_siteid())
  SELECT id, device, track, 
    (position - 
      (SELECT position FROM ordered WHERE id = (SELECT playback FROM devices WHERE id = device))
    ) as position
  FROM ordered;

CREATE TRIGGER IF NOT EXISTS playback_started
AFTER INSERT ON playback
FOR EACH ROW
WHEN NEW.device = crsql_siteid()
BEGIN
  UPDATE devices SET playback = NEW.id WHERE id = NEW.device AND playback IS NULL;
END;

CREATE TRIGGER IF NOT EXISTS playback_finised
BEFORE UPDATE OF progress ON devices
FOR EACH ROW
WHEN NEW.progress >= 1 AND NEW.id = crsql_siteid()
BEGIN
  UPDATE devices SET 
    playback = IFNULL((SELECT id FROM queue WHERE position = 1), playback),
    progress = 0
  WHERE id = NEW.id;
  INSERT INTO feed VALUES (ABS(RANDOM() % POWER(2, 32)), 0, (SELECT track FROM playback WHERE id = NEW.playback), 1);
  INSERT INTO following SELECT artist, track as seen FROM attribution
    WHERE
      EXISTS (SELECT 1 FROM following WHERE following.artist = attribution.artist)
      AND track = (SELECT track FROM playback WHERE id = NEW.playback);
  SELECT RAISE(IGNORE);
END;

CREATE TRIGGER IF NOT EXISTS playback_backtracked
BEFORE UPDATE OF progress ON devices
FOR EACH ROW
WHEN NEW.progress < 0 AND NEW.id = crsql_siteid()
BEGIN
  UPDATE devices SET 
    playback = IFNULL((SELECT id FROM queue WHERE position = -1), playback),
    progress = 0
  WHERE id = NEW.id;
  SELECT RAISE(IGNORE);
END;

CREATE TRIGGER IF NOT EXISTS playback_looped
BEFORE UPDATE OF progress ON devices
FOR EACH ROW
WHEN NEW.progress >= 1 AND NEW.repeat = 2 AND NEW.id = crsql_siteid() AND
  NOT EXISTS (SELECT 1 FROM queue WHERE position > 0)
BEGIN
  UPDATE devices SET 
    playback = (SELECT id FROM queue LIMIT 1),
    progress = 0
  WHERE id = NEW.id;
  SELECT RAISE(IGNORE);
END;

CREATE TRIGGER IF NOT EXISTS playback_shuffled
AFTER UPDATE OF direction ON devices
FOR EACH ROW
WHEN NEW.direction = 2 AND NEW.id = crsql_siteid()
BEGIN
  UPDATE playback SET "temp"="order" WHERE
    (SELECT id FROM queue WHERE position = 0) != id AND device = NEW.id;
  UPDATE playback SET
    "order"=(SELECT "order" FROM playback WHERE "temp" IS NULL)||hex(randomblob(2))
  WHERE "temp" IS NOT NULL;
END;

CREATE TRIGGER IF NOT EXISTS playback_unshuffled
AFTER UPDATE OF direction ON devices
FOR EACH ROW
WHEN OLD.direction = 2 AND NEW.direction != 2 AND NEW.id = crsql_siteid()
BEGIN
  UPDATE playback SET
    "order"="temp",
    "temp"=NULL
  WHERE "temp" IS NOT NULL AND device = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS playback_purged
BEFORE DELETE ON playback
FOR EACH ROW
WHEN (OLD.id = (SELECT playback FROM devices WHERE id = crsql_siteid()))
BEGIN
  UPDATE devices SET 
    playback = (SELECT id FROM queue WHERE position = 1),
    progress = 0
  WHERE id = OLD.device;
END;