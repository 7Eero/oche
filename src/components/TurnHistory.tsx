"use client";

import { useGameStore } from "@/store/gameStore";
import { Dart } from "@/types/game";

function formatDart(dart: Dart): string {
  if (dart.segment === "BULL") return "Bull";
  if (dart.segment === "D-BULL") return "D-Bull";
  if (dart.value === 0) return "Miss";
  const prefix =
    dart.segment === "S" ? "S" : dart.segment === "D" ? "D" : "T";
  return `${prefix}${dart.value}`;
}

export function TurnHistory() {
  const players = useGameStore((s) => s.players);

  // Collect all turns across all players, sorted by occurrence
  const allTurns = players.flatMap((player) =>
    player.turns.map((turn, turnIndex) => ({
      ...turn,
      playerName: player.name,
      turnNumber: turnIndex + 1,
    }))
  );

  // Sort by appearance order: interleave player turns
  const interleavedTurns: typeof allTurns = [];
  const maxTurns = Math.max(...players.map((p) => p.turns.length), 0);

  for (let turnIdx = 0; turnIdx < maxTurns; turnIdx++) {
    for (const player of players) {
      if (turnIdx < player.turns.length) {
        interleavedTurns.push({
          ...player.turns[turnIdx],
          playerName: player.name,
          turnNumber: turnIdx + 1,
        });
      }
    }
  }

  return (
    <div className="px-4 py-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Turn History
      </h3>

      {interleavedTurns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No turns yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...interleavedTurns].reverse().map((turn, index) => (
            <div
              key={index}
              className={`glass-card px-3 py-2.5 ${
                turn.isBust ? "border-accent/30" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    R{turn.turnNumber}
                  </span>
                  <span className="text-sm font-medium text-gray-200">
                    {turn.playerName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {turn.isBust ? (
                    <span className="score-badge bg-accent/20 text-accent-light">
                      BUST
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {turn.totalScore}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    → {turn.remainingAfter}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {turn.darts.map((dart, di) => (
                  <span
                    key={di}
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      dart.segment === "T"
                        ? "bg-accent/10 text-accent-light"
                        : dart.segment === "D" || dart.segment === "D-BULL"
                          ? "bg-primary-500/10 text-primary-300"
                          : dart.segment === "BULL"
                            ? "bg-gold/10 text-gold-light"
                            : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {formatDart(dart)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
