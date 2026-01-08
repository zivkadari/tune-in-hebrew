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
    <div className="w-full flex justify-center">
      <div className="relative flex">
        {/* White keys */}
        {whiteKeys.map((keyIndex) => (
          <div
            key={`white-${keyIndex}`}
            className={`
              h-20 sm:h-24 w-6 sm:w-8 
              rounded-b-lg border-x border-b transition-all duration-75
              ${activeKeys.includes(keyIndex) 
                ? "scale-y-[0.97] origin-top" 
                : ""
              }
            `}
            style={{
              background: activeKeys.includes(keyIndex)
                ? 'linear-gradient(to bottom, hsl(42 100% 55%), hsl(42 100% 65%))'
                : 'linear-gradient(to bottom, hsl(45 25% 96%), hsl(45 20% 90%))',
              borderColor: 'hsl(230 30% 25% / 0.2)',
              boxShadow: activeKeys.includes(keyIndex)
                ? '0 4px 12px hsl(42 100% 50% / 0.5)'
                : 'inset 0 -2px 4px hsl(230 30% 80% / 0.3)'
            }}
          />
        ))}
        
        {/* Black keys overlay */}
        <div className="absolute top-0 left-0 right-0 flex">
          {whiteKeys.slice(0, -1).map((keyIndex) => {
            const hasBlackKey = blackKeyPositions.includes(keyIndex);
            
            if (!hasBlackKey) {
              return <div key={`spacer-${keyIndex}`} className="w-6 sm:w-8" />;
            }
            
            const blackKeyIndex = 14 + blackKeyPositions.indexOf(keyIndex);
            const isActive = activeKeys.includes(blackKeyIndex);
            
            return (
              <div key={`black-${keyIndex}`} className="w-6 sm:w-8 flex justify-end">
                <div
                  className={`
                    h-12 sm:h-14 w-4 sm:w-5 
                    rounded-b-md z-10 -mr-2 sm:-mr-2.5
                    transition-all duration-75
                    ${isActive ? "scale-y-[0.95] origin-top" : ""}
                  `}
                  style={{
                    background: isActive
                      ? 'linear-gradient(to bottom, hsl(210 90% 55%), hsl(210 85% 45%))'
                      : 'linear-gradient(to bottom, hsl(230 50% 15%), hsl(230 45% 10%))',
                    boxShadow: isActive
                      ? '0 4px 12px hsl(210 90% 50% / 0.5)'
                      : '0 2px 4px hsl(230 50% 5% / 0.5)'
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};