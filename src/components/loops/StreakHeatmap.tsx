
import React from 'react';
import { Loop } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, parseISO, isAfter, isBefore, startOfWeek } from 'date-fns';

interface StreakHeatmapProps {
  loop: Loop;
  maxDays?: number;
}

const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ loop, maxDays = 14 }) => {
  // Get the days to display
  const getDaysToDisplay = () => {
    const today = new Date();
    const startDate = parseISO(loop.startDate);
    const days: { date: string; status: string }[] = [];

    // Get earliest date to display
    let earliestDate = new Date(today);
    earliestDate.setDate(today.getDate() - maxDays);

    // If start date is after earliest date, use start date
    const effectiveStart = isBefore(startDate, earliestDate) ? earliestDate : startDate;
    
    // Create an array of dates from start to today
    const currentDate = new Date(effectiveStart);
    while (!isAfter(currentDate, today)) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // First check if this day should be tracked based on frequency
      let shouldTrack = true;
      const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
      
      if (loop.frequency === 'weekdays') {
        shouldTrack = dayOfWeek !== 0 && dayOfWeek !== 6; // Not weekend
      } else if (loop.frequency === '3x-week') {
        // For demo purposes, track Monday, Wednesday, Friday
        shouldTrack = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
      } else if (loop.frequency === 'custom') {
        // For demo, track every other day
        const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        shouldTrack = daysSinceStart % 2 === 0;
      }
      
      if (shouldTrack) {
        const status = loop.days[dateString] || (
          isAfter(currentDate, today) ? 'future' : 'pending'
        );
        
        days.push({ date: dateString, status });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const daysToDisplay = getDaysToDisplay();

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1 justify-center">
        {daysToDisplay.map(({ date, status }) => (
          <Tooltip key={date}>
            <TooltipTrigger>
              <div 
                className={`streak-square ${
                  status === 'checked' ? 'streak-square-active' : 
                  status === 'missed' ? 'streak-square-broken' : 
                  status === 'pending' ? 'streak-square-empty' : 
                  'streak-square-empty opacity-50'
                }`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p>{format(parseISO(date), 'EEEE, MMM d')}</p>
                <p>{status === 'checked' ? 'Completed' : 
                   status === 'missed' ? 'Missed' : 
                   status === 'pending' ? 'Pending' : 'Future'}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default StreakHeatmap;
