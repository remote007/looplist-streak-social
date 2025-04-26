import { Loop, LoopFrequency, LoopVisibility, DayStatus, PublicLoop, LoopStatus } from '../types';
import { authService } from './authService';
import { toast } from '@/components/ui/sonner';

const LOOPS_KEY = 'looplist_loops';
const PUBLIC_LOOPS_KEY = 'looplist_public_loops';

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getLoopsFromStorage = (): Loop[] => {
  const loopsJson = sessionStorage.getItem(LOOPS_KEY);
  if (!loopsJson) {
    return [];
  }
  
  try {
    return JSON.parse(loopsJson) as Loop[];
  } catch (error) {
    console.error('Error parsing loops from session storage', error);
    return [];
  }
};

const saveLoopsToStorage = (loops: Loop[]): void => {
  sessionStorage.setItem(LOOPS_KEY, JSON.stringify(loops));
};

const getPublicLoopsFromStorage = (): PublicLoop[] => {
  const loopsJson = sessionStorage.getItem(PUBLIC_LOOPS_KEY);
  if (!loopsJson) {
    return [];
  }
  
  try {
    return JSON.parse(loopsJson) as PublicLoop[];
  } catch (error) {
    console.error('Error parsing public loops from session storage', error);
    return [];
  }
};

const calculateDaysSinceStart = (startDate: string): number => {
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const generateInitialDays = (startDate: string, frequency: LoopFrequency): Record<string, DayStatus> => {
  const days: Record<string, DayStatus> = {};
  const start = new Date(startDate);
  const today = new Date();
  
  let currentDate = new Date(start);
  
  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split('T')[0];
    
    let shouldTrack = true;
    
    if (frequency === 'weekdays') {
      const dayOfWeek = currentDate.getDay();
      shouldTrack = dayOfWeek !== 0 && dayOfWeek !== 6;
    } else if (frequency === '3x-week') {
      const dayOfWeek = currentDate.getDay();
      shouldTrack = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    } else if (frequency === 'custom') {
      const daysSinceStart = Math.floor((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      shouldTrack = daysSinceStart % 2 === 0;
    }
    
    if (shouldTrack) {
      if (currentDate < today) {
        days[dateKey] = Math.random() > 0.3 ? 'checked' : 'missed';
      } else {
        days[dateKey] = 'pending';
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

const calculateStreakMetrics = (days: Record<string, DayStatus>): { currentStreak: number, longestStreak: number, completionRate: number } => {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const sortedDates = Object.keys(days).sort();
  let completed = 0;
  let total = 0;
  
  for (const date of sortedDates) {
    const status = days[date];
    
    if (status === 'checked' || status === 'pending') {
      tempStreak++;
      
      if (status === 'checked') {
        completed++;
      }
      
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else if (status === 'missed') {
      tempStreak = 0;
    }
    
    if (status !== 'future') {
      total++;
    }
  }
  
  currentStreak = tempStreak;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  return {
    currentStreak,
    longestStreak,
    completionRate
  };
};

const determineLoopStatus = (days: Record<string, DayStatus>): LoopStatus => {
  const sortedDates = Object.keys(days).sort().reverse();
  for (const date of sortedDates) {
    if (days[date] === 'missed') {
      return 'broken';
    } else if (days[date] === 'checked' || days[date] === 'pending') {
      return 'active';
    }
  }
  
  return 'active';
};

const initializeDemo = () => {
  if (!sessionStorage.getItem(LOOPS_KEY)) {
    const currentUser = authService.getCurrentUser();
    
    if (currentUser) {
      const demoLoops: Loop[] = [
        {
          id: generateId(),
          userId: currentUser.id,
          title: "Read 10 pages every day",
          emoji: "📚",
          frequency: "daily",
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          visibility: "public",
          status: "active",
          currentStreak: 7,
          longestStreak: 7,
          completionRate: 85,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          days: {},
          cheers: [
            {
              id: generateId(),
              userId: "user2",
              userName: "Jane Smith",
              emoji: "🔥",
              timestamp: new Date().toISOString()
            }
          ]
        },
        {
          id: generateId(),
          userId: currentUser.id,
          title: "No sugar after 7pm",
          emoji: "🍬",
          frequency: "daily",
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          visibility: "private",
          status: "active",
          currentStreak: 5,
          longestStreak: 5,
          completionRate: 100,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          days: {},
          cheers: []
        },
        {
          id: generateId(),
          userId: currentUser.id,
          title: "10-minute meditation",
          emoji: "🧘",
          frequency: "weekdays",
          startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          visibility: "public",
          status: "broken",
          currentStreak: 0,
          longestStreak: 12,
          completionRate: 65,
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          days: {},
          cheers: [
            {
              id: generateId(),
              userId: "user2",
              userName: "Jane Smith",
              emoji: "👍",
              timestamp: new Date().toISOString()
            }
          ]
        }
      ];
      
      demoLoops.forEach(loop => {
        loop.days = generateInitialDays(loop.startDate, loop.frequency);
        
        const metrics = calculateStreakMetrics(loop.days);
        loop.currentStreak = metrics.currentStreak;
        loop.longestStreak = metrics.longestStreak;
        loop.completionRate = metrics.completionRate;
        
        loop.status = determineLoopStatus(loop.days);
      });
      
      saveLoopsToStorage(demoLoops);
    }
  }
  
  if (!sessionStorage.getItem(PUBLIC_LOOPS_KEY)) {
    const demoPublicLoops: PublicLoop[] = [
      {
        id: generateId(),
        userId: "user2",
        user: {
          id: "user2",
          name: "Jane Smith",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
        },
        title: "Morning stretches",
        emoji: "🤸",
        frequency: "daily",
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        visibility: "public",
        status: "active",
        currentStreak: 30,
        longestStreak: 30,
        completionRate: 100,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        daysCount: {
          checked: 30,
          missed: 0,
          pending: 1
        },
        cheers: [
          {
            id: generateId(),
            userId: "user1",
            userName: "Demo User",
            emoji: "🎉",
            timestamp: new Date().toISOString()
          }
        ]
      },
      {
        id: generateId(),
        userId: "user2",
        user: {
          id: "user2",
          name: "Jane Smith",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
        },
        title: "Write in journal",
        emoji: "✍️",
        frequency: "weekdays",
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        visibility: "public",
        status: "active",
        currentStreak: 10,
        longestStreak: 10,
        completionRate: 95,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        daysCount: {
          checked: 10,
          missed: 0,
          pending: 1
        },
        cheers: []
      },
      {
        id: generateId(),
        userId: "public_user_1",
        user: {
          id: "public_user_1",
          name: "Alex Johnson",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        },
        title: "Learn 5 new words in Spanish",
        emoji: "🇪🇸",
        frequency: "daily",
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        visibility: "public",
        status: "broken",
        currentStreak: 0,
        longestStreak: 21,
        completionRate: 75,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        daysCount: {
          checked: 32,
          missed: 12,
          pending: 1
        },
        cheers: [
          {
            id: generateId(),
            userId: "user2",
            userName: "Jane Smith",
            emoji: "👏",
            timestamp: new Date().toISOString()
          }
        ]
      },
      {
        id: generateId(),
        userId: "public_user_2",
        user: {
          id: "public_user_2",
          name: "Taylor Swift",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor"
        },
        title: "Practice guitar for 15 minutes",
        emoji: "🎸",
        frequency: "daily",
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        visibility: "public",
        status: "active",
        currentStreak: 60,
        longestStreak: 60,
        completionRate: 100,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        daysCount: {
          checked: 60,
          missed: 0,
          pending: 1
        },
        cheers: [
          {
            id: generateId(),
            userId: "user1",
            userName: "Demo User",
            emoji: "🔥",
            timestamp: new Date().toISOString()
          },
          {
            id: generateId(),
            userId: "user2",
            userName: "Jane Smith",
            emoji: "💯",
            timestamp: new Date().toISOString()
          }
        ]
      }
    ];
    
    sessionStorage.setItem(PUBLIC_LOOPS_KEY, JSON.stringify(demoPublicLoops));
  }
};

export const loopService = {
  initializeDemo,
  
  getUserLoops: async (): Promise<Loop[]> => {
    await delay(500);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    const loops = getLoopsFromStorage();
    return loops.filter(loop => loop.userId === currentUser.id);
  },
  
  getLoop: async (id: string): Promise<Loop> => {
    await delay(300);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    const loops = getLoopsFromStorage();
    const loop = loops.find(loop => loop.id === id && loop.userId === currentUser.id);
    
    if (!loop) {
      throw new Error('Loop not found');
    }
    
    return loop;
  },
  
  createLoop: async (loopData: Omit<Loop, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'completionRate' | 'createdAt' | 'updatedAt' | 'status' | 'days' | 'cheers'>): Promise<Loop> => {
    await delay(800);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    const loops = getLoopsFromStorage();
    
    const newLoop: Loop = {
      id: generateId(),
      userId: currentUser.id,
      ...loopData,
      status: 'active',
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      days: generateInitialDays(loopData.startDate, loopData.frequency),
      cheers: []
    };
    
    const metrics = calculateStreakMetrics(newLoop.days);
    newLoop.currentStreak = metrics.currentStreak;
    newLoop.longestStreak = metrics.longestStreak;
    newLoop.completionRate = metrics.completionRate;
    
    newLoop.status = determineLoopStatus(newLoop.days);
    
    loops.push(newLoop);
    saveLoopsToStorage(loops);
    
    if (loopData.visibility === 'public') {
      const publicLoops = getPublicLoopsFromStorage();
      
      const daysCount = Object.values(newLoop.days).reduce(
        (acc, status) => {
          if (status === 'checked') acc.checked++;
          else if (status === 'missed') acc.missed++;
          else if (status === 'pending') acc.pending++;
          return acc;
        },
        { checked: 0, missed: 0, pending: 0 }
      );
      
      const publicLoop: PublicLoop = {
        ...newLoop,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        daysCount
      };
      
      publicLoops.push(publicLoop);
      sessionStorage.setItem(PUBLIC_LOOPS_KEY, JSON.stringify(publicLoops));
    }
    
    toast('Loop created successfully');
    return newLoop;
  },
  
  updateLoop: async (id: string, updates: Partial<Loop>): Promise<Loop> => {
    await delay(500);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    let loops = getLoopsFromStorage();
    const loopIndex = loops.findIndex(loop => loop.id === id && loop.userId === currentUser.id);
    
    if (loopIndex === -1) {
      throw new Error('Loop not found');
    }
    
    loops[loopIndex] = {
      ...loops[loopIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    if (updates.days) {
      const metrics = calculateStreakMetrics(loops[loopIndex].days);
      loops[loopIndex].currentStreak = metrics.currentStreak;
      loops[loopIndex].longestStreak = metrics.longestStreak;
      loops[loopIndex].completionRate = metrics.completionRate;
      
      loops[loopIndex].status = determineLoopStatus(loops[loopIndex].days);
    }
    
    saveLoopsToStorage(loops);
    
    if (loops[loopIndex].visibility === 'public') {
      const publicLoops = getPublicLoopsFromStorage();
      const publicIndex = publicLoops.findIndex(loop => loop.id === id);
      
      if (publicIndex !== -1) {
        const daysCount = Object.values(loops[loopIndex].days).reduce(
          (acc, status) => {
            if (status === 'checked') acc.checked++;
            else if (status === 'missed') acc.missed++;
            else if (status === 'pending') acc.pending++;
            return acc;
          },
          { checked: 0, missed: 0, pending: 0 }
        );
        
        publicLoops[publicIndex] = {
          ...loops[loopIndex],
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar
          },
          daysCount
        };
        
        sessionStorage.setItem(PUBLIC_LOOPS_KEY, JSON.stringify(publicLoops));
      } else {
        const daysCount = Object.values(loops[loopIndex].days).reduce(
          (acc, status) => {
            if (status === 'checked') acc.checked++;
            else if (status === 'missed') acc.missed++;
            else if (status === 'pending') acc.pending++;
            return acc;
          },
          { checked: 0, missed: 0, pending: 0 }
        );
        
        const publicLoop: PublicLoop = {
          ...loops[loopIndex],
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar
          },
          daysCount
        };
        
        publicLoops.push(publicLoop);
        sessionStorage.setItem(PUBLIC_LOOPS_KEY, JSON.stringify(publicLoops));
      }
    }
    
    return loops[loopIndex];
  },
  
  deleteLoop: async (id: string): Promise<void> => {
    await delay(500);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    let loops = getLoopsFromStorage();
    loops = loops.filter(loop => !(loop.id === id && loop.userId === currentUser.id));
    
    saveLoopsToStorage(loops);
    
    let publicLoops = getPublicLoopsFromStorage();
    publicLoops = publicLoops.filter(loop => loop.id !== id);
    sessionStorage.setItem(PUBLIC_LOOPS_KEY, JSON.stringify(publicLoops));
    
    toast('Loop deleted successfully');
  },
  
  updateDayStatus: async (loopId: string, date: string, status: DayStatus): Promise<Loop> => {
    await delay(300);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    let loops = getLoopsFromStorage();
    const loopIndex = loops.findIndex(loop => loop.id === loopId && loop.userId === currentUser.id);
    
    if (loopIndex === -1) {
      throw new Error('Loop not found');
    }
    
    loops[loopIndex].days = {
      ...loops[loopIndex].days,
      [date]: status
    };
    
    const metrics = calculateStreakMetrics(loops[loopIndex].days);
    loops[loopIndex].currentStreak = metrics.currentStreak;
    loops[loopIndex].longestStreak = metrics.longestStreak;
    loops[loopIndex].completionRate = metrics.completionRate;
    loops[loopIndex].updatedAt = new Date().toISOString();
    
    const dayCount = Object.keys(loops[loopIndex].days).length;
    if (dayCount >= 30 && metrics.completionRate >= 90) {
      loops[loopIndex].status = 'completed';
    } else if (status === 'missed' && metrics.currentStreak === 0) {
      loops[loopIndex].status = 'broken';
    } else if (metrics.currentStreak > 0) {
      loops[loopIndex].status = 'active';
    }
    
    saveLoopsToStorage(loops);
    
    if (loops[loopIndex].visibility === 'public') {
      const publicLoops = getPublicLoopsFromStorage();
      const publicIndex = publicLoops.findIndex(loop => loop.id === loopId);
      
      if (publicIndex !== -1) {
        const daysCount = Object.values(loops[loopIndex].days).reduce(
          (acc, status) => {
            if (status === 'checked') acc.checked++;
            else if (status === 'missed') acc.missed++;
            else if (status === 'pending') acc.pending++;
            return acc;
          },
          { checked: 0, missed: 0, pending: 0 }
        );
        
        publicLoops[publicIndex] = {
          ...loops[loopIndex],
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar
          },
          daysCount
        };
        
        sessionStorage.setItem(PUBLIC_LOOPS_KEY, JSON.stringify(publicLoops));
      }
    }
    
    if (status === 'checked') {
      toast('Great job! You checked in for today.');
    } else if (status === 'missed') {
      toast('No worries, you can get back on track tomorrow!');
    }
    
    return loops[loopIndex];
  },
  
  getPublicLoops: async (): Promise<PublicLoop[]> => {
    await delay(800);
    return getPublicLoopsFromStorage();
  },
  
  addCheer: async (loopId: string, emoji: string): Promise<void> => {
    await delay(300);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    const publicLoops = getPublicLoopsFromStorage();
    const loopIndex = publicLoops.findIndex(loop => loop.id === loopId);
    
    if (loopIndex === -1) {
      throw new Error('Loop not found');
    }
    
    const alreadyCheered = publicLoops[loopIndex].cheers.some(
      cheer => cheer.userId === currentUser.id && cheer.emoji === emoji
    );
    
    if (alreadyCheered) {
      publicLoops[loopIndex].cheers = publicLoops[loopIndex].cheers.filter(
        cheer => !(cheer.userId === currentUser.id && cheer.emoji === emoji)
      );
    } else {
      publicLoops[loopIndex].cheers.push({
        id: generateId(),
        userId: currentUser.id,
        userName: currentUser.name,
        emoji,
        timestamp: new Date().toISOString()
      });
    }
    
    sessionStorage.setItem(PUBLIC_LOOPS_KEY, JSON.stringify(publicLoops));
    
    if (publicLoops[loopIndex].userId === currentUser.id) {
      const loops = getLoopsFromStorage();
      const personalLoopIndex = loops.findIndex(loop => loop.id === loopId);
      
      if (personalLoopIndex !== -1) {
        loops[personalLoopIndex].cheers = publicLoops[loopIndex].cheers;
        saveLoopsToStorage(loops);
      }
    }
    
    if (!alreadyCheered) {
      toast('Cheer added!');
    } else {
      toast('Cheer removed!');
    }
  },
  
  cloneLoop: async (publicLoopId: string): Promise<Loop> => {
    await delay(800);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    const publicLoops = getPublicLoopsFromStorage();
    const publicLoop = publicLoops.find(loop => loop.id === publicLoopId);
    
    if (!publicLoop) {
      throw new Error('Public loop not found');
    }
    
    const loops = getLoopsFromStorage();
    
    const today = new Date().toISOString().split('T')[0];
    const newLoop: Loop = {
      id: generateId(),
      userId: currentUser.id,
      title: `${publicLoop.title} (Cloned)`,
      emoji: publicLoop.emoji,
      coverImage: publicLoop.coverImage,
      frequency: publicLoop.frequency,
      startDate: today,
      visibility: 'private',
      status: 'active',
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      days: { [today]: 'pending' },
      cheers: []
    };
    
    loops.push(newLoop);
    saveLoopsToStorage(loops);
    
    toast(`Cloned "${publicLoop.title}" to your loops`);
    
    loopService.initializeDemo();
    
    return newLoop;
  }
};

export default loopService;
