import { useEffect, useState } from "react";
import { Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SongCoverArtProps {
  songName: string;
  artistName: string;
  coverArtUrl?: string;
  coverVerified?: boolean;
  className?: string;
}

export const SongCoverArt = ({
  songName,
  artistName,
  coverArtUrl,
  coverVerified,
  className,
}: SongCoverArtProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [coverArtUrl]);

  const showVerifiedCover = Boolean(
    coverVerified && coverArtUrl && !imageFailed
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-card shadow-2xl",
        className
      )}
    >
      {showVerifiedCover ? (
        <img
          src={coverArtUrl}
          alt={`עטיפת השיר ${songName} מאת ${artistName}`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/25 via-card to-success/15 px-3 text-center"
          role="img"
          aria-label={`עטיפה זמנית לשיר ${songName} מאת ${artistName}`}
        >
          <Disc3 className="h-12 w-12 text-primary/80" aria-hidden="true" />
          <span className="text-xs font-medium leading-tight text-muted-foreground">
            עטיפה תתווסף בהמשך
          </span>
        </div>
      )}
    </div>
  );
};
