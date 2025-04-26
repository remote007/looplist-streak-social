
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type LoopFrequency = 'daily' | 'weekdays' | 'custom' | '3x-week';

export type LoopVisibility = 'private' | 'public' | 'friends';

export type LoopStatus = 'active' | 'broken' | 'completed';

export type DayStatus = 'checked' | 'missed' | 'pending' | 'future';

export interface Loop {
  id: string;
  userId: string;
  title: string;
  emoji?: string;
  coverImage?: string;
  frequency: LoopFrequency;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  visibility: LoopVisibility;
  status: LoopStatus;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
  days: Record<string, DayStatus>; // { "2023-04-26": "checked" }
  cheers: Cheer[];
}

export interface Cheer {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: string;
}

export interface PublicLoop extends Omit<Loop, 'days'> {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  daysCount: {
    checked: number;
    missed: number;
    pending: number;
  };
}
