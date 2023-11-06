import { inferArtists, inferTrack } from "./infer";
import { expect, it } from "vitest";

it("infers tracks", () => {
  let val = inferTrack(
    "Game of Thrones Theme Song - Karliene Version Cover (Oh La Lau) (Lyrics)",
  );
  expect(val.title).toBe("Game of Thrones Theme Song (Oh La Lau)");
  expect(val.artists).toEqual(["Karliene"]);

  val = inferTrack(
    "Lau - Game of Thrones Theme - Karliene Version Cover (Audio Only)",
  );
  expect(val.title).toBe("Game of Thrones Theme");
  expect(val.artists).toEqual(["Karliene", "Lau"]);

  val = inferTrack(
    "Karliene & Celtic Borders - You Win or You Die - Game of Thrones",
  );
  expect(val.title).toBe("You Win or You Die");
  expect(val.artists).toEqual(["Celtic Borders", "Karliene"]);
  expect(val.album).toBe("Game of Thrones");

  val = inferTrack('"Pollution" by Tom Lehrer');
  expect(val.title).toBe("Pollution");
  expect(val.artists).toEqual(["Tom Lehrer"]);

  val = inferTrack("Man with no name - Teleport (Original mix). HQ");
  expect(val.title).toBe("Teleport");
  expect(val.artists).toEqual(["Man with no name"]);

  val = inferTrack("Varg  — Under Beige Nylon");
  expect(val.title).toBe("Under Beige Nylon");
  expect(val.artists).toEqual(["Varg"]);

  val = inferTrack("varg - under beige nylon - 46bpm");
  expect(val.title).toBe("under beige nylon");
  expect(val.artists).toEqual(["varg"]);

  val = inferTrack("Falling in drop C.");
  expect(val.title).toBe("Falling in drop C");
  expect(val.artists).toEqual([]);

  val = inferTrack("Voodoo People - Quadsep - 1995");
  expect(val.year).toBe(1995);
  expect(val.title).toBe("Quadsep");
  expect(val.artists).toEqual(["Voodoo People"]);

  val = inferTrack("Teste - The Wipe (5am Synaptic) - Plus 8 Records - 1992");
  expect(val.year).toBe(1992);
  expect(val.title).toBe("The Wipe (5am Synaptic)");
  expect(val.artists).toEqual(["Teste"]);
  expect(val.album).toBe("Plus 8 Records");

  val = inferTrack(
    "Varg | I Did Not Always Appear This Way [Ascetic House 2015]",
  );
  expect(val.year).toBe(2015);
  expect(val.title).toBe("I Did Not Always Appear This Way");
  expect(val.artists).toEqual(["Varg"]);

  val = inferTrack("Pig&Dan -The Saint Job San (Lee Van Dowski Remix)");
  expect(val.title).toBe("The Saint Job San");
  expect(val.artists).toEqual(["Dan", "Lee Van Dowski", "Pig"]);

  val = inferTrack(
    "Ambi Sessions 12/11 {Ambient Techno-Tribal-Dub Techno-Meditative}",
  );
  expect(val.title).toBe("Ambi Sessions 12/11");
  expect(val.artists).toEqual([]);

  val = inferTrack("PILLDRIVER // PITCH HIKER");
  expect(val.title).toBe("PITCH HIKER");
  expect(val.artists).toEqual(["PILLDRIVER"]);

  val = inferTrack("Wu-Tang Clan -- One Blood instrumental");
  expect(val.title).toBe("One Blood instrumental");
  expect(val.artists).toEqual(["Wu-Tang Clan"]);

  val = inferTrack('Mobb Deep "Peer Pressure"');
  expect(val.title).toBe("Peer Pressure");
  expect(val.artists).toEqual(["Mobb Deep"]);

  val = inferTrack("The Prodigy - Voodoo People ( Parasense Rmx )");
  expect(val.title).toBe("Voodoo People");
  expect(val.artists).toEqual(["Parasense", "The Prodigy"]);

  val = inferTrack('Giselle "Silk" Favored Nations Remix');
  expect(val.title).toBe("Silk");
  expect(val.artists).toEqual(["Favored Nations", "Giselle"]);

  val = inferTrack("WITCHER 3 SONG- Wake The White Wolf By Miracle Of Sound");
  expect(val.title).toBe("Wake The White Wolf");
  expect(val.artists).toEqual(["Miracle Of Sound", "WITCHER 3 SONG"]);

  val = inferTrack(
    "Miracle Of Sound - The Call - Elder Scrolls Online Song [pleer.com]",
  );
  expect(val.title).toBe("The Call");
  expect(val.artists).toEqual(["Miracle Of Sound"]);
  expect(val.album).toBe("Elder Scrolls Online Song");

  val = inferTrack("Ambitiously Yours - S6E5 - New Friends and a Funeral");
  expect(val.title).toBe("New Friends and a Funeral");
  expect(val.artists).toEqual(["Ambitiously Yours"]);

  val = inferTrack("Party in Peril: The Celestial Odyssey 06 (Oficial Audio)");
  expect(val.title).toBe("The Celestial Odyssey 06");
  expect(val.artists).toEqual(["Party in Peril"]);

  val = inferTrack("Abandoned - Out Of The Grave (Feat. ENROSA) [NCS Release]");
  expect(val.title).toBe("Out Of The Grave");
  expect(val.artists).toEqual(["Abandoned", "ENROSA", "NCS"]);

  val = inferTrack("Ali Sethi | Rung (Official Music Video)");
  expect(val.title).toBe("Rung");
  expect(val.artists).toEqual(["Ali Sethi"]);

  val = inferTrack(
    "Bruno Mars, Anderson .Paak, Silk Sonic - Leave the Door Open [Official Video]",
  );
  expect(val.title).toBe("Leave the Door Open");
  expect(val.artists).toEqual(["Anderson .Paak", "Bruno Mars", "Silk Sonic"]);

  val = inferTrack(
    "Galasy ZMesta - Ya Nauchu Tebya (I'll Teach You) - Belarus - Official Video - Eurovision 2021",
  );
  expect(val.title).toBe("Ya Nauchu Tebya (I'll Teach You, Belarus)");
  expect(val.year).toBe(2021);
  expect(val.album).toBe("Eurovision");
  expect(val.artists).toEqual(["Galasy ZMesta"]);

  val = inferTrack(
    "Game Of Thrones Theme (Music Box Vocal Version -- Cover of Karliene Lyrics)",
  );
  expect(val.title).toBe("Game Of Thrones Theme");
  expect(val.artists).toEqual(["Music Box Vocal"]);

  val = inferTrack(
    "🎵MiatriSs🎵 - Yandere Song (The Original Song) [Русская Версия] + ENG Subtitles",
  );
  expect(val.title).toBe("Yandere Song (Русская Версия)");
  expect(val.artists).toEqual(["MiatriSs"]);

  val = inferTrack(
    "【Helltaker Original Song】 What the Hell by @OR3O , @Lollia  , and @Sleeping Forest   ft. Friends",
  );
  expect(val.title).toBe("What the Hell");
  expect(val.artists).toEqual(["Friends", "Lollia", "OR3O", "Sleeping Forest"]);

  val = inferTrack("Splatoon ★ Blitz It (Remix\\Cover) | MiatriSs");
  expect(val.title).toBe("Blitz It (Remix\\Cover)");
  expect(val.artists).toEqual(["Splatoon"]);
  expect(val.album).toEqual("MiatriSs");

  val = inferTrack("ECHO【Gumi English】Crusher-P: MiatriSs Remix");
  expect(val.title).toBe("Crusher-P (Gumi English)");
  expect(val.artists).toEqual(["ECHO", "MiatriSs"]);

  val = inferTrack(
    "Endless Mistakes Cover - check out the original at https://soundcloud.com/",
  );
  expect(val.title).toBe("Endless Mistakes Cover");
  expect(val.album).toBe("Endless Mistakes Cover");
  expect(val.artists).toEqual(["Endless Mistakes"]);

  val = inferTrack("Rihanna - The Monster (NO RAP/NO EMINEM) Edit +Lyrics");
  expect(val.title).toBe("The Monster (NO RAP/NO EMINEM)");
  expect(val.artists).toEqual(["Rihanna"]);

  val = inferTrack(
    "Fall - Ross Bugden ''Piano Tutorial'' (Piano Arrangement by AnubisMusic)",
  );
  expect(val.title).toBe("Ross Bugden");
  expect(val.album).toBe("Ross Bugden");
  expect(val.artists).toEqual(["AnubisMusic", "Fall"]);

  val = inferTrack("Karliene. - Elizabeth");
  expect(val.title).toBe("Elizabeth");
  expect(val.artists).toEqual(["Karliene"]);

  val = inferTrack(
    "My Darkest Days - Porn Star Dancing (Rock Version) ft. Zakk Wylde (Official Video)",
  );
  expect(val.title).toBe("Porn Star Dancing (Rock Version)");
  expect(val.album).toBe("Porn Star Dancing");
  expect(val.artists).toEqual(["My Darkest Days", "Zakk Wylde"]);

  val = inferTrack("Epic Trailer Music - Fall", true);
  expect(val.title).toBe("Fall");
  expect(val.album).toBe("Epic Trailer Music");
  expect(val.artists).toEqual([]);

  val = inferTrack("Epic Trailer Music - Fall - Nice Thing", true);
  expect(val.title).toBe("Fall (Nice Thing)");
  expect(val.album).toBe("Epic Trailer Music");
  expect(val.artists).toEqual([]);

  val = inferTrack(
    "Epic and Dramatic Trailer Music - Olympus (Copyright and Royalty Free)",
    true,
  );
  expect(val.title).toBe("Olympus");
  expect(val.album).toBe("Epic and Dramatic Trailer Music");
  expect(val.artists).toEqual([]);

  val = inferTrack('I:Scintilla - "Swimmers Can Drown" OFFICIAL VIDEO');
  expect(val.title).toBe("Swimmers Can Drown");
  expect(val.album).toBe("Swimmers Can Drown");
  expect(val.artists).toEqual(["I:Scintilla"]);

  val = inferTrack(
    "The Pretty Reckless - Make Me Wanna Die (Acoustic Version)",
  );
  expect(val.title).toBe("Make Me Wanna Die (Acoustic Version)");
  expect(val.album).toBe("Make Me Wanna Die");
  expect(val.artists).toEqual(["The Pretty Reckless"]);

  val = inferTrack("Rock - Rock Song - Under a Rock");
  expect(val.title).toBe("Rock Song");
  expect(val.album).toBe("Under a Rock");
  expect(val.artists).toEqual(["Rock"]);

  val = inferTrack("Nice song http://example.com");
  expect(val.title).toBe("Nice song");

  val = inferTrack(
    "Time's Up (feat. Jonas, Ts3 & T-Bear) feat. Jonas,Ts3,T-Bear",
  );
  expect(val.title).toBe("Time's Up");
  expect(val.artists).toEqual(["Jonas", "T-Bear", "Ts3"]);
});

it("infers artists", () => {
  expect(inferArtists("A & B")).toEqual(["A", "B"]);
  expect(inferArtists("A,B ,C feat. D")).toEqual(["A", "B", "C", "D"]);
  expect(inferArtists("A + 1")).toEqual(["A", "1"]);
  expect(inferArtists("lol/KEK")).toEqual(["lol", "KEK"]);
  expect(inferArtists("0///A+B,feat.D")).toEqual(["0", "A", "B", "D"]);
  expect(inferArtists("Amedoand and ft Smb")).toEqual(["Amedoand", "Smb"]);
});
