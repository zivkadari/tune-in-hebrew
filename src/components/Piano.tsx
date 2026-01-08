import React from "react";

interface PianoProps {
  activeKeys: number[];
}

export const Piano: React.FC<PianoProps> = ({ activeKeys }) => {
  // Create 14 white keys (2 octaves)
  const whiteKeys = Array.from({ length: 14 }, (_, i) => i);
  
  // Black keys positions relative to white keys (0-indexed)
  // Pattern: C#, D#, skip, F#, G#, A#, skip, repeat
  const blackKeyPositions = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-t from-piano-black/50 to-transparent pt-4 pb-2">
      <div className="relative flex justify-center">
        {/* White keys */}
        <div className="flex">
          {whiteKeys.map((keyIndex) => (
            <div
              key={`white-${keyIndex}`}
              className={`
                h-24 sm:h-32 w-7 sm:w-9 
                rounded-b-md border-x border-b border-border/20
                transition-all duration-75
                ${activeKeys.includes(keyIndex) 
                  ? "bg-gradient-to-b from-piano-active to-coin-glow shadow-lg shadow-piano-active/50 scale-y-[0.97] origin-top" 
                  : "bg-gradient-to-b from-piano-white to-piano-white/90"
                }
              `}
            />
          ))}
        </div>
        
        {/* Black keys overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex">
          {whiteKeys.slice(0, -1).map((keyIndex) => {
            const hasBlackKey = blackKeyPositions.includes(keyIndex);
            
            if (!hasBlackKey) {
              return <div key={`spacer-${keyIndex}`} className="w-7 sm:w-9" />;
            }
            
            const blackKeyIndex = 14 + blackKeyPositions.indexOf(keyIndex);
            
            return (
              <div key={`black-${keyIndex}`} className="w-7 sm:w-9 flex justify-center">
                <div
                  className={`
                    h-14 sm:h-20 w-4 sm:w-5 
                    rounded-b-md z-10
                    transition-all duration-75
                    ${activeKeys.includes(blackKeyIndex)
                      ? "bg-gradient-to-b from-accent to-accent/70 shadow-lg shadow-accent/50 scale-y-[0.95] origin-top"
                      : "bg-gradient-to-b from-piano-black to-piano-black/90"
                    }
                  `}
                  style={{ marginTop: "2px" }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
