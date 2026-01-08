import React from "react";

interface CoinDisplayProps {
  coins: number;
}

export const CoinDisplay: React.FC<CoinDisplayProps> = ({ coins }) => {
  return (
    <div className="coin-display">
      <div className="coin-icon" />
      <span className="font-bold text-coin text-lg">{coins}</span>
    </div>
  );
};