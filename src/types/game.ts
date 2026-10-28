export type DartSegment = 'S' | 'D' | 'T' | 'BULL' | 'D-BULL';

export interface Dart {
  segment: DartSegment;
  value: number; // the number on the board (1-20, 25 for bull)
  score: number; // actual points (e.g., T20 = 60)
}

export interface Turn {
  playerId: string;
  darts: Dart[];
  totalScore: number;
  remainingBefore: number;
  remainingAfter: number;
  isBust: boolean;
}

export interface Player {
  id: string;
  name: string;
  remaining: number;
  turns: Turn[];
  dartsThrown: number;
  average: number; // 3-dart average
  highestTurn: number;
  checkoutAttempts: number;
  checkoutSuccesses: number;
}

export interface GameState {
  id: string;
  startingScore: number;
  players: Player[];
  currentPlayerIndex: number;
  currentTurnDarts: Dart[];
  gameStarted: boolean;
  gameFinished: boolean;
  winnerId: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface GameHistory {
  id: string;
  startingScore?: number;
  players: { name: string; finalScore: number; average: number }[];
  winner: string;
  date: string;
  totalTurns: number;
}
