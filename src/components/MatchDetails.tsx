"use client";

import { useEffect, useState } from "react";
import { getGameDetails, DBGame, DBPlayerResult, DBTurn } from "@/lib/db";
import { Dart } from "@/types/game";

interface MatchDetailsProps {
  gameId: string;
  onBack: () => void;
}

export function MatchDetails({ gameId, onBack }: MatchDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<DBGame | null>(null);
  const [players, setPlayers] = useState<DBPlayerResult[]>([]);
  const [turns, setTurns] = useState<DBTurn[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const details = await getGameDetails(gameId);
        if (details) {
          setGame(details.game);
          setPlayers(details.playerResults);
          setTurns(details.turns);
        }
      } catch (err) {
        console.error("Failed to load match details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [gameId]);

  function formatDart(dart: Dart): string {
    if (dart.segment === "BULL") return "Bull (25)";
    if (dart.segment === "D-BULL") return "D-Bull (50)";
    if (dart.score === 0) return "Miss (0)";
    const prefix = dart.segment === "S" ? "" : dart.segment;
    return `${prefix}${dart.value}`;
  }

  function getDartBadgeClass(dart: Dart): string {
    switch (dart.segment) {
      case "T":
        return "bg-accent/80 text-white border-accent";
      case "D":
      case "D-BULL":
        return "bg-primary-500/80 text-white border-primary-500";
      case "BULL":
        return "bg-gold/80 text-white border-gold";
      default:
        return dart.score === 0
          ? "bg-gray-800 text-gray-500 border-gray-700"
          : "bg-surface-accent/70 text-gray-200 border-white/10";
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading match history...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4">
        <p className="text-gray-400 mb-4">Match details could not be found.</p>
        <button onClick={onBack} className="btn-secondary !py-2 !px-4 text-sm">
          ← Back to History
        </button>
      </div>
    );
  }

  const filteredTurns =
    selectedPlayer === "all"
      ? turns
      : turns.filter((t) => t.playerName === selectedPlayer);

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 max-w-2xl mx-auto w-full animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-ghost !px-2 !py-1 text-sm flex items-center gap-1">
          ← Back
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Match Breakdown</h2>
          <p className="text-xs text-gray-400">
            {new Date(game.date).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="w-16" />
      </div>

      {/* Winner Hero Card */}
      <div className="glass-card p-5 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-gold to-accent" />
        <span className="text-4xl block mb-2">🏆</span>
        <h3 className="text-2xl font-black text-white tracking-tight">{game.winner}</h3>
        <p className="text-xs text-gold-light font-semibold uppercase tracking-wider mt-0.5">
          Match Winner
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
          <span>{game.totalTurns} Total Turns</span>
          <span>•</span>
          <span>{game.startingScore || 501} Double Out</span>
        </div>
      </div>

      {/* Player Stats Comparison */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
          Player Performance Stats
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((p) => {
            const isWinner = p.playerName === game.winner;
            const checkoutPct =
              p.checkoutAttempts > 0
                ? Math.round((p.checkoutSuccesses / p.checkoutAttempts) * 100)
                : 0;

            return (
              <div
                key={p.playerName}
                className={`glass-card p-4 border transition-all ${
                  isWinner ? "border-primary-500/40 bg-primary-950/20" : "border-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{p.playerName}</span>
                    {isWinner && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 font-semibold">
                        Winner
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-300">
                    {p.finalScore === 0 ? "0 (Checkout)" : `${p.finalScore} left`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="bg-surface-800/60 p-2 rounded-lg">
                    <div className="text-[10px] text-gray-400 uppercase">3-Dart Avg</div>
                    <div className="text-sm font-black text-primary-400">
                      {p.average.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-surface-800/60 p-2 rounded-lg">
                    <div className="text-[10px] text-gray-400 uppercase">High Turn</div>
                    <div className="text-sm font-black text-gold">
                      {p.highestTurn}
                    </div>
                  </div>
                  <div className="bg-surface-800/60 p-2 rounded-lg">
                    <div className="text-[10px] text-gray-400 uppercase">Darts</div>
                    <div className="text-sm font-black text-white">
                      {p.dartsThrown}
                    </div>
                  </div>
                  <div className="bg-surface-800/60 p-2 rounded-lg">
                    <div className="text-[10px] text-gray-400 uppercase">Checkout</div>
                    <div className="text-sm font-black text-emerald-400">
                      {checkoutPct}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Point History / Turns List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Point History & Turn Breakdown ({filteredTurns.length})
          </h4>

          {/* Filter by player if multiple players */}
          {players.length > 1 && (
            <div className="flex items-center gap-1 bg-surface-800/60 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setSelectedPlayer("all")}
                className={`text-[11px] px-2 py-0.5 rounded ${
                  selectedPlayer === "all"
                    ? "bg-primary-500 text-white font-medium"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All
              </button>
              {players.map((p) => (
                <button
                  key={p.playerName}
                  onClick={() => setSelectedPlayer(p.playerName)}
                  className={`text-[11px] px-2 py-0.5 rounded ${
                    selectedPlayer === p.playerName
                      ? "bg-primary-500 text-white font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {p.playerName}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredTurns.length === 0 ? (
          <div className="glass-card p-6 text-center text-gray-500 text-sm">
            No turn details recorded for this view.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTurns.map((turn, idx) => {
              const isBust = turn.isBust;
              const isWin = turn.remainingAfter === 0 && !isBust;

              return (
                <div
                  key={turn.id || idx}
                  className={`glass-card p-3.5 border transition-all ${
                    isWin
                      ? "border-primary-500/50 bg-primary-950/20"
                      : isBust
                      ? "border-accent/30 bg-accent/5"
                      : "border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-surface-800 text-gray-400 flex items-center justify-center text-[10px] font-bold">
                        {turn.turnIndex + 1}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {turn.playerName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isBust ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                          BUST
                        </span>
                      ) : isWin ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                          🎯 WINNER!
                        </span>
                      ) : (
                        <span className="text-xs font-black text-white">
                          +{turn.totalScore} pts
                        </span>
                      )}

                      <div className="text-xs font-semibold text-gray-400 flex items-center gap-1 ml-1">
                        <span>{turn.remainingBefore}</span>
                        <span className="text-gray-600">➔</span>
                        <span
                          className={`font-bold ${
                            isWin
                              ? "text-primary-400"
                              : isBust
                              ? "text-gray-400"
                              : "text-white"
                          }`}
                        >
                          {turn.remainingAfter}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Darts */}
                  <div className="flex gap-1.5 flex-wrap">
                    {turn.darts && turn.darts.length > 0 ? (
                      turn.darts.map((dart, dIdx) => (
                        <span
                          key={dIdx}
                          className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getDartBadgeClass(
                            dart
                          )}`}
                        >
                          {formatDart(dart)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-500 italic">
                        Turn score: {turn.totalScore}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
