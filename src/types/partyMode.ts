import type { Level } from '@/data/levels';

// Party Mode Types

export type QuestionType = 'song' | 'artist';

export interface PartyPlayer {
  id: string;
  name: string;
  score: number;
}

export type PartySong = Level;

// Offline Party Types
export interface OfflinePartySettings {
  questionType: QuestionType;
  roundCount: 10 | 15 | 20;
}

export interface OfflinePartyState {
  players: PartyPlayer[];
  settings: OfflinePartySettings;
  songs: PartySong[];
  currentRound: number;
  isRevealed: boolean;
  isFinished: boolean;
}

// Online Party Types (for future use)
export type RoomStatus = 'lobby' | 'active' | 'finished';

export interface OnlinePartyRoom {
  id: string;
  code: string;
  name?: string;
  status: RoomStatus;
  questionType: QuestionType;
  answerWindowSeconds: number;
  roundCount: number;
  hostCanPlay: boolean;
  createdByPlayerId: string;
}

export interface OnlinePartyMember {
  roomId: string;
  playerId: string;
  displayName: string;
  joinedAt: string;
}

export interface OnlinePartyRound {
  id: string;
  roomId: string;
  roundNumber: number;
  songId: number;
  roundStartAt: string;
  answerWindowSeconds: number;
}

export interface OnlinePartyAnswer {
  id: string;
  roundId: string;
  roomId: string;
  playerId: string;
  submittedAt: string;
  answerText: string;
  isCorrect: boolean;
  answerTimeMs: number;
  pointsAwarded: number;
}
