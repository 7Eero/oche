"use client";

import { useGameStore } from "@/store/gameStore";

export function Scoreboard() {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);

  return (
    <div className="px-4 pt-3">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {players.map((player, index) => {
          const isCurrent = index === currentPlayerIndex;
          return (
            <div
              key={player.id}
              className={`flex-shrink-0 rounded-xl p-3 min-w-[120px] h-[86px] transition-all duration-300 ${
                isCurrent
                  ? "glass-card-accent animate-pulse-glow"
                  : "glass-card opacity-70"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                )}
                <p
                  className={`text-xs font-medium truncate ${
                    isCurrent ? "text-primary-300" : "text-gray-400"
                  }`}
                >
                  {player.name}
                </p>
              </div>
              <p
                className={`text-2xl font-bold leading-tight ${
                  isCurrent
                    ? "text-white text-shadow-glow"
                    : "text-gray-300"
                }`}
              >
                {player.remaining}
              </p>
              <div className="flex items-center gap-2 mt-1 h-3.5">
                <span className="text-[10px] text-gray-500">
                  Avg: {player.average.toFixed(1)}
                </span>
                {player.highestTurn > 0 ? (
                  <span className="text-[10px] text-gold-light font-medium">
                    ↑{player.highestTurn}
                  </span>
                ) : (
                  <span className="text-[10px] text-transparent select-none">
                    ↑0
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
