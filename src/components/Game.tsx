"use client";

import { useGameStore } from "@/store/gameStore";
import { PlayerSetup } from "@/components/PlayerSetup";
import { GameBoard } from "@/components/GameBoard";
import { GameOverModal } from "@/components/GameOverModal";

export function Game() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const gameFinished = useGameStore((s) => s.gameFinished);

  return (
    <div className="relative">
      {!gameStarted ? <PlayerSetup /> : <GameBoard />}
      {gameFinished && <GameOverModal />}
    </div>
  );
}
