import { create } from "zustand";
import { Dart, Player, Turn, GameState, GameHistory } from "@/types/game";
import { getCheckoutSuggestions } from "@/lib/checkouts";
import {
  saveGameToDb,
  loadGameHistory,
  clearAllData,
  migrateFromLocalStorage,
} from "@/lib/db";

const STARTING_SCORE = 501;

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function createPlayer(name: string): Player {
  return {
    id: generateId(),
    name,
    remaining: STARTING_SCORE,
    turns: [],
    dartsThrown: 0,
    average: 0,
    highestTurn: 0,
    checkoutAttempts: 0,
    checkoutSuccesses: 0,
  };
}

function calculateAverage(player: Player): number {
  if (player.dartsThrown === 0) return 0;
  const totalScored = player.turns.reduce((sum, turn) => {
    return sum + (turn.isBust ? 0 : turn.totalScore);
  }, 0);
  // 3-dart average
  return (totalScored / player.dartsThrown) * 3;
}

function isDartDouble(dart: Dart): boolean {
  return dart.segment === "D" || dart.segment === "D-BULL";
}

function isOnCheckoutScore(remaining: number): boolean {
  return remaining <= 170 && remaining >= 2;
}

interface GameStore extends GameState {
  // Setup actions
  setupPlayers: { id: string; name: string }[];
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  startGame: () => void;
  resetGame: () => void;

  // Game actions
  throwDart: (dart: Dart) => void;
  quickEntryTurn: (total: number) => void;
  undoLastDart: () => void;
  nextPlayer: () => void;

  // Computed helpers
  getCurrentPlayer: () => Player | null;
  getCheckoutSuggestions: (remaining: number) => ReturnType<typeof getCheckoutSuggestions>;
  getCurrentTurnScore: () => number;

  // History
  gameHistory: GameHistory[];
  loadHistory: () => void;
  clearHistory: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  id: "",
  players: [],
  currentPlayerIndex: 0,
  currentTurnDarts: [],
  gameStarted: false,
  gameFinished: false,
  winnerId: null,
  startedAt: "",
  finishedAt: null,
  setupPlayers: [],
  gameHistory: [],

  // Setup actions
  addPlayer: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => ({
      setupPlayers: [
        ...state.setupPlayers,
        { id: generateId(), name: trimmed },
      ],
    }));
  },

  removePlayer: (id: string) => {
    set((state) => ({
      setupPlayers: state.setupPlayers.filter((p) => p.id !== id),
    }));
  },

  startGame: () => {
    const { setupPlayers } = get();
    if (setupPlayers.length < 2) return;

    const players = setupPlayers.map((sp) => createPlayer(sp.name));

    set({
      id: generateId(),
      players,
      currentPlayerIndex: 0,
      currentTurnDarts: [],
      gameStarted: true,
      gameFinished: false,
      winnerId: null,
      startedAt: new Date().toISOString(),
      finishedAt: null,
    });
  },

  resetGame: () => {
    set({
      id: "",
      players: [],
      currentPlayerIndex: 0,
      currentTurnDarts: [],
      gameStarted: false,
      gameFinished: false,
      winnerId: null,
      startedAt: "",
      finishedAt: null,
      setupPlayers: [],
    });
  },

  // Game actions
  throwDart: (dart: Dart) => {
    const state = get();
    if (state.gameFinished) return;
    if (state.currentTurnDarts.length >= 3) return;

    const player = state.players[state.currentPlayerIndex];
    if (!player) return;

    const turnDartsSoFar = [...state.currentTurnDarts, dart];
    const turnTotal = turnDartsSoFar.reduce((sum, d) => sum + d.score, 0);
    const newRemaining = player.remaining - turnTotal;

    // Check for bust conditions
    let isBust = false;
    if (newRemaining < 0) {
      isBust = true;
    } else if (newRemaining === 1) {
      // Can't finish — no double leaves exactly 0 from 1
      isBust = true;
    } else if (newRemaining === 0 && !isDartDouble(dart)) {
      // Reached zero but not on a double
      isBust = true;
    }

    if (isBust) {
      // Bust: revert to start-of-turn score, record the turn
      const wasOnCheckout = isOnCheckoutScore(player.remaining);
      const turn: Turn = {
        playerId: player.id,
        darts: turnDartsSoFar,
        totalScore: 0,
        remainingBefore: player.remaining,
        remainingAfter: player.remaining,
        isBust: true,
      };

      const updatedPlayer = {
        ...player,
        turns: [...player.turns, turn],
        dartsThrown: player.dartsThrown + turnDartsSoFar.length,
        checkoutAttempts: wasOnCheckout
          ? player.checkoutAttempts + 1
          : player.checkoutAttempts,
      };
      updatedPlayer.average = calculateAverage(updatedPlayer);

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = updatedPlayer;

      // Auto advance to next player
      const nextIndex =
        (state.currentPlayerIndex + 1) % updatedPlayers.length;

      set({
        players: updatedPlayers,
        currentTurnDarts: [],
        currentPlayerIndex: nextIndex,
      });
      return;
    }

    // Check for win
    if (newRemaining === 0 && isDartDouble(dart)) {
      const wasOnCheckout = isOnCheckoutScore(player.remaining);
      const turn: Turn = {
        playerId: player.id,
        darts: turnDartsSoFar,
        totalScore: turnTotal,
        remainingBefore: player.remaining,
        remainingAfter: 0,
        isBust: false,
      };

      const updatedPlayer = {
        ...player,
        remaining: 0,
        turns: [...player.turns, turn],
        dartsThrown: player.dartsThrown + turnDartsSoFar.length,
        highestTurn: Math.max(player.highestTurn, turnTotal),
        checkoutAttempts: wasOnCheckout
          ? player.checkoutAttempts + 1
          : player.checkoutAttempts,
        checkoutSuccesses: player.checkoutSuccesses + 1,
      };
      updatedPlayer.average = calculateAverage(updatedPlayer);

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = updatedPlayer;

      const finishedAt = new Date().toISOString();

      // Save to history
      const historyEntry: GameHistory = {
        id: state.id,
        players: updatedPlayers.map((p) => ({
          name: p.name,
          finalScore: p.remaining,
          average: p.average,
        })),
        winner: updatedPlayer.name,
        date: finishedAt,
        totalTurns: updatedPlayers.reduce(
          (sum, p) => sum + p.turns.length,
          0
        ),
      };

      // Persist to IndexedDB
      saveGameToDb(
        state.id,
        updatedPlayers,
        updatedPlayer,
        state.startedAt,
        finishedAt
      ).catch(() => {
        // Ignore DB errors
      });

      set({
        players: updatedPlayers,
        currentTurnDarts: [],
        gameFinished: true,
        winnerId: updatedPlayer.id,
        finishedAt,
        gameHistory: [historyEntry, ...get().gameHistory].slice(0, 50),
      });
      return;
    }

    // Normal dart — update current turn darts
    set({ currentTurnDarts: turnDartsSoFar });

    // If 3 darts thrown, finalize the turn but don't auto-advance yet
    // (let the user review and click "Next Player")
    if (turnDartsSoFar.length === 3) {
      const wasOnCheckout = isOnCheckoutScore(player.remaining);
      const turn: Turn = {
        playerId: player.id,
        darts: turnDartsSoFar,
        totalScore: turnTotal,
        remainingBefore: player.remaining,
        remainingAfter: newRemaining,
        isBust: false,
      };

      const updatedPlayer = {
        ...player,
        remaining: newRemaining,
        turns: [...player.turns, turn],
        dartsThrown: player.dartsThrown + 3,
        highestTurn: Math.max(player.highestTurn, turnTotal),
        checkoutAttempts: wasOnCheckout
          ? player.checkoutAttempts + 1
          : player.checkoutAttempts,
      };
      updatedPlayer.average = calculateAverage(updatedPlayer);

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = updatedPlayer;

      set({
        players: updatedPlayers,
        currentTurnDarts: turnDartsSoFar,
      });
    }
  },

  quickEntryTurn: (total: number) => {
    const state = get();
    if (state.gameFinished) return;

    const player = state.players[state.currentPlayerIndex];
    if (!player) return;

    const newRemaining = player.remaining - total;

    // Quick entry doesn't allow finishing (can't verify double)
    // If they scored 0, treat it as a normal 0 turn
    let isBust = false;
    let finalRemaining = newRemaining;

    if (newRemaining < 0 || newRemaining === 1) {
      isBust = true;
      finalRemaining = player.remaining;
    } else if (newRemaining === 0) {
      // For quick entry, we assume the player finished properly on a double
      // since they're manually confirming the score
    }

    const fakeDarts: Dart[] = [
      { segment: "S", value: 0, score: isBust ? 0 : total },
    ];

    const turn: Turn = {
      playerId: player.id,
      darts: fakeDarts,
      totalScore: isBust ? 0 : total,
      remainingBefore: player.remaining,
      remainingAfter: finalRemaining,
      isBust,
    };

    const updatedPlayer = {
      ...player,
      remaining: finalRemaining,
      turns: [...player.turns, turn],
      dartsThrown: player.dartsThrown + 3,
      highestTurn: isBust
        ? player.highestTurn
        : Math.max(player.highestTurn, total),
    };
    updatedPlayer.average = calculateAverage(updatedPlayer);

    const updatedPlayers = [...state.players];
    updatedPlayers[state.currentPlayerIndex] = updatedPlayer;

    if (newRemaining === 0 && !isBust) {
      const finishedAt = new Date().toISOString();
      const historyEntry: GameHistory = {
        id: state.id,
        players: updatedPlayers.map((p) => ({
          name: p.name,
          finalScore: p.remaining,
          average: p.average,
        })),
        winner: updatedPlayer.name,
        date: finishedAt,
        totalTurns: updatedPlayers.reduce(
          (sum, p) => sum + p.turns.length,
          0
        ),
      };

      // Persist to IndexedDB
      saveGameToDb(
        state.id,
        updatedPlayers,
        updatedPlayer,
        state.startedAt,
        finishedAt
      ).catch(() => {
        // Ignore DB errors
      });

      set({
        players: updatedPlayers,
        currentTurnDarts: [],
        gameFinished: true,
        winnerId: updatedPlayer.id,
        finishedAt,
        gameHistory: [historyEntry, ...get().gameHistory].slice(0, 50),
      });
      return;
    }

    const nextIndex =
      (state.currentPlayerIndex + 1) % updatedPlayers.length;

    set({
      players: updatedPlayers,
      currentTurnDarts: [],
      currentPlayerIndex: nextIndex,
    });
  },

  undoLastDart: () => {
    const state = get();
    if (state.currentTurnDarts.length === 0) return;

    // If we had 3 darts (turn was finalized), we need to revert the player state
    if (state.currentTurnDarts.length === 3) {
      const player = state.players[state.currentPlayerIndex];
      if (player.turns.length > 0) {
        const lastTurn = player.turns[player.turns.length - 1];
        // Only revert if this turn matches our current turn darts
        if (lastTurn.darts.length === 3) {
          const revertedPlayer = {
            ...player,
            remaining: lastTurn.remainingBefore,
            turns: player.turns.slice(0, -1),
            dartsThrown: player.dartsThrown - 3,
            highestTurn: player.turns
              .slice(0, -1)
              .reduce(
                (max, t) => Math.max(max, t.isBust ? 0 : t.totalScore),
                0
              ),
          };
          revertedPlayer.average = calculateAverage(revertedPlayer);

          const updatedPlayers = [...state.players];
          updatedPlayers[state.currentPlayerIndex] = revertedPlayer;

          set({
            players: updatedPlayers,
            currentTurnDarts: state.currentTurnDarts.slice(0, -1),
          });
          return;
        }
      }
    }

    set({
      currentTurnDarts: state.currentTurnDarts.slice(0, -1),
    });
  },

  nextPlayer: () => {
    const state = get();
    if (state.gameFinished) return;

    // If turn hasn't been finalized yet (less than 3 darts), finalize it
    if (
      state.currentTurnDarts.length > 0 &&
      state.currentTurnDarts.length < 3
    ) {
      const player = state.players[state.currentPlayerIndex];
      const turnTotal = state.currentTurnDarts.reduce(
        (sum, d) => sum + d.score,
        0
      );
      const newRemaining = player.remaining - turnTotal;

      const turn: Turn = {
        playerId: player.id,
        darts: state.currentTurnDarts,
        totalScore: turnTotal,
        remainingBefore: player.remaining,
        remainingAfter: newRemaining,
        isBust: false,
      };

      const updatedPlayer = {
        ...player,
        remaining: newRemaining,
        turns: [...player.turns, turn],
        dartsThrown: player.dartsThrown + state.currentTurnDarts.length,
        highestTurn: Math.max(player.highestTurn, turnTotal),
      };
      updatedPlayer.average = calculateAverage(updatedPlayer);

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = updatedPlayer;

      const nextIndex =
        (state.currentPlayerIndex + 1) % updatedPlayers.length;
      set({
        players: updatedPlayers,
        currentTurnDarts: [],
        currentPlayerIndex: nextIndex,
      });
    } else {
      // Turn was already finalized at 3 darts or was empty
      const nextIndex =
        (state.currentPlayerIndex + 1) % state.players.length;
      set({
        currentTurnDarts: [],
        currentPlayerIndex: nextIndex,
      });
    }
  },

  // Computed
  getCurrentPlayer: () => {
    const state = get();
    return state.players[state.currentPlayerIndex] || null;
  },

  getCheckoutSuggestions: (remaining: number) => {
    return getCheckoutSuggestions(remaining);
  },

  getCurrentTurnScore: () => {
    const state = get();
    return state.currentTurnDarts.reduce((sum, d) => sum + d.score, 0);
  },

  // History
  loadHistory: () => {
    // Migrate from localStorage on first load, then load from IndexedDB
    migrateFromLocalStorage()
      .then(() => loadGameHistory())
      .then((data) => {
        set({ gameHistory: data });
      })
      .catch(() => {
        set({ gameHistory: [] });
      });
  },

  clearHistory: () => {
    clearAllData().catch(() => {
      // Ignore
    });
    set({ gameHistory: [] });
  },
}));
