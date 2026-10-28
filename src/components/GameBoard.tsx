"use client";

import { useGameStore } from "@/store/gameStore";
import { Scoreboard } from "@/components/Scoreboard";
import { ScoreInput } from "@/components/ScoreInput";
import { CheckoutHint } from "@/components/CheckoutHint";
import { TurnHistory } from "@/components/TurnHistory";
import { useState } from "react";
import { Dart } from "@/types/game";

export function GameBoard() {
  const startingScore = useGameStore((s) => s.startingScore) || 501;
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const currentTurnDarts = useGameStore((s) => s.currentTurnDarts);
  const gameFinished = useGameStore((s) => s.gameFinished);
  const nextPlayer = useGameStore((s) => s.nextPlayer);
  const undoLastDart = useGameStore((s) => s.undoLastDart);
  const resetGame = useGameStore((s) => s.resetGame);
  const [showHistory, setShowHistory] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  if (!currentPlayer) return null;

  const turnScore = currentTurnDarts.reduce((sum, d) => sum + d.score, 0);
  const projectedRemaining = currentPlayer.remaining - turnScore;
  const turnFinalized = currentTurnDarts.length === 3;

  function formatDart(dart: Dart): string {
    if (dart.segment === "BULL") return "Bull";
    if (dart.segment === "D-BULL") return "D-Bull";
    const prefix =
      dart.segment === "S" ? "" : dart.segment === "D" ? "D" : "T";
    return `${prefix}${dart.value}`;
  }

  function getDartColor(dart: Dart): string {
    switch (dart.segment) {
      case "T":
        return "bg-accent/80 text-white";
      case "D":
      case "D-BULL":
        return "bg-primary-500/80 text-white";
      case "BULL":
        return "bg-gold/80 text-white";
      default:
        return "bg-surface-accent/60 text-gray-200";
    }
  }

  return (
    <div className="min-h-dvh flex flex-col pb-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button onClick={resetGame} className="btn-ghost !px-2 !py-1 text-xs">
          ← Exit
        </button>
        <h1 className="text-sm font-semibold text-gray-400">
          {players.length === 1
            ? `${startingScore} Solo Training`
            : `${startingScore} Double Out`}
        </h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-ghost !px-2 !py-1 text-xs"
        >
          {showHistory ? "Board" : "History"}
        </button>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto">
          <TurnHistory />
        </div>
      ) : (
        <>
          {/* Scoreboard */}
          <Scoreboard />

          {/* Current Turn Info */}
          <div className="px-4 py-3">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    {players.length === 1
                      ? `${currentPlayer.name} • Turn ${currentPlayer.turns.length + 1}`
                      : `${currentPlayer.name}'s Turn`}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      {currentTurnDarts.length < 3 &&
                      !gameFinished
                        ? projectedRemaining
                        : currentPlayer.remaining}
                    </span>
                    {turnScore > 0 && (
                      <span className="text-sm text-primary-400 font-medium">
                        (-{turnScore})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < currentTurnDarts.length
                          ? "bg-primary-500 shadow-lg shadow-primary-500/50"
                          : "bg-surface-dark/60 border border-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Darts thrown this turn */}
              <div className="flex gap-2 min-h-[36px]">
                {currentTurnDarts.map((dart, i) => (
                  <span
                    key={i}
                    className={`score-badge ${getDartColor(dart)} animate-scale-in`}
                  >
                    {formatDart(dart)} ({dart.score})
                  </span>
                ))}
                {currentTurnDarts.length === 0 && !gameFinished && (
                  <span className="text-sm text-gray-500 italic">
                    Throw your first dart...
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {!gameFinished && (
                <div className="flex gap-2 mt-3">
                  {currentTurnDarts.length > 0 && (
                    <button
                      onClick={undoLastDart}
                      className="btn-ghost !py-1.5 !px-3 text-sm border border-white/10"
                    >
                      ↩ Undo
                    </button>
                  )}
                  {turnFinalized && (
                    <button
                      onClick={nextPlayer}
                      className="btn-primary flex-1 !py-2 text-sm animate-scale-in"
                    >
                      {players.length === 1 ? "Next Turn →" : "Next Player →"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Checkout Hint */}
          {!gameFinished && (
            <CheckoutHint
              remaining={
                currentTurnDarts.length < 3
                  ? projectedRemaining
                  : currentPlayer.remaining
              }
              dartsLeft={3 - currentTurnDarts.length}
            />
          )}

          {/* Score Input */}
          {!gameFinished && !turnFinalized && (
            <div className="flex-1 px-4 pb-4">
              <ScoreInput />
            </div>
          )}
        </>
      )}
    </div>
  );
}
