import fs from "node:fs/promises";
import path from "node:path";

const fixturePath = path.join(
  process.cwd(),
  "scripts",
  "fixtures",
  "platform-links-approved.ts"
);
const reportPath = path.join(
  process.cwd(),
  "scripts",
  "reports",
  "youtube-links-audit.md"
);

const readFixture = async () => {
  const source = await fs.readFile(fixturePath, "utf8");
  const match = source.match(
    /export const approvedPlatformLinksFixture = (\[[\s\S]*?\]) satisfies/
  );

  if (!match) {
    throw new Error("Could not parse approvedPlatformLinksFixture");
  }

  return JSON.parse(match[1]);
};

const videoIdFromUrl = (url) => {
  const parsed = new URL(url);

  if (parsed.hostname.includes("youtu.be")) {
    return parsed.pathname.slice(1);
  }

  return parsed.searchParams.get("v") || "";
};

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[\u200e\u200f]/g, "")
    .replace(/[\-–—|:()[\]׳״"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getOembed = async (url) => {
  const response = await fetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
};

const escapeCell = (value) =>
  String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");

const preFixWrongTargetIdBySongId = new Map([
  [2, 30],
  ...Array.from({ length: 28 }, (_, index) => {
    const songId = index + 3;
    return [songId, songId - 1];
  }),
]);

const audit = async () => {
  const fixture = await readFixture();
  const fixtureById = new Map(fixture.map((song) => [song.id, song]));
  const results = [];

  for (const song of fixture) {
    let metadata = null;
    let error = "";

    try {
      metadata = await getOembed(song.youtubeUrl);
    } catch (caught) {
      error = String(caught.message || caught);
    }

    const actualVideoId = videoIdFromUrl(song.youtubeUrl);
    const actualTitle = metadata?.title || "";
    const actualAuthor = metadata?.author_name || "";
    const expectedSong = normalize(song.songName);
    const expectedArtist = normalize(song.artistName);
    const normalizedTitle = normalize(actualTitle);
    const normalizedAuthor = normalize(actualAuthor);
    const videoIdMatches = actualVideoId === song.youtubeVideoId;
    const titleMatchesSong = normalizedTitle.includes(expectedSong);
    const authorMatchesArtist =
      normalizedAuthor.includes(expectedArtist) ||
      normalizedTitle.includes(expectedArtist) ||
      actualAuthor.toLowerCase().includes("topic");
    const storedMetadataMatches =
      actualTitle === song.youtubeVerifiedTitle &&
      actualAuthor === song.youtubeVerifiedAuthor;

    let status = "correct";

    if (error) {
      status = "unavailable";
    } else if (!videoIdMatches || !titleMatchesSong) {
      status = "wrong song";
    } else if (!authorMatchesArtist || !storedMetadataMatches) {
      status = "uncertain";
    }

    results.push({
      ...song,
      actualVideoId,
      actualTitle,
      actualAuthor,
      status,
      error,
    });

    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  const counts = results.reduce((accumulator, result) => {
    accumulator[result.status] = (accumulator[result.status] || 0) + 1;
    return accumulator;
  }, {});

  const lines = [];
  lines.push("# YouTube Links Content Audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    "Source: `scripts/fixtures/platform-links-approved.ts`, which is synchronized by explicit song ID with the Google Sheet."
  );
  lines.push(
    "Method: fetched YouTube oEmbed metadata for every `youtubeUrl`, checked the expected video ID, and compared the actual video title/channel against the verified audit metadata."
  );
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Correct links: ${counts.correct || 0}`);
  lines.push(`- Wrong-song links: ${counts["wrong song"] || 0}`);
  lines.push(`- Unavailable links: ${counts.unavailable || 0}`);
  lines.push(`- Uncertain links: ${counts.uncertain || 0}`);
  lines.push("");
  lines.push("## Pre-fix findings and verified corrections");
  lines.push("");
  lines.push(
    "The original Google Sheet `youtube_url` values for IDs 2–30 formed a closed shifted cycle: ID 2 opened ID 30, and IDs 3–30 each opened the previous song ID. The replacement URLs below were verified by YouTube oEmbed metadata before being applied by explicit Song_num/ID."
  );
  lines.push("");
  lines.push(
    "| ID | Expected song | Expected artist | Pre-fix URL opened | Pre-fix actual video title | Pre-fix actual author/channel | Status | Verified replacement URL |"
  );
  lines.push("| ---: | --- | --- | --- | --- | --- | --- | --- |");

  for (const [songId, wrongTargetId] of preFixWrongTargetIdBySongId) {
    const song = fixtureById.get(songId);
    const wrongTarget = fixtureById.get(wrongTargetId);

    lines.push(
      `| ${songId} | ${escapeCell(song.songName)} | ${escapeCell(
        song.artistName
      )} | ${escapeCell(wrongTarget.youtubeUrl)} | ${escapeCell(
        wrongTarget.youtubeVerifiedTitle
      )} | ${escapeCell(
        wrongTarget.youtubeVerifiedAuthor
      )} | wrong song | ${escapeCell(song.youtubeUrl)} |`
    );
  }

  lines.push("");
  lines.push("## Audit table");
  lines.push("");
  lines.push(
    "| ID | Expected song | Expected artist | YouTube URL | Expected video ID | Actual video title | Actual video author/channel | Status |"
  );
  lines.push("| ---: | --- | --- | --- | --- | --- | --- | --- |");

  for (const result of results) {
    lines.push(
      `| ${result.id} | ${escapeCell(result.songName)} | ${escapeCell(
        result.artistName
      )} | ${escapeCell(result.youtubeUrl)} | ${escapeCell(
        result.youtubeVideoId
      )} | ${escapeCell(result.actualTitle || result.error)} | ${escapeCell(
        result.actualAuthor
      )} | ${escapeCell(result.status)} |`
    );
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(`YouTube links audit report: ${reportPath}`);
  console.log(`Correct links: ${counts.correct || 0}`);
  console.log(`Wrong-song links: ${counts["wrong song"] || 0}`);
  console.log(`Unavailable links: ${counts.unavailable || 0}`);
  console.log(`Uncertain links: ${counts.uncertain || 0}`);

  if ((counts["wrong song"] || 0) > 0 || (counts.unavailable || 0) > 0) {
    process.exitCode = 1;
  }
};

await audit();
