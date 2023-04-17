import genres from "../assets/genres.json";
const r = String.raw;

const emoji = r`([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])`;
const url =
  /((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%/&=?.]+\.[a-z]{2,4}\/?([^\s<>#%",{}\\|\\^[\]`]+)?)/gi;
const separators = [
  emoji,
  "\\|",
  '"',
  "`",
  "''+",
  ":\\s",
  "\\s:",
  "-\\s",
  "\\s-",
  "--+",
  "(\\s|^)\\.+(\\s|$)",
  "\\/\\/+",
];

function unbrace(text: string) {
  const result = {
    clean: "",
    parts: [] as string[],
  };

  const opening = "[({【「";
  const closing = "])}】」";
  let current = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const opened = opening.indexOf(char);
    const closed = closing.indexOf(char);

    if (opened >= 0) {
      if (current >= 0) continue;
      current = opened;
      result.parts.push("");
      continue;
    }
    if (current == -1) {
      result.clean += char;
      continue;
    }
    if (closed == current) {
      const lastChar = result.clean[result.clean.length - 1];
      if (lastChar) {
        result.clean += " - ";
      }
      current = -1;
      continue;
    }
    if (closed >= 0) continue;
    result.parts[result.parts.length - 1] += char;
  }

  result.clean = trim(result.clean);
  result.parts = result.parts.map((x) => x.trim()).filter((x) => x);

  return result;
}

function unemojify(text: string) {
  return text.replace(new RegExp(emoji, "ig"), "");
}

function split(text: string) {
  const splits = new RegExp(separators.join("|"), "i");
  return text.replace(url, "").split(splits);
}

function trim(text: string) {
  const trim = /^[@'"`«»|—\-–/\\:\s.]+|['"`«»|—\-–/\\:\s.]+$/gi;
  return text.replace(trim, "");
}

function isJunk(text: string) {
  if (!text) return true;
  if (text.match(url)) return true;

  const junk = [
    r`album`,
    r`originals?`,
    r`of+icial?`,
    r`MV`,
    r`lyrics?`,
    r`video`,
    r`live`,
    r`only`,
    r`mix`,
    r`full`,
    r`sub(titles?)?`,
    r`quality`,
    r`(HD|HQ|[0-9]{3,4}p|4Kb)`,
    r`[0-9]{3,4}(p|bpmb)`,
    r`S[0-9]+E[0-9]+`,
    r`free`,
    r`download`,
    r`copyright`,
    r`royalty`,
    r`tutorial`,
    r`amv`,
    r`explicit`,
    r`remaster(ed)?`,
  ].map((x) => new RegExp(r`(\b|^|\s)${x}(\b|$|\s)`, "i"));

  return junk.some((x) => text.match(x));
}

function isGenre(text: string, strict = false) {
  text = text.toLowerCase();

  if (strict) return genres.some((x) => x.toLowerCase() === text);
  return genres.some((x) =>
    text.match(new RegExp(r`(\s|^)${x.toLowerCase()}(\s|$)`))
  );
}

function isJunkGenre(text: string) {
  const filter = (x: string) => new RegExp(r`(\b|^)${x}(\b|$)`, "i");
  const marks = [
    "edit",
    "rmx",
    "remix",
    "cover",
    "(piano\\s+)?arrangement",
    "edit?",
    "version(\\s+cover)?",
    "ver(\\s+cover)?",
    "cover",
    "release",
  ];

  return isGenre(text) && !marks.map(filter).find((x) => x.test(text));
}

function toYear(text: string) {
  const regex = /(^|\b)([1-2][0-9]{3})(\b|$)/;
  const match = text.match(regex);
  if (!match) return null;
  const year = +(match[0] || 0) || null;
  if (!year) return null;
  return [trim(text.replace(match[0], "")), year] as const;
}

function toArtist(text: string) {
  const postfixes = [
    "edit(ed)?",
    "rmx",
    "remix",
    "version(\\s+cover)?",
    "ver(\\s+cover)?",
    "cover",
    "dub",
    "release",
  ];
  const prefixes = [
    "edit(ed)?",
    "rmx",
    "remix(ed)?",
    "cover(ed)?",
    "performed",
    "ft\\.",
    "feat\\.?",
    "featuring",
    "med",
    "(piano\\s+)?arrangement",
    "by",
  ];

  const regexes = [];
  regexes.push(
    ...postfixes.map((x) => new RegExp(r`^(?<artist>.*?)\s+${x}(\b|$)`, "i"))
  );
  regexes.push(
    ...prefixes.map(
      (x) => new RegExp(r`(^|\b)${x}(\s+by)?\s+(?<artist>.*?)$`, "i")
    )
  );

  const artists = [];
  for (const regex of regexes) {
    const match = text.match(regex);
    const artist = match?.groups?.artist;
    if (!match || !artist) continue;
    if (isGenre(artist, true) || isJunk(artist)) continue;
    artists.unshift(artist);
    text = trim(text.replace(match[0], ""));
  }

  return [text, artists] as const;
}

function inferArtists(text?: string) {
  if (!text) return [];
  text = text.replace(/ - Topic$/i, "");
  const joins = /,|\bft\.?|\bfeat\.?|&|\+|\/|\bfeaturing|\bmed\b|\band\b/i;

  return [
    ...new Set(
      text
        .split(joins)
        .map((x) => trim(x))
        .filter((x) => x)
    ),
  ];
}

function inferTrack(text: string, artistless = false) {
  const { parts, clean } = unbrace(text);
  let atoms = [...split(clean), ...parts].filter((x) => x);
  atoms = [...new Set(atoms)];
  atoms = atoms.map((x) => trim(x)).filter((x) => x);

  let title = clean;
  let album = "";
  let year = undefined as number | undefined;
  let artists = [];
  let meta = [] as string[];

  atoms = atoms.map((x) => {
    x = unemojify(x);
    const tryYear = toYear(x);
    if (tryYear) {
      x = tryYear[0];
      year = tryYear[1];
      if (!x) return "";
    }

    const parsedArtists = toArtist(x);
    x = parsedArtists[0];
    for (const artist of parsedArtists[1]) {
      artists.push(...inferArtists(artist));
    }

    if (isJunk(x)) {
      return "";
    }

    if (parts.includes(x)) {
      meta.push(x);
      return "";
    }

    return x;
  });
  atoms = atoms.filter((x) => x);

  switch (atoms.length) {
    case 0:
      title = [...split(clean)].filter((x) => !isJunk(x)).join("; ");
      if (!title) title = clean;
      if (!title) title = parts.join("; ");
      if (!title) title = text;
      break;
    case 1:
      title = atoms[0];
      break;
    case 2:
      if (artistless) album = atoms[0];
      else artists.unshift(...inferArtists(atoms[0]));
      title = atoms[1];
      break;
    default:
      if (artistless) album = atoms[0];
      else artists.unshift(...inferArtists(atoms[0]));
      title = atoms[1];
      meta.push(...atoms.slice(2, atoms.length - 1 * +!artistless));
      if (!artistless) album = atoms[atoms.length - 1];
      break;
  }

  meta = meta.filter((x) => !isJunkGenre(x));
  artists = [...new Set(artists.map((x) => trim(x)))].sort();

  album = album || title;
  if (meta.length) title += ` (${meta.join(", ")})`;

  return {
    title,
    artists,
    album,
    year,
  };
}

export { inferTrack, inferArtists };
