"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { GameHistory } from "@/components/GameHistory";

export function PlayerSetup() {
  const [name, setName] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const setupPlayers = useGameStore((s) => s.setupPlayers);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const startGame = useGameStore((s) => s.startGame);
  const loadHistory = useGameStore((s) => s.loadHistory);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleAdd = () => {
    if (name.trim()) {
      addPlayer(name);
      setName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  if (showHistory) {
    return <GameHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-3 h-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50" />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Darts Tracker
          </h1>
          <div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
        </div>
        <p className="text-gray-400 text-lg">501 Double Out</p>
      </div>

      {/* Player Setup Card */}
      <div className="glass-card w-full max-w-md p-6 animate-slide-up">
        <h2 className="text-xl font-semibold text-white mb-4">
          Add Players
        </h2>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Player name..."
            className="input-field flex-1"
            maxLength={20}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
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
        <div className="space-y-2 mb-6 min-h-[100px]">
          {setupPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-10 h-10 mx-auto mb-2 opacity-50"
              >
                <path d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" />
                <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
              </svg>
              <p className="text-sm">Add at least 2 players to start</p>
            </div>
          ) : (
            setupPlayers.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-surface-dark/40 rounded-xl px-4 py-3 animate-scale-in"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-white font-medium">
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
                    className="w-5 h-5"
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
          onClick={startGame}
          disabled={setupPlayers.length < 2}
          className="btn-primary w-full text-lg py-4"
        >
          {setupPlayers.length < 2
            ? `Need ${2 - setupPlayers.length} more player${setupPlayers.length === 0 ? "s" : ""}`
            : `Start Game (${setupPlayers.length} players)`}
        </button>
      </div>

      {/* History Button */}
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
        Game History
      </button>
    </div>
  );
}
