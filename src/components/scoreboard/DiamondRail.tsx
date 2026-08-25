import React from 'react';

interface DiamondRailProps {
  currentTurn: 1 | 2;
}

export const DiamondRail: React.FC<DiamondRailProps> = ({ currentTurn }) => {
  // 7 sight diamonds along the center vertical rail
  const diamonds = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="relative flex flex-col items-center justify-between py-6 px-1 h-full select-none">
      {/* Center rail guideline */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-line-strong" />

      {diamonds.map((num, idx) => {
        // Upper diamonds light up for P1, lower diamonds light up for P2, or all glow active color
        const isP1Lit = currentTurn === 1 && idx <= 3;
        const isP2Lit = currentTurn === 2 && idx >= 3;

        let diamondClass = 'billiard-diamond ';
        if (isP1Lit) {
          diamondClass += 'active-p1';
        } else if (isP2Lit) {
          diamondClass += 'active-p2';
        }

        return (
          <div
            key={num}
            className={`relative z-10 ${diamondClass}`}
            style={{
              transform: `rotate(45deg) scale(${isP1Lit || isP2Lit ? 1.25 : 1})`,
            }}
          />
        );
      })}
    </div>
  );
};
