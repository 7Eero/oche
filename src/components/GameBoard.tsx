"use client";

import { useGameStore } from "@/store/gameStore";
import { Scoreboard } from "@/components/Scoreboard";
import { ScoreInput } from "@/components/ScoreInput";
import { TurnHistory } from "@/components/TurnHistory";
import { getCheckoutSuggestions } from "@/lib/checkouts";
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

  // Static checkout suggestion
  const currentRemaining = currentTurnDarts.length < 3 ? projectedRemaining : currentPlayer.remaining;
  const checkoutSuggestions = getCheckoutSuggestions(currentRemaining);
  const topCheckout =
    currentRemaining <= 170 && currentRemaining >= 2 && checkoutSuggestions.length > 0
      ? checkoutSuggestions[0].darts.join(" → ")
      : null;

  function formatDart(dart: Dart): string {
    if (dart.segment === "BULL") return "Bull";
    if (dart.segment === "D-BULL") return "D-Bull";
    if (dart.score === 0) return "Miss";
    const prefix = dart.segment === "S" ? "" : dart.segment;
    return `${prefix}${dart.value}`;
  }

  function getDartBadgeStyle(dart: Dart): string {
    switch (dart.segment) {
      case "T":
        return "bg-accent text-white border-accent shadow-sm shadow-accent/40";
      case "D":
      case "D-BULL":
        return "bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/40";
      case "BULL":
        return "bg-gold text-surface-950 font-black border-gold";
      default:
        return dart.score === 0
          ? "bg-gray-800 text-gray-400 border-gray-700"
          : "bg-surface-accent text-gray-100 border-white/10";
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-between max-w-lg mx-auto w-full select-none pb-2">
      {/* Header - Fixed 48px */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
        <button onClick={resetGame} className="btn-ghost !px-2.5 !py-1 text-xs">
          ← Exit
        </button>
        <h1 className="text-sm font-bold text-gray-300">
          {players.length === 1
            ? `${startingScore} Solo Training`
            : `${startingScore} Double Out`}
        </h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-ghost !px-2.5 !py-1 text-xs"
        >
          {showHistory ? "Board" : "History"}
        </button>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto">
          <TurnHistory />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          {/* Top Section: Scoreboard & Turn Card */}
          <div>
            {/* Scoreboard - Fixed Height Container */}
            <Scoreboard />

            {/* Current Turn Info - STRICTLY FIXED HEIGHT & PADDING */}
            <div className="px-4 py-2">
              <div className="glass-card p-3.5 border border-white/10">
                {/* Row 1: Player & Score */}
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      {players.length === 1
                        ? `${currentPlayer.name} • Turn ${currentPlayer.turns.length + 1}`
                        : `${currentPlayer.name}'s Turn`}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white leading-tight">
                        {currentTurnDarts.length < 3 && !gameFinished
                          ? projectedRemaining
                          : currentPlayer.remaining}
                      </span>
                      <span className="text-sm font-bold h-5 inline-block text-primary-400">
                        {turnScore > 0 ? `(-${turnScore})` : ""}
                      </span>
                    </div>
                  </div>

                  {/* 3 Dart indicator dots */}
                  <div className="flex items-center gap-1.5 bg-surface-dark/70 px-2.5 py-1.5 rounded-full border border-white/5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                          i < currentTurnDarts.length
                            ? "bg-primary-500 shadow-sm shadow-primary-500"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Row 2: Fixed Checkout Route Slot (Always exactly 26px height) */}
                <div className="h-[26px] flex items-center mb-2.5 text-xs overflow-hidden">
                  {topCheckout ? (
                    <div className="flex items-center gap-1.5 text-primary-300 font-semibold bg-primary-500/10 px-2 py-0.5 rounded-md border border-primary-500/20 w-full truncate">
                      <span>🎯 Finish:</span>
                      <span className="font-mono text-primary-200">{topCheckout}</span>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-[11px] px-1 font-medium">
                      🎯 Target: Setup score
                    </div>
                  )}
                </div>

                {/* Row 3: 3 Fixed Dart Slots (Never wraps, never resizes) */}
                <div className="grid grid-cols-3 gap-2 h-9 mb-2.5">
                  {[0, 1, 2].map((i) => {
                    const dart = currentTurnDarts[i];
                    if (dart) {
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-center rounded-lg font-bold text-xs border ${getDartBadgeStyle(
                            dart
                          )}`}
                        >
                          {formatDart(dart)} ({dart.score})
                        </div>
                      );
                    }
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-center rounded-lg text-xs text-gray-500 border border-white/5 bg-surface-dark/40 font-medium"
                      >
                        Dart {i + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Row 4: Static Action Buttons (Always 40px height, always same positions) */}
                <div className="grid grid-cols-2 gap-2 h-10">
                  <button
                    onClick={undoLastDart}
                    disabled={currentTurnDarts.length === 0}
                    className="btn-ghost border border-white/10 !py-2 text-xs font-semibold disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    ↩ Undo
                  </button>
                  <button
                    onClick={nextPlayer}
                    disabled={!turnFinalized}
                    className={`!py-2 text-xs font-bold rounded-xl transition-all ${
                      turnFinalized
                        ? "btn-primary shadow-lg shadow-primary-500/30"
                        : "bg-surface-dark/60 text-gray-500 border border-white/5 cursor-not-allowed"
                    }`}
                  >
                    {players.length === 1 ? "Next Turn →" : "Next Player →"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Permanent Score Input Keypad (NEVER UNMOUNTS) */}
          <div className="px-4 pb-2 flex-shrink-0">
            <ScoreInput disabled={turnFinalized} />
          </div>
        </div>
      )}
    </div>
  );
}
