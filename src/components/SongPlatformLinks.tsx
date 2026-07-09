import React from "react";
import { ExternalLink, Music2, Youtube } from "lucide-react";

interface SongPlatformLinksProps {
  songName: string;
  artistName: string;
  youtubeUrl?: string;
  youtubeVerified?: boolean;
  youtubeSearchUrl?: string;
  appleMusicUrl?: string;
  spotifyUrl?: string;
  spotifyStatus?: string;
  className?: string;
  compact?: boolean;
}

const isSafeExternalUrl = (url?: string): url is string => {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    return false;
  }
};

const getYouTubeHref = ({
  songName,
  artistName,
  youtubeUrl,
  youtubeVerified,
  youtubeSearchUrl,
}: Pick<
  SongPlatformLinksProps,
  "songName" | "artistName" | "youtubeUrl" | "youtubeVerified" | "youtubeSearchUrl"
>) => {
  if (youtubeVerified && isSafeExternalUrl(youtubeUrl)) {
    return youtubeUrl;
  }

  if (isSafeExternalUrl(youtubeSearchUrl)) {
    return youtubeSearchUrl;
  }

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${artistName} ${songName} official`
  )}`;
};

const isVerifiedSpotifyLink = (spotifyUrl?: string, spotifyStatus?: string) => {
  if (!isSafeExternalUrl(spotifyUrl)) return false;
  if (!spotifyStatus) return false;

  return spotifyStatus.trim().toLowerCase() === "verified";
};

export const SongPlatformLinks: React.FC<SongPlatformLinksProps> = ({
  songName,
  artistName,
  youtubeUrl,
  youtubeVerified,
  youtubeSearchUrl,
  appleMusicUrl,
  spotifyUrl,
  spotifyStatus,
  className = "",
  compact = false,
}) => {
  const youtubeHref = getYouTubeHref({
    songName,
    artistName,
    youtubeUrl,
    youtubeVerified,
    youtubeSearchUrl,
  });
  const appleMusicHref = isSafeExternalUrl(appleMusicUrl) ? appleMusicUrl : null;
  const spotifyHref = isVerifiedSpotifyLink(spotifyUrl, spotifyStatus)
    ? spotifyUrl
    : null;

  const baseClassName = compact
    ? "flex min-w-[9rem] flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-md shadow-black/15 transition-all duration-200 active:scale-[0.98]"
    : "w-full flex items-center justify-center gap-3 rounded-2xl border px-6 py-4 font-bold shadow-lg shadow-black/20 transition-all duration-200 active:scale-[0.98]";

  return (
    <div className={`flex ${compact ? "flex-wrap" : "flex-col"} gap-3 w-full ${className}`}>
      <a
        href={youtubeHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClassName} border-primary/35 bg-gradient-to-b from-primary/10 to-black/20 text-foreground`}
        aria-label={`פתח ביוטיוב: ${artistName} – ${songName}`}
      >
        <Youtube className="h-5 w-5 text-red-500" fill="currentColor" aria-hidden="true" />
        <span>פתח ביוטיוב</span>
      </a>

      {appleMusicHref && (
        <a
          href={appleMusicHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClassName} border-pink-400/35 bg-gradient-to-b from-pink-500/15 to-black/20 text-foreground`}
          aria-label={`פתח באפל מיוזיק: ${artistName} – ${songName}`}
        >
          <Music2 className="h-5 w-5 text-pink-400" aria-hidden="true" />
          <span>אפל מיוזיק</span>
        </a>
      )}

      {spotifyHref && (
        <a
          href={spotifyHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClassName} border-green-400/35 bg-gradient-to-b from-green-500/15 to-black/20 text-foreground`}
          aria-label={`פתח בספוטיפיי: ${artistName} – ${songName}`}
        >
          <ExternalLink className="h-5 w-5 text-green-400" aria-hidden="true" />
          <span>ספוטיפיי</span>
        </a>
      )}
    </div>
  );
};
