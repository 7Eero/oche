import Dexie, { type EntityTable } from 'dexie';
import { GameHistory, Player, Dart, Turn } from '@/types/game';

// Extended types for database storage
export interface DBGame {
  id: string;
  winner: string;
  date: string;
  totalTurns: number;
  startedAt: string;
  finishedAt: string;
}

export interface DBPlayerResult {
  id?: number;
  gameId: string;
  playerName: string;
  finalScore: number;
  average: number;
  highestTurn: number;
  dartsThrown: number;
  checkoutAttempts: number;
  checkoutSuccesses: number;
}

export interface DBTurn {
  id?: number;
  gameId: string;
  playerId: string;
  playerName: string;
  turnIndex: number;
  darts: Dart[];
  totalScore: number;
  remainingBefore: number;
  remainingAfter: number;
  isBust: boolean;
}

export interface DBPlayerStats {
  id?: number;
  playerName: string;
  gamesPlayed: number;
  gamesWon: number;
  totalDartsThrown: number;
  totalPointsScored: number;
  bestAverage: number;
  bestHighestTurn: number;
  totalCheckoutAttempts: number;
  totalCheckoutSuccesses: number;
  lastPlayed: string;
}

class DartsDatabase extends Dexie {
  games!: EntityTable<DBGame, 'id'>;
  playerResults!: EntityTable<DBPlayerResult, 'id'>;
  turns!: EntityTable<DBTurn, 'id'>;
  playerStats!: EntityTable<DBPlayerStats, 'id'>;

  constructor() {
    super('DartsTracker');

    this.version(1).stores({
      games: 'id, date, winner',
      playerResults: '++id, gameId, playerName',
      turns: '++id, gameId, playerId, turnIndex',
      playerStats: '++id, &playerName, lastPlayed',
    });
  }
}

export const db = new DartsDatabase();

// Helper: Save a completed game to the database
export async function saveGameToDb(
  gameId: string,
  players: Player[],
  winner: Player,
  startedAt: string,
  finishedAt: string
): Promise<void> {
  const totalTurns = players.reduce((sum, p) => sum + p.turns.length, 0);

  await db.transaction('rw', [db.games, db.playerResults, db.turns, db.playerStats], async () => {
    // Save game record
    await db.games.put({
      id: gameId,
      winner: winner.name,
      date: finishedAt,
      totalTurns,
      startedAt,
      finishedAt,
    });

    // Save player results
    for (const player of players) {
      await db.playerResults.add({
        gameId,
        playerName: player.name,
        finalScore: player.remaining,
        average: player.average,
        highestTurn: player.highestTurn,
        dartsThrown: player.dartsThrown,
        checkoutAttempts: player.checkoutAttempts,
        checkoutSuccesses: player.checkoutSuccesses,
      });

      // Save each turn
      for (let i = 0; i < player.turns.length; i++) {
        const turn = player.turns[i];
        await db.turns.add({
          gameId,
          playerId: player.id,
          playerName: player.name,
          turnIndex: i,
          darts: turn.darts,
          totalScore: turn.totalScore,
          remainingBefore: turn.remainingBefore,
          remainingAfter: turn.remainingAfter,
          isBust: turn.isBust,
        });
      }

      // Update player lifetime stats
      const existing = await db.playerStats
        .where('playerName')
        .equals(player.name)
        .first();

      const totalPointsScored = player.turns.reduce(
        (sum, t) => sum + (t.isBust ? 0 : t.totalScore),
        0
      );

      if (existing) {
        await db.playerStats.update(existing.id!, {
          gamesPlayed: existing.gamesPlayed + 1,
          gamesWon: existing.gamesWon + (player.id === winner.id ? 1 : 0),
          totalDartsThrown: existing.totalDartsThrown + player.dartsThrown,
          totalPointsScored: existing.totalPointsScored + totalPointsScored,
          bestAverage: Math.max(existing.bestAverage, player.average),
          bestHighestTurn: Math.max(existing.bestHighestTurn, player.highestTurn),
          totalCheckoutAttempts: existing.totalCheckoutAttempts + player.checkoutAttempts,
          totalCheckoutSuccesses: existing.totalCheckoutSuccesses + player.checkoutSuccesses,
          lastPlayed: finishedAt,
        });
      } else {
        await db.playerStats.add({
          playerName: player.name,
          gamesPlayed: 1,
          gamesWon: player.id === winner.id ? 1 : 0,
          totalDartsThrown: player.dartsThrown,
          totalPointsScored: totalPointsScored,
          bestAverage: player.average,
          bestHighestTurn: player.highestTurn,
          totalCheckoutAttempts: player.checkoutAttempts,
          totalCheckoutSuccesses: player.checkoutSuccesses,
          lastPlayed: finishedAt,
        });
      }
    }
  });
}

// Helper: Load game history from the database
export async function loadGameHistory(): Promise<GameHistory[]> {
  const games = await db.games.orderBy('date').reverse().limit(50).toArray();
  const history: GameHistory[] = [];

  for (const game of games) {
    const playerResults = await db.playerResults
      .where('gameId')
      .equals(game.id)
      .toArray();

    history.push({
      id: game.id,
      players: playerResults.map((pr) => ({
        name: pr.playerName,
        finalScore: pr.finalScore,
        average: pr.average,
      })),
      winner: game.winner,
      date: game.date,
      totalTurns: game.totalTurns,
    });
  }

  return history;
}

// Helper: Get lifetime stats for all players
export async function getAllPlayerStats(): Promise<DBPlayerStats[]> {
  return db.playerStats.orderBy('gamesPlayed').reverse().toArray();
}

// Helper: Get detailed game data
export async function getGameDetails(gameId: string) {
  const game = await db.games.get(gameId);
  if (!game) return null;

  const playerResults = await db.playerResults
    .where('gameId')
    .equals(gameId)
    .toArray();

  const turns = await db.turns
    .where('gameId')
    .equals(gameId)
    .sortBy('turnIndex');

  return { game, playerResults, turns };
}

// Helper: Clear all data
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.games, db.playerResults, db.turns, db.playerStats], async () => {
    await db.games.clear();
    await db.playerResults.clear();
    await db.turns.clear();
    await db.playerStats.clear();
  });
}

// Helper: Migrate from localStorage (one-time migration)
export async function migrateFromLocalStorage(): Promise<boolean> {
  try {
    const migrated = localStorage.getItem('darts-db-migrated');
    if (migrated) return false;

    const oldHistory = localStorage.getItem('darts-history');
    if (!oldHistory) {
      localStorage.setItem('darts-db-migrated', 'true');
      return false;
    }

    const games: GameHistory[] = JSON.parse(oldHistory);
    if (games.length === 0) {
      localStorage.setItem('darts-db-migrated', 'true');
      return false;
    }

    await db.transaction('rw', [db.games, db.playerResults], async () => {
      for (const game of games) {
        // Check if already exists
        const existing = await db.games.get(game.id);
        if (existing) continue;

        await db.games.put({
          id: game.id,
          winner: game.winner,
          date: game.date,
          totalTurns: game.totalTurns,
          startedAt: game.date,
          finishedAt: game.date,
        });

        for (const player of game.players) {
          await db.playerResults.add({
            gameId: game.id,
            playerName: player.name,
            finalScore: player.finalScore,
            average: player.average,
            highestTurn: 0,
            dartsThrown: 0,
            checkoutAttempts: 0,
            checkoutSuccesses: 0,
          });
        }
      }
    });

    localStorage.setItem('darts-db-migrated', 'true');
    return true;
  } catch {
    return false;
  }
}
