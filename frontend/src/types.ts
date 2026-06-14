export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Game {
  id: number;
  code: string;
  slug: string;
  name: string;
  description: string;
  gameType: "PHASER" | "UNITY_WEBGL";
  launchPath: string | null;
  active: boolean;
}

export interface GameSetting {
  id: number;
  gameId: number;
  gameSlug: string;
  gameName: string;
  enemySpeed: number;
  spawnRate: number;
  timeLimitSeconds: number;
  baseScorePerSecond: number;
  updatedAt: string;
}

export interface EventItem {
  id: number;
  name: string;
  description: string;
  multiplier: number;
  startAt: string;
  endAt: string;
  active: boolean;
}

export interface Score {
  id: number;
  userId: number;
  username: string;
  gameId: number;
  gameSlug: string;
  gameName: string;
  originalScore: number;
  score: number;
  playTimeSeconds: number;
  eventId: number | null;
  eventName: string | null;
  eventMultiplier: number;
  createdAt: string;
}

export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  gameId: number | null;
  gameSlug: string | null;
  gameName: string | null;
  conditionType: string;
  conditionValue: number;
  achievedAt: string | null;
}

export interface ScoreSubmitResponse {
  score: Score;
  newAchievements: Achievement[];
}

export interface UserDashboard {
  user: User;
  bestScore: number;
  playHistory: Score[];
  achievements: Achievement[];
}

export interface GameOverResult {
  score: number;
  playTimeSeconds: number;
  dodged: number;
}

export interface RankingEntry {
  rank: number;
  username: string;
  score: number;
  playTimeSeconds: number;
  createdAt: string;
  gameName: string;
  gameSlug: string;
}
