
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { loopService } from '@/services/loopService';
import { useAuth } from '@/contexts/AuthContext';
import { Loop } from '@/types';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  ResponsiveContainer, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Line,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';
import { Calendar, TrendingUp, Clock, Loader2, Activity, BarChart2 } from 'lucide-react';
import { format, subDays, addDays, eachDayOfInterval } from 'date-fns';

const Analytics = () => {
  const { user } = useAuth();
  const [loops, setLoops] = useState<Loop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchLoops = async () => {
      try {
        const fetchedLoops = await loopService.getUserLoops();
        setLoops(fetchedLoops);
      } catch (error) {
        console.error('Error fetching loops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoops();
  }, []);

  const getTodaysStats = () => {
    const today = new Date().toISOString().split('T')[0];
    let completed = 0;
    let missed = 0;
    let pending = 0;

    loops.forEach(loop => {
      const status = loop.days[today];
      if (status === 'checked') completed++;
      else if (status === 'missed') missed++;
      else if (status === 'pending') pending++;
    });

    return {
      completed,
      missed,
      pending,
      total: completed + missed + pending
    };
  };

  const getCompletionByDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const completionByDay = Array(7).fill(0);
    const totalByDay = Array(7).fill(0);
    
    loops.forEach(loop => {
      Object.entries(loop.days).forEach(([date, status]) => {
        const day = new Date(date).getDay();
        if (status === 'checked') completionByDay[day]++;
        if (status !== 'future') totalByDay[day]++;
      });
    });

    return days.map((day, index) => ({
      name: day.substring(0, 3),
      completion: totalByDay[index] > 0 
        ? Math.round((completionByDay[index] / totalByDay[index]) * 100) 
        : 0
    }));
  };

  const getStreakProgress = () => {
    return loops.map(loop => ({
      name: loop.title.length > 15 ? loop.title.substring(0, 15) + '...' : loop.title,
      emoji: loop.emoji,
      currentStreak: loop.currentStreak,
      longestStreak: loop.longestStreak
    }));
  };

  const getCompletionOverTime = () => {
    const today = new Date();
    let startDate: Date;
    
    if (dateRange === 'week') {
      startDate = subDays(today, 7);
    } else if (dateRange === 'month') {
      startDate = subDays(today, 30);
    } else {
      startDate = subDays(today, 365);
    }
    
    const dateInterval = eachDayOfInterval({
      start: startDate,
      end: today
    });
    
    const completionData = dateInterval.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      let completed = 0;
      let total = 0;
      
      loops.forEach(loop => {
        const status = loop.days[dateString];
        if (status === 'checked' || status === 'missed') {
          total++;
          if (status === 'checked') completed++;
        }
      });
      
      return {
        date: format(date, dateRange === 'year' ? 'MMM yyyy' : 'MMM dd'),
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
    
    // If year, aggregate by month
    if (dateRange === 'year') {
      const monthlyData: {[key: string]: {date: string, total: number, completed: number}} = {};
      
      completionData.forEach(day => {
        if (!monthlyData[day.date]) {
          monthlyData[day.date] = {
            date: day.date,
            total: 0,
            completed: 0
          };
        }
        
        monthlyData[day.date].total += 1;
        monthlyData[day.date].completed += day.completionRate;
      });
      
      return Object.values(monthlyData).map(month => ({
        date: month.date,
        completionRate: month.total > 0 ? Math.round(month.completed / month.total) : 0
      }));
    }
    
    return completionData;
  };
  
  const getCategoryStats = () => {
    const categories: {[key: string]: number} = {};
    
    loops.forEach(loop => {
      const emoji = loop.emoji || '🔄';
      if (!categories[emoji]) {
        categories[emoji] = 0;
      }
      categories[emoji]++;
    });
    
    return Object.entries(categories).map(([emoji, count]) => ({
      name: emoji,
      value: count
    }));
  };
  
  const getRadarData = () => {
    const data = [
      { subject: 'Consistency', fullMark: 100 },
      { subject: 'Variety', fullMark: 100 },
      { subject: 'Streaks', fullMark: 100 },
      { subject: 'Completion', fullMark: 100 },
      { subject: 'Engagement', fullMark: 100 },
    ];
    
    // Calculate metrics
    const totalLoops = loops.length;
    const uniqueEmojis = new Set(loops.map(loop => loop.emoji)).size;
    const avgStreak = loops.reduce((sum, loop) => sum + loop.currentStreak, 0) / (totalLoops || 1);
    const maxPossibleStreak = 30; // Arbitrary max value for normalization
    
    const avgCompletionRate = loops.reduce((sum, loop) => sum + loop.completionRate, 0) / (totalLoops || 1);
    
    const publicLoops = loops.filter(loop => loop.visibility === 'public').length;
    const engagement = totalLoops > 0 ? (publicLoops / totalLoops) * 100 : 0;
    
    const todayStats = getTodaysStats();
    const todayCompletionRate = todayStats.total > 0 
      ? (todayStats.completed / todayStats.total) * 100 
      : 0;
    
    data[0].A = Math.min(100, todayCompletionRate);
    data[1].A = Math.min(100, (uniqueEmojis / Math.max(1, totalLoops)) * 100);
    data[2].A = Math.min(100, (avgStreak / maxPossibleStreak) * 100);
    data[3].A = Math.min(100, avgCompletionRate);
    data[4].A = Math.min(100, engagement);
    
    return data;
  };
  
  const getStatusDistribution = () => {
    let active = 0;
    let broken = 0;
    let completed = 0;
    
    loops.forEach(loop => {
      if (loop.status === 'active') active++;
      else if (loop.status === 'broken') broken++;
      else if (loop.status === 'completed') completed++;
    });
    
    return [
      { name: 'Active', value: active },
      { name: 'Broken', value: broken },
      { name: 'Completed', value: completed }
    ];
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const STATUS_COLORS = {
    active: '#10B981', // green
    broken: '#EF4444', // red
    completed: '#6366F1' // indigo
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track and analyze your habit formation progress
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BarChart2 className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getTodaysStats().completed}/{getTodaysStats().total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Loops completed today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Loops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loops.filter(loop => loop.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current active habit loops
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(loops.reduce((sum, loop) => sum + loop.currentStreak, 0) / (loops.length || 1))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Days across all active loops
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(loops.reduce((sum, loop) => sum + loop.completionRate, 0) / (loops.length || 1))}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across all loops
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loop Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of your loops by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStatusDistribution().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance By Day</CardTitle>
                <CardDescription>
                  Success rates for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getCompletionByDay()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(tick) => `${tick}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                      <Bar dataKey="completion" fill="#8884d8" name="Completion Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current vs Longest Streaks</CardTitle>
                <CardDescription>
                  Compare your current streaks against your records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getStreakProgress()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tickLine={false}
                        tick={(props) => {
                          const { x, y, payload } = props;
                          const loop = getStreakProgress().find(l => l.name === payload.value);
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text x={-20} y={4} textAnchor="end" fontSize={12}>
                                {loop?.emoji}
                              </text>
                              <text x={-30} y={4} textAnchor="end" fontSize={12}>
                                {payload.value}
                              </text>
                            </g>
                          );
                        }}
                        width={120}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="currentStreak" fill="#0ea5e9" name="Current Streak" />
                      <Bar dataKey="longestStreak" fill="#8884d8" name="Longest Streak" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Completion Rate Over Time</CardTitle>
                <CardDescription>
                  Track your daily habit completion progress
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={dateRange === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setDateRange('week')}
                >
                  Week
                </Button>
                <Button
                  variant={dateRange === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setDateRange('month')}
                >
                  Month
                </Button>
                <Button
                  variant={dateRange === 'year' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setDateRange('year')}
                >
                  Year
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getCompletionOverTime()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={dateRange === 'year' ? { fontSize: 12 } : { fontSize: 10 }}
                      interval={dateRange === 'year' ? 0 : dateRange === 'month' ? 2 : 'preserveEnd'}
                    />
                    <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completionRate"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Completion Rate"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Loop Distribution</CardTitle>
                <CardDescription>
                  Breakdown of loops by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryStats()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCategoryStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Habit Performance Overview</CardTitle>
                <CardDescription>
                  Multi-dimensional analysis of your habits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Habit Insights</CardTitle>
              <CardDescription>
                AI-generated insights based on your habit data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Best Performing Day
                </h3>
                <p className="text-sm">
                  {(() => {
                    const dayStats = getCompletionByDay();
                    const bestDay = dayStats.reduce(
                      (best, day) => day.completion > best.completion ? day : best, 
                      dayStats[0]
                    );
                    return `Your most successful day is ${bestDay.name} with a ${bestDay.completion}% completion rate. Consider scheduling your most challenging habits on this day.`;
                  })()}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Streak Analysis
                </h3>
                <p className="text-sm">
                  {(() => {
                    const avgStreak = loops.reduce((sum, loop) => sum + loop.currentStreak, 0) / (loops.length || 1);
                    const maxStreak = loops.reduce((max, loop) => Math.max(max, loop.longestStreak), 0);
                    return `Your average current streak is ${Math.round(avgStreak)} days, while your all-time best is ${maxStreak} days. ${
                      avgStreak < maxStreak / 2 
                        ? "You're below your potential. Try to be more consistent." 
                        : "You're maintaining good consistency across your habits!"
                    }`;
                  })()}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Habit Balance
                </h3>
                <p className="text-sm">
                  {(() => {
                    const active = loops.filter(loop => loop.status === 'active').length;
                    const total = loops.length;
                    return `You have ${active} active habits out of ${total} total. ${
                      active >= 5 
                        ? "That's quite a few habits to manage at once. Consider focusing on fewer habits for better results." 
                        : active <= 1 
                          ? "You might benefit from adding 1-2 more complementary habits to your routine."
                          : "That's a good balance of habits to maintain consistently."
                    }`;
                  })()}
                </p>
              </div>

              {loops.length > 0 && (
                <div className="p-4 bg-muted rounded-lg border">
                  <h3 className="font-semibold mb-2">Most Successful Habit</h3>
                  <p className="text-sm">
                    {(() => {
                      const bestLoop = loops.reduce(
                        (best, loop) => loop.completionRate > best.completionRate ? loop : best, 
                        loops[0]
                      );
                      return `"${bestLoop.title}" ${bestLoop.emoji} is your most consistent habit with ${Math.round(bestLoop.completionRate)}% completion rate. What makes this habit easy to maintain? Apply those principles to other habits.`;
                    })()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
