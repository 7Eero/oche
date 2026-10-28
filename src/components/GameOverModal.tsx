"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { MatchDetails } from "@/components/MatchDetails";

export function GameOverModal() {
  const [showDetails, setShowDetails] = useState(false);
  const gameId = useGameStore((s) => s.id);
  const players = useGameStore((s) => s.players);
  const winnerId = useGameStore((s) => s.winnerId);
  const resetGame = useGameStore((s) => s.resetGame);
  const setupPlayers = useGameStore((s) => s.setupPlayers);

  const winner = players.find((p) => p.id === winnerId);

  const handleRematch = () => {
    // Keep same players, start new game
    const store = useGameStore.getState();
    const playerNames = store.players.map((p) => ({
      id: p.id,
      name: p.name,
    }));

    useGameStore.setState({
      id: "",
      players: [],
      currentPlayerIndex: 0,
      currentTurnDarts: [],
      gameStarted: false,
      gameFinished: false,
      winnerId: null,
      startedAt: "",
      finishedAt: null,
      setupPlayers: playerNames,
    });

    // Then immediately start
    setTimeout(() => {
      useGameStore.getState().startGame();
    }, 50);
  };

  if (showDetails && gameId) {
    return (
      <div className="fixed inset-0 bg-surface-900 z-50 overflow-y-auto">
        <MatchDetails gameId={gameId} onBack={() => setShowDetails(false)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Confetti */}
      <div className="pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="confetti-particle" />
        ))}
      </div>

      <div className="glass-card w-full max-w-md p-6 animate-bounce-in relative z-10">
        {/* Winner Announcement */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎯</div>
          <h2 className="text-3xl font-bold text-white mb-1">
            {players.length === 1 ? "Leg Checked Out!" : "Game Over!"}
          </h2>
          {winner && (
            <div>
              <p className="text-xl text-gold-light font-semibold text-shadow-gold">
                {players.length === 1 ? `🎉 ${winner.name}` : `🏆 ${winner.name} wins!`}
              </p>
              {players.length === 1 && (
                <p className="text-sm text-gray-300 mt-1">
                  Finished in <span className="text-primary-400 font-bold">{winner.dartsThrown} darts</span> ({winner.turns.length} turns)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          {players
            .sort((a, b) => a.remaining - b.remaining)
            .map((player, index) => {
              const isWinner = player.id === winnerId;
              const checkoutPct =
                player.checkoutAttempts > 0
                  ? (
                      (player.checkoutSuccesses / player.checkoutAttempts) *
                      100
                    ).toFixed(0)
                  : "—";

              return (
                <div
                  key={player.id}
                  className={`rounded-xl p-4 ${
                    isWinner
                      ? "bg-primary-500/10 border border-primary-500/30"
                      : "bg-surface-dark/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          isWinner ? "text-gold-light" : "text-gray-400"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span
                        className={`font-semibold ${
                          isWinner ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {player.name}
                      </span>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        isWinner ? "text-primary-400" : "text-gray-400"
                      }`}
                    >
                      {player.remaining}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Avg</p>
                      <p className="text-sm font-bold text-gray-200">
                        {player.average.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Highest</p>
                      <p className="text-sm font-bold text-gray-200">
                        {player.highestTurn}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Checkout</p>
                      <p className="text-sm font-bold text-gray-200">
                        {checkoutPct}
                        {checkoutPct !== "—" && "%"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex gap-3">
            <button onClick={resetGame} className="btn-secondary flex-1">
              New Game
            </button>
            <button onClick={handleRematch} className="btn-primary flex-1">
              {players.length === 1 ? "Practice Again" : "Rematch"}
            </button>
          </div>
          {gameId && (
            <button
              onClick={() => setShowDetails(true)}
              className="btn-ghost w-full !py-2 text-xs text-primary-300 hover:text-white border border-primary-500/20"
            >
              📊 View Point History & Match Stats
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
