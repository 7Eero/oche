"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { getAllPlayerStats, DBPlayerStats } from "@/lib/db";
import { MatchDetails } from "@/components/MatchDetails";

interface GameHistoryProps {
  onBack: () => void;
}

export function GameHistory({ onBack }: GameHistoryProps) {
  const gameHistory = useGameStore((s) => s.gameHistory);
  const loadHistory = useGameStore((s) => s.loadHistory);
  const clearHistory = useGameStore((s) => s.clearHistory);

  const [activeTab, setActiveTab] = useState<"games" | "stats">("games");
  const [playerStats, setPlayerStats] = useState<DBPlayerStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    fetchStats();
  }, [loadHistory]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await getAllPlayerStats();
      setPlayerStats(stats);
    } catch {
      // Fallback
    } finally {
      setLoadingStats(false);
    }
  };

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear all game history and player stats?")) {
      clearHistory();
      setPlayerStats([]);
      setSelectedGameId(null);
    }
  };

  if (selectedGameId) {
    return (
      <MatchDetails
        gameId={selectedGameId}
        onBack={() => setSelectedGameId(null)}
      />
    );
  }

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="btn-ghost !px-2 !py-1 text-sm">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-white">Database & History</h2>
        <div className="w-16" />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-surface-800/80 rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab("games")}
          className={`py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "games"
              ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Recent Games ({gameHistory.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("stats");
            fetchStats();
          }}
          className={`py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "stats"
              ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Player Stats & Records
        </button>
      </div>

      {activeTab === "games" ? (
        gameHistory.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 py-12">
              <span className="text-4xl block mb-2">🎯</span>
              <p className="text-lg font-medium">No games recorded yet</p>
              <p className="text-sm mt-1">
                Finished games are stored offline in your IndexedDB database
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 flex-1 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-2 px-1">
                Tap any match to view full stats and turn-by-turn point history:
              </p>
              {gameHistory.map((game) => (
                <div
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  className="glass-card p-4 hover:border-primary-500/40 cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏆</span>
                      <span className="font-semibold text-gold-light group-hover:text-primary-300 transition-colors">
                        {game.winner}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-800 text-gray-300 border border-white/5">
                        {game.startingScore || 501}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(game.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Details →
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-3">
                    {game.players.map((player, i) => (
                      <div
                        key={i}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                          player.name === game.winner
                            ? "bg-primary-500/10 border-primary-500/30 text-primary-300 font-semibold"
                            : "bg-white/5 border-white/5 text-gray-300"
                        }`}
                      >
                        {player.name}: {player.finalScore === 0 ? "Won" : `${player.finalScore} left`} (avg{" "}
                        {player.average.toFixed(1)})
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-2">
                    <span>{game.totalTurns} turns</span>
                    <span className="text-primary-400/90 font-medium group-hover:underline">
                      View Points & Darts Breakdown
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleClear}
              className="btn-ghost text-accent text-sm mt-4 mx-auto"
            >
              Clear Database
            </button>
          </>
        )
      ) : (
        /* Player Lifetime Stats */
        <div className="flex-1">
          {loadingStats ? (
            <div className="text-center text-gray-400 py-12">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading player records...</p>
            </div>
          ) : playerStats.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg font-medium">No player records yet</p>
              <p className="text-sm mt-1">Play a full game to track lifetime averages and checkout %</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playerStats.map((p) => {
                const winRate = p.gamesPlayed > 0 ? Math.round((p.gamesWon / p.gamesPlayed) * 100) : 0;
                const lifetimeAvg = p.totalDartsThrown > 0
                  ? ((p.totalPointsScored / p.totalDartsThrown) * 3).toFixed(1)
                  : "0.0";
                const checkoutPct = p.totalCheckoutAttempts > 0
                  ? Math.round((p.totalCheckoutSuccesses / p.totalCheckoutAttempts) * 100)
                  : 0;

                return (
                  <div key={p.playerName} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                      <span className="text-lg font-bold text-white">{p.playerName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold font-medium">
                        {p.gamesWon}W - {p.gamesPlayed - p.gamesWon}L ({winRate}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-surface-800/50 p-2 rounded-lg">
                        <div className="text-xs text-gray-400">Career 3-Dart Avg</div>
                        <div className="text-base font-bold text-primary-400">{lifetimeAvg}</div>
                      </div>
                      <div className="bg-surface-800/50 p-2 rounded-lg">
                        <div className="text-xs text-gray-400">Best 3-Dart Avg</div>
                        <div className="text-base font-bold text-gold">{p.bestAverage.toFixed(1)}</div>
                      </div>
                      <div className="bg-surface-800/50 p-2 rounded-lg">
                        <div className="text-xs text-gray-400">High Turn</div>
                        <div className="text-base font-bold text-white">{p.bestHighestTurn}</div>
                      </div>
                      <div className="bg-surface-800/50 p-2 rounded-lg">
                        <div className="text-xs text-gray-400">Checkout %</div>
                        <div className="text-base font-bold text-emerald-400">{checkoutPct}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
