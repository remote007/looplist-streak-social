export type LoopFrequency = 'daily' | 'weekdays' | '3x-week' | 'custom';
export type LoopVisibility = 'private' | 'public' | 'friends';
export type DayStatus = 'pending' | 'checked' | 'missed' | 'future';
export type LoopStatus = 'active' | 'broken' | 'completed';

export interface Loop {
  id: string;
  userId: string;
  title: string;
  emoji: string;
  coverImage?: string;
  frequency: LoopFrequency;
  startDate: string;
  visibility: LoopVisibility;
  status: LoopStatus;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
  days: Record<string, DayStatus>;
  cheers: Cheer[];
}

export interface PublicLoop extends Omit<Loop, 'userId' | 'days'> {
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  daysCount: {
    checked: number;
    missed: number;
    pending: number;
  };
}

export interface Cheer {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  accountStats?: {
    totalLoops: number;
    publicLoops: number;
    totalCheers: number;
  };
}
