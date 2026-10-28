"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { GameHistory } from "@/components/GameHistory";
import { InstallPrompt } from "@/components/InstallPrompt";

export function PlayerSetup() {
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [soloName, setSoloName] = useState("");
  const [multiName, setMultiName] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const setupPlayers = useGameStore((s) => s.setupPlayers);
  const targetStartingScore = useGameStore((s) => s.targetStartingScore);
  const setTargetStartingScore = useGameStore((s) => s.setTargetStartingScore);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const startGame = useGameStore((s) => s.startGame);
  const startSoloGame = useGameStore((s) => s.startSoloGame);
  const loadHistory = useGameStore((s) => s.loadHistory);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleAddMulti = () => {
    if (multiName.trim()) {
      addPlayer(multiName);
      setMultiName("");
    }
  };

  const handleKeyDownMulti = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddMulti();
    }
  };

  const handleStartSolo = () => {
    startSoloGame(soloName.trim() || "Player 1");
  };

  const handleStartMulti = () => {
    if (setupPlayers.length >= 2) {
      startGame();
    }
  };

  if (showHistory) {
    return <GameHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50" />
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Oche
          </h1>
          <div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
        </div>
        <p className="text-gray-400 font-medium">
          {targetStartingScore} Double Out Training
        </p>
      </div>

      {/* In-app Install Prompt */}
      <InstallPrompt />

      {/* Target Score Selector: 501 / 301 */}
      <div className="flex items-center justify-between w-full mb-3 p-2 bg-surface-800/80 rounded-xl border border-white/5 animate-slide-up">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider pl-2">
          Game Format
        </span>
        <div className="flex gap-1 bg-surface-900/90 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setTargetStartingScore(501)}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              targetStartingScore === 501
                ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                : "text-gray-400 hover:text-white"
            }`}
          >
            501
          </button>
          <button
            onClick={() => setTargetStartingScore(301)}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              targetStartingScore === 301
                ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                : "text-gray-400 hover:text-white"
            }`}
          >
            301
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2 w-full mb-4 p-1 bg-surface-800/80 rounded-2xl border border-white/5 animate-slide-up">
        <button
          onClick={() => setMode("single")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
            mode === "single"
              ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <span>🎯</span>
          <span>Single Player</span>
        </button>
        <button
          onClick={() => setMode("multi")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
            mode === "multi"
              ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <span>👥</span>
          <span>Multiplayer</span>
        </button>
      </div>

      {/* Setup Card */}
      <div className="glass-card w-full p-6 animate-slide-up">
        {mode === "single" ? (
          /* Single Player Setup */
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white mb-1">Solo Training</h2>
              <p className="text-xs text-gray-400">
                Track your 3-dart average, checkout percentage, and high turns as you practice {targetStartingScore}.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={soloName}
                onChange={(e) => setSoloName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartSolo()}
                placeholder="e.g. Luke Littler or Player 1"
                className="input-field w-full"
                maxLength={20}
                autoFocus
              />
            </div>

            <button
              onClick={handleStartSolo}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
            >
              <span>🎯</span>
              <span>Start Solo {targetStartingScore}</span>
            </button>
          </div>
        ) : (
          /* Multiplayer Setup */
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-1">Multiplayer Match</h2>
              <p className="text-xs text-gray-400">
                Add 2 or more players to compete in {targetStartingScore} double-out.
              </p>
            </div>

            {/* Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={multiName}
                onChange={(e) => setMultiName(e.target.value)}
                onKeyDown={handleKeyDownMulti}
                placeholder="Player name..."
                className="input-field flex-1"
                maxLength={20}
              />
              <button
                onClick={handleAddMulti}
                disabled={!multiName.trim()}
                className="btn-primary !px-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              </button>
            </div>

            {/* Players List */}
            <div className="space-y-2 mb-6 min-h-[90px]">
              {setupPlayers.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">Add at least 2 players to start a match</p>
                </div>
              ) : (
                setupPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-surface-dark/40 rounded-xl px-4 py-2.5 animate-scale-in"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {player.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-gray-500 hover:text-accent transition-colors p-1"
                      aria-label={`Remove ${player.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartMulti}
              disabled={setupPlayers.length < 2}
              className="btn-primary w-full text-lg py-4"
            >
              {setupPlayers.length < 2
                ? `Need ${2 - setupPlayers.length} more player${setupPlayers.length === 0 ? "s" : ""}`
                : `Start Match (${setupPlayers.length} players • ${targetStartingScore})`}
            </button>
          </div>
        )}
      </div>

      {/* History & Database Button */}
      <button
        onClick={() => setShowHistory(true)}
        className="btn-ghost mt-6 text-sm flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
            clipRule="evenodd"
          />
        </svg>
        Database & History
      </button>
    </div>
  );
}
