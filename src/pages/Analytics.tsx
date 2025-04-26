
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { loopService } from '@/services/loopService';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

const Analytics = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - replace with real data from your loops
  const weeklyProgress = [
    { name: 'Mon', completed: 5, missed: 2 },
    { name: 'Tue', completed: 6, missed: 1 },
    { name: 'Wed', completed: 4, missed: 3 },
    { name: 'Thu', completed: 7, missed: 0 },
    { name: 'Fri', completed: 3, missed: 4 },
    { name: 'Sat', completed: 5, missed: 2 },
    { name: 'Sun', completed: 6, missed: 1 },
  ];

  const habitDistribution = [
    { name: 'Active', value: 12 },
    { name: 'Broken', value: 5 },
    { name: 'Completed', value: 3 },
  ];

  const streakData = [
    { name: 'Week 1', streak: 3 },
    { name: 'Week 2', streak: 5 },
    { name: 'Week 3', streak: 7 },
    { name: 'Week 4', streak: 4 },
  ];

  const completionTrend = [
    { name: 'Jan', rate: 65 },
    { name: 'Feb', rate: 75 },
    { name: 'Mar', rate: 85 },
    { name: 'Apr', rate: 80 },
  ];

  const colors = {
    active: '#10B981',
    broken: '#EF4444',
    completed: '#6366F1',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
                <CardDescription>Completed vs Missed check-ins</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill={colors.active} name="Completed" />
                    <Bar dataKey="missed" fill={colors.broken} name="Missed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Habit Distribution</CardTitle>
                <CardDescription>Current status of your habits</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={habitDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {habitDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Active' ? colors.active :
                            entry.name === 'Broken' ? colors.broken :
                            colors.completed
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Streak Evolution</CardTitle>
              <CardDescription>Weekly streak progression</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="streak"
                    stroke={colors.active}
                    fill={colors.active}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completion Rate Trend</CardTitle>
              <CardDescription>Monthly completion rate analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={colors.completed}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
