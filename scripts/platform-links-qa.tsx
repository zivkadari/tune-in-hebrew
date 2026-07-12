import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import { levels } from "@/data/levels";
import { songCoverMetadataById } from "@/data/songCoverMetadata";
import { SongPlatformLinks } from "@/components/SongPlatformLinks";
import { SuccessScreen } from "@/screens/SuccessScreen";
import { OfflinePartyRound } from "@/screens/OfflinePartyRound";

type AnchorMap = {
  youtube?: string;
  spotify?: string;
  appleMusic?: string;
};

const expectedYoutubeUrlsById: Record<number, string> = {
  1: "https://www.youtube.com/watch?v=oKLLyDOczbY",
  2: "https://www.youtube.com/watch?v=kmW2yAYhMmM",
  3: "https://www.youtube.com/watch?v=_xsI9tgyj1A",
  4: "https://www.youtube.com/watch?v=bhNYlOt00uw",
  5: "https://www.youtube.com/watch?v=ZOf7aMbzQAM",
  6: "https://www.youtube.com/watch?v=7nVoHd4iFuw",
  7: "https://www.youtube.com/watch?v=990F-bdP_k4",
  8: "https://www.youtube.com/watch?v=jlCNqyY-fAk",
  9: "https://www.youtube.com/watch?v=isCbysjdcQ0",
  10: "https://www.youtube.com/watch?v=dZWlObNQoZ4",
  11: "https://www.youtube.com/watch?v=lf72w9CMB-I",
  12: "https://www.youtube.com/watch?v=GQWKEP0qOfE",
  13: "https://www.youtube.com/watch?v=6U_5KhaH6IM",
  14: "https://www.youtube.com/watch?v=Iay1xdXljb4",
  15: "https://www.youtube.com/watch?v=ImMFBmqIPOc",
  16: "https://www.youtube.com/watch?v=zRIn7W-kXhs",
  17: "https://www.youtube.com/watch?v=qvdQ4mGMVkg",
  18: "https://www.youtube.com/watch?v=pzAmYC7Xxtw",
  19: "https://www.youtube.com/watch?v=yRZm0shwfw8",
  20: "https://www.youtube.com/watch?v=aAManNYfWgU",
  21: "https://www.youtube.com/watch?v=K1nQX_hdop0",
  22: "https://www.youtube.com/watch?v=bzZtDkMueUA",
  23: "https://www.youtube.com/watch?v=qBPYU93OkOs",
  24: "https://www.youtube.com/watch?v=qF0gBrO4gIY",
  25: "https://www.youtube.com/watch?v=mv_JuLI-8lk",
  26: "https://www.youtube.com/watch?v=g0fsM6Elu5c",
  27: "https://www.youtube.com/watch?v=bbsMP75sPws",
  28: "https://www.youtube.com/watch?v=SGIYmCdtbzg",
  29: "https://www.youtube.com/watch?v=NeD0QwiLkdY",
  30: "https://www.youtube.com/watch?v=kJnOQQ815LQ",
  31: "https://www.youtube.com/watch?v=x7wrPEatuk4",
  32: "https://www.youtube.com/watch?v=RsErNvzEQ5I",
  33: "https://www.youtube.com/watch?v=ARKJfrMM29E",
  34: "https://www.youtube.com/watch?v=32oVRcayvSU",
  35: "https://www.youtube.com/watch?v=yjE8RgR4m-c",
  36: "https://www.youtube.com/watch?v=hYQcf8H8yJE",
  37: "https://www.youtube.com/watch?v=Dcvm3PpOuiA",
  38: "https://www.youtube.com/watch?v=WaO47gh0fVw",
  39: "https://www.youtube.com/watch?v=9JTgv3QV6bI",
  40: "https://www.youtube.com/watch?v=PMKjbR5LQKo",
  41: "https://www.youtube.com/watch?v=NpSosoi5biU",
  42: "https://www.youtube.com/watch?v=wOSyYscrXLE",
  43: "https://www.youtube.com/watch?v=EsyWY3MWApQ",
  44: "https://www.youtube.com/watch?v=wSQCw8IEjOA",
  45: "https://www.youtube.com/watch?v=23-PoqDc7yM",
  46: "https://www.youtube.com/watch?v=zFtMTQMJtp0",
  47: "https://www.youtube.com/watch?v=kBLdR1J8Je4",
  48: "https://www.youtube.com/watch?v=kzMZO0H-rEU",
  49: "https://www.youtube.com/watch?v=3w3VtH2AcDU",
  50: "https://www.youtube.com/watch?v=82Mr8O7TUfI",
  51: "https://www.youtube.com/watch?v=7k-A8mQ7Hmo",
  52: "https://www.youtube.com/watch?v=pRQX6Xp2B48",
  53: "https://www.youtube.com/watch?v=VfIJSc6KWWk",
  54: "https://www.youtube.com/watch?v=HqqrOod1fK4",
  55: "https://www.youtube.com/watch?v=24qN5CxA758",
};

const fail = (message: string): never => {
  throw new Error(message);
};

const assert = (condition: unknown, message: string) => {
  if (!condition) fail(message);
};

const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const extractAnchors = (html: string): AnchorMap => {
  const hrefs = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) =>
    decodeHtml(match[1])
  );

  return {
    youtube: hrefs.find((href) => href.includes("youtube.com/")),
    spotify: hrefs.find((href) => href.includes("open.spotify.com/")),
    appleMusic: hrefs.find((href) => href.includes("music.apple.com/")),
  };
};

const assertNoPlatformLinks = (html: string, label: string) => {
  const anchors = extractAnchors(html);
  assert(!anchors.youtube, `${label}: YouTube link rendered before reveal`);
  assert(!anchors.spotify, `${label}: Spotify link rendered before reveal`);
  assert(!anchors.appleMusic, `${label}: Apple Music link rendered before reveal`);
};

const expectedYoutubeHref = (level: (typeof levels)[number]) => {
  if (level.youtubeVerified && level.youtubeUrl) return level.youtubeUrl;
  if (level.youtubeSearchUrl) return level.youtubeSearchUrl;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${level.artistName} ${level.songName} official`
  )}`;
};

const assertRenderedLinks = (
  html: string,
  level: (typeof levels)[number],
  mode: "Classic" | "Party"
) => {
  assert(
    html.includes(level.songName),
    `${mode} ID ${level.id}: displayed song name is missing`
  );
  assert(
    html.includes(level.artistName),
    `${mode} ID ${level.id}: displayed artist name is missing`
  );

  const anchors = extractAnchors(html);
  assert(
    anchors.youtube === expectedYoutubeHref(level),
    `${mode} ID ${level.id}: YouTube href mismatch. Expected ${expectedYoutubeHref(
      level
    )}, got ${anchors.youtube}`
  );
  assert(
    anchors.spotify === level.spotifyUrl,
    `${mode} ID ${level.id}: Spotify href mismatch. Expected ${level.spotifyUrl}, got ${anchors.spotify}`
  );

  if (level.appleMusicUrl) {
    assert(
      anchors.appleMusic === level.appleMusicUrl,
      `${mode} ID ${level.id}: Apple Music href mismatch. Expected ${level.appleMusicUrl}, got ${anchors.appleMusic}`
    );
  } else {
    assert(!anchors.appleMusic, `${mode} ID ${level.id}: unexpected Apple Music link`);
  }
};

const renderClassic = (level: (typeof levels)[number]) =>
  renderToStaticMarkup(
    <SuccessScreen
      songNumber={level.id}
      stageNumber={1}
      totalLevels={levels.length}
      coins={0}
      songName={level.songName}
      artistName={level.artistName}
      coverArtUrl={level.coverArtUrl}
      coverVerified={level.coverVerified}
      youtubeUrl={level.youtubeUrl}
      youtubeVerified={level.youtubeVerified}
      youtubeSearchUrl={level.youtubeSearchUrl}
      appleMusicUrl={level.appleMusicUrl}
      spotifyUrl={level.spotifyUrl}
      spotifyStatus={level.spotifyStatus}
      onNextLevel={() => {}}
      onHome={() => {}}
      isLastLevel={level.id === levels.length}
      isLastSongInStage={false}
      usedHints={false}
      isFirstTimeCompletion={true}
    />
  );

const renderParty = (level: (typeof levels)[number], isRevealed = true) =>
  renderToStaticMarkup(
    <OfflinePartyRound
      currentRound={1}
      totalRounds={1}
      currentSong={level}
      players={[
        { id: "one", name: "שחקן 1", score: 0 },
        { id: "two", name: "שחקן 2", score: 0 },
      ]}
      questionType="song"
      isRevealed={isRevealed}
      onReveal={() => {}}
      onAwardPoint={() => {}}
      onNextRound={() => {}}
      onQuit={() => {}}
    />
  );

const auditStaticCatalog = () => {
  assert(levels.length === 55, `Expected 55 levels, found ${levels.length}`);

  const ids = levels.map((level) => level.id);
  const uniqueIds = new Set(ids);
  assert(uniqueIds.size === 55, "Level IDs are not unique");
  for (let id = 1; id <= 55; id += 1) {
    assert(uniqueIds.has(id), `Missing level ID ${id}`);
    assert(songCoverMetadataById[id], `Missing metadata ID ${id}`);
  }

  const metadataIds = Object.keys(songCoverMetadataById).map(Number);
  assert(
    metadataIds.length === 55 && new Set(metadataIds).size === 55,
    "Metadata IDs are missing or duplicated"
  );

  for (const level of levels) {
    const metadata = songCoverMetadataById[level.id];
    assert(
      level.youtubeUrl === metadata.youtubeUrl,
      `ID ${level.id}: level YouTube URL does not match metadata by ID`
    );
    assert(
      level.spotifyUrl === metadata.spotifyUrl,
      `ID ${level.id}: level Spotify URL does not match metadata by ID`
    );
    assert(
      level.appleMusicUrl === metadata.appleMusicUrl,
      `ID ${level.id}: level Apple Music URL does not match metadata by ID`
    );
    assert(
      level.youtubeUrl === expectedYoutubeUrlsById[level.id],
      `ID ${level.id}: YouTube URL points to the wrong song. Expected ${expectedYoutubeUrlsById[level.id]}, got ${level.youtubeUrl}`
    );
  }

  const duplicateYoutubeUrls = findDuplicates(levels.map((level) => level.youtubeUrl));
  const duplicateSpotifyUrls = findDuplicates(levels.map((level) => level.spotifyUrl));
  assert(
    duplicateYoutubeUrls.length === 0,
    `Duplicate YouTube URLs found: ${duplicateYoutubeUrls.join(", ")}`
  );
  assert(
    duplicateSpotifyUrls.length === 0,
    `Duplicate Spotify URLs found: ${duplicateSpotifyUrls.join(", ")}`
  );

  const levelsSource = fs.readFileSync(
    path.join(process.cwd(), "src", "data", "levels.ts"),
    "utf-8"
  );
  assert(
    levelsSource.includes("songCoverMetadataById[level.id]"),
    "levels.ts must merge metadata by explicit level.id"
  );
};

const findDuplicates = (values: Array<string | undefined>) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
};

const auditPlatformGates = () => {
  const html = renderToStaticMarkup(
    <SongPlatformLinks
      songName="בדיקה"
      artistName="אמן"
      youtubeUrl="https://www.youtube.com/watch?v=direct12345"
      youtubeVerified={false}
      youtubeSearchUrl="https://www.youtube.com/results?search_query=fallback"
      appleMusicUrl={undefined}
      spotifyUrl="https://open.spotify.com/track/spotify123"
      spotifyStatus="unverified"
    />
  );
  const anchors = extractAnchors(html);
  assert(
    anchors.youtube === "https://www.youtube.com/results?search_query=fallback",
    "youtubeVerified=false should use YouTube search fallback"
  );
  assert(!anchors.spotify, "spotifyStatus!=verified should hide Spotify link");
  assert(!anchors.appleMusic, "Missing appleMusicUrl should hide Apple Music link");
};

const auditRenderedModes = () => {
  for (const level of levels) {
    assertRenderedLinks(renderClassic(level), level, "Classic");
    assertRenderedLinks(renderParty(level), level, "Party");
  }

  assertNoPlatformLinks(renderParty(levels[0], false), "Party unrevealed answer");
};

const auditRegressionIdsSixAndSeven = () => {
  const rolex = levels.find((level) => level.id === 6);
  const masaUmatan = levels.find((level) => level.id === 7);
  assert(rolex, "Missing ID 6");
  assert(masaUmatan, "Missing ID 7");

  assert(rolex!.songName === "רולקס וקסקט", "ID 6 song name changed");
  assert(masaUmatan!.songName === "מסע ומתן", "ID 7 song name changed");
  assert(
    rolex!.youtubeUrl === "https://www.youtube.com/watch?v=7nVoHd4iFuw",
    `ID 6 YouTube URL is wrong: ${rolex!.youtubeUrl}`
  );
  assert(
    masaUmatan!.youtubeUrl === "https://www.youtube.com/watch?v=990F-bdP_k4",
    `ID 7 YouTube URL is wrong: ${masaUmatan!.youtubeUrl}`
  );
  assert(rolex!.youtubeUrl !== masaUmatan!.youtubeUrl, "IDs 6 and 7 share YouTube URLs");
  assert(
    extractAnchors(renderClassic(rolex!)).youtube === rolex!.youtubeUrl,
    "Classic ID 6 rendered YouTube href mismatch"
  );
  assert(
    extractAnchors(renderClassic(masaUmatan!)).youtube === masaUmatan!.youtubeUrl,
    "Classic ID 7 rendered YouTube href mismatch"
  );
  assert(
    extractAnchors(renderParty(rolex!)).youtube === rolex!.youtubeUrl,
    "Party ID 6 rendered YouTube href mismatch"
  );
  assert(
    extractAnchors(renderParty(masaUmatan!)).youtube === masaUmatan!.youtubeUrl,
    "Party ID 7 rendered YouTube href mismatch"
  );
};

auditStaticCatalog();
auditPlatformGates();
auditRenderedModes();
auditRegressionIdsSixAndSeven();

console.log("Platform links QA passed");
console.log(`Songs checked: ${levels.length}`);
console.log("Classic rendered href audit: passed");
console.log("Party rendered href audit: passed");
console.log("ID 6/7 regression: passed");
