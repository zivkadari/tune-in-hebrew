import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import { levels } from "@/data/levels";
import { songCoverMetadataById } from "@/data/songCoverMetadata";
import { SongPlatformLinks } from "@/components/SongPlatformLinks";
import { SuccessScreen } from "@/screens/SuccessScreen";
import { OfflinePartyRound } from "@/screens/OfflinePartyRound";
import { approvedPlatformLinksFixture } from "./fixtures/platform-links-approved";

type AnchorMap = {
  youtube?: string;
  spotify?: string;
  appleMusic?: string;
};

type Level = (typeof levels)[number];
type ApprovedFixture = (typeof approvedPlatformLinksFixture)[number];

const fail = (message: string): never => {
  throw new Error(message);
};

const assert = (condition: unknown, message: string) => {
  if (!condition) fail(message);
};

const fixtureById = new Map<number, ApprovedFixture>(
  approvedPlatformLinksFixture.map((fixture) => [fixture.id, fixture])
);

const knownCatalogArtistAliasesById: Record<number, string> = {
  45: "יפית",
  48: "חן אהרוני ואסתי",
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

const youtubeVideoIdFromUrl = (url: string) => {
  const parsed = new URL(url);

  if (parsed.hostname.includes("youtu.be")) {
    return parsed.pathname.slice(1);
  }

  return parsed.searchParams.get("v") ?? "";
};

const assertNoPlatformLinks = (html: string, label: string) => {
  const anchors = extractAnchors(html);
  assert(!anchors.youtube, `${label}: YouTube link rendered before reveal`);
  assert(!anchors.spotify, `${label}: Spotify link rendered before reveal`);
  assert(!anchors.appleMusic, `${label}: Apple Music link rendered before reveal`);
};

const expectedYoutubeHref = (level: Level) => {
  if (level.youtubeVerified && level.youtubeUrl) return level.youtubeUrl;
  if (level.youtubeSearchUrl) return level.youtubeSearchUrl;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${level.artistName} ${level.songName} official`
  )}`;
};

const assertRenderedLinks = (
  html: string,
  level: Level,
  fixture: ApprovedFixture,
  mode: "Classic" | "Party"
) => {
  assert(
    html.includes(fixture.songName),
    `${mode} ID ${level.id}: displayed song name is missing. Expected ${fixture.songName}`
  );
  assert(
    html.includes(level.artistName),
    `${mode} ID ${level.id}: displayed artist name is missing. Expected ${level.artistName}`
  );

  const anchors = extractAnchors(html);
  assert(
    anchors.youtube === expectedYoutubeHref(level),
    `${mode} ID ${level.id}: YouTube href mismatch. Expected ${expectedYoutubeHref(
      level
    )}, got ${anchors.youtube}`
  );
  assert(
    anchors.youtube === fixture.youtubeUrl,
    `${mode} ID ${level.id}: rendered YouTube href does not match approved fixture. Expected ${fixture.youtubeUrl}, got ${anchors.youtube}`
  );
  assert(
    youtubeVideoIdFromUrl(anchors.youtube ?? "") === fixture.youtubeVideoId,
    `${mode} ID ${level.id}: rendered YouTube video ID does not match verified fixture. Expected ${fixture.youtubeVideoId}, got ${youtubeVideoIdFromUrl(
      anchors.youtube ?? ""
    )}`
  );
  assert(
    anchors.spotify === fixture.spotifyUrl,
    `${mode} ID ${level.id}: Spotify href mismatch. Expected ${fixture.spotifyUrl}, got ${anchors.spotify}`
  );

  if (fixture.appleMusicUrl) {
    assert(
      anchors.appleMusic === fixture.appleMusicUrl,
      `${mode} ID ${level.id}: Apple Music href mismatch. Expected ${fixture.appleMusicUrl}, got ${anchors.appleMusic}`
    );
  } else {
    assert(!anchors.appleMusic, `${mode} ID ${level.id}: unexpected Apple Music link`);
  }
};

const renderClassic = (level: Level) =>
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

const renderParty = (level: Level, isRevealed = true) =>
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

const assertFixtureIntegrity = () => {
  assert(
    approvedPlatformLinksFixture.length === 55,
    `Expected 55 fixture rows, found ${approvedPlatformLinksFixture.length}`
  );
  assert(
    fixtureById.size === 55,
    "Fixture IDs are duplicated or missing"
  );

  for (let id = 1; id <= 55; id += 1) {
    assert(fixtureById.has(id), `Approved fixture is missing ID ${id}`);
  }

  const duplicateYoutubeUrls = findDuplicates(
    approvedPlatformLinksFixture.map((fixture) => fixture.youtubeUrl)
  );
  const duplicateSpotifyUrls = findDuplicates(
    approvedPlatformLinksFixture.map((fixture) => fixture.spotifyUrl)
  );
  assert(
    duplicateYoutubeUrls.length === 0,
    `Approved fixture has duplicate YouTube URLs: ${duplicateYoutubeUrls.join(", ")}`
  );
  assert(
    duplicateSpotifyUrls.length === 0,
    `Approved fixture has duplicate Spotify URLs: ${duplicateSpotifyUrls.join(", ")}`
  );

  assert(
    fixtureById.get(2)?.youtubeUrl === "https://www.youtube.com/watch?v=kmW2yAYhMmM",
    `Fixture ID 2 YouTube URL is wrong: ${fixtureById.get(2)?.youtubeUrl}`
  );
  assert(
    fixtureById.get(6)?.youtubeUrl === "https://www.youtube.com/watch?v=7nVoHd4iFuw",
    `Fixture ID 6 YouTube URL is wrong: ${fixtureById.get(6)?.youtubeUrl}`
  );
  assert(
    fixtureById.get(7)?.youtubeUrl === "https://www.youtube.com/watch?v=990F-bdP_k4",
    `Fixture ID 7 YouTube URL is wrong: ${fixtureById.get(7)?.youtubeUrl}`
  );
  assert(
    fixtureById.get(30)?.youtubeUrl === "https://www.youtube.com/watch?v=kJnOQQ815LQ",
    `Fixture ID 30 YouTube URL is wrong: ${fixtureById.get(30)?.youtubeUrl}`
  );

  for (const fixture of approvedPlatformLinksFixture) {
    assert(fixture.youtubeVideoId, `Fixture ID ${fixture.id}: missing verified video ID`);
    assert(
      fixture.youtubeVideoId === youtubeVideoIdFromUrl(fixture.youtubeUrl),
      `Fixture ID ${fixture.id}: youtubeVideoId does not match youtubeUrl`
    );
    assert(
      fixture.youtubeVerifiedTitle.includes(fixture.songName),
      `Fixture ID ${fixture.id}: verified YouTube title does not include song name`
    );
    assert(
      fixture.youtubeVerifiedAuthor,
      `Fixture ID ${fixture.id}: missing verified YouTube author/channel`
    );
  }
};

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
    const fixture = fixtureById.get(level.id);
    assert(fixture, `Approved fixture is missing ID ${level.id}`);

    assert(
      level.songName === fixture!.songName,
      `ID ${level.id}: level song name does not match approved fixture. Expected ${fixture!.songName}, got ${level.songName}`
    );
        const expectedCatalogArtist = knownCatalogArtistAliasesById[level.id] ?? fixture!.artistName;
    assert(
      level.artistName === expectedCatalogArtist,
      `ID ${level.id}: level artist does not match approved fixture or documented catalog alias. Expected ${expectedCatalogArtist}, got ${level.artistName}`
    );

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

    assert(level.youtubeVerified === true, `ID ${level.id}: youtubeVerified must be true`);
    assert(level.spotifyStatus === "verified", `ID ${level.id}: spotifyStatus must be verified`);
    assert(
      level.youtubeUrl === fixture!.youtubeUrl,
      `ID ${level.id}: YouTube URL does not match approved fixture. Expected ${fixture!.youtubeUrl}, got ${level.youtubeUrl}`
    );
    assert(
      level.spotifyUrl === fixture!.spotifyUrl,
      `ID ${level.id}: Spotify URL does not match approved fixture. Expected ${fixture!.spotifyUrl}, got ${level.spotifyUrl}`
    );
    assert(
      level.appleMusicUrl === fixture!.appleMusicUrl,
      `ID ${level.id}: Apple Music URL does not match approved fixture. Expected ${fixture!.appleMusicUrl}, got ${level.appleMusicUrl}`
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
    const fixture = fixtureById.get(level.id);
    assert(fixture, `Approved fixture is missing ID ${level.id}`);
    assertRenderedLinks(renderClassic(level), level, fixture!, "Classic");
    assertRenderedLinks(renderParty(level), level, fixture!, "Party");
  }

  assertNoPlatformLinks(renderParty(levels[0], false), "Party unrevealed answer");
};

const auditRegressionIdsSixAndSeven = () => {
  const rolex = levels.find((level) => level.id === 6);
  const masaUmatan = levels.find((level) => level.id === 7);
  const rolexFixture = fixtureById.get(6);
  const masaFixture = fixtureById.get(7);
  assert(rolex, "Missing ID 6");
  assert(masaUmatan, "Missing ID 7");
  assert(rolexFixture, "Missing fixture ID 6");
  assert(masaFixture, "Missing fixture ID 7");

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
  assert(rolexFixture!.youtubeVideoId === "7nVoHd4iFuw", "ID 6 video ID is wrong");
  assert(masaFixture!.youtubeVideoId === "990F-bdP_k4", "ID 7 video ID is wrong");
  assert(
    rolexFixture!.youtubeVerifiedTitle.includes("רולקס וקסקט"),
    "ID 6 verified YouTube title does not match רולקס וקסקט"
  );
  assert(
    masaFixture!.youtubeVerifiedTitle.includes("מסע ומתן"),
    "ID 7 verified YouTube title does not match מסע ומתן"
  );
  assert(rolex!.youtubeUrl === rolexFixture!.youtubeUrl, "ID 6 does not match approved fixture");
  assert(masaUmatan!.youtubeUrl === masaFixture!.youtubeUrl, "ID 7 does not match approved fixture");
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

assertFixtureIntegrity();
auditStaticCatalog();
auditPlatformGates();
auditRenderedModes();
auditRegressionIdsSixAndSeven();

console.log("Platform links QA passed");
console.log(`Songs checked: ${levels.length}`);
console.log("Classic rendered href audit: passed");
console.log("Party rendered href audit: passed");
console.log("ID 6/7 regression: passed");
