
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { loopService } from '@/services/loopService';
import { Loop } from '@/types';
import { Plus, Calendar, TrendingUp, Award, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreateLoopForm from '@/components/loops/CreateLoopForm';
import LoopCard from '@/components/loops/LoopCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [loops, setLoops] = useState<Loop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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

  const handleLoopCreated = (newLoop: Loop) => {
    setLoops([...loops, newLoop]);
    setIsDialogOpen(false);
  };

  const handleUpdateLoop = (updatedLoop: Loop) => {
    setLoops(loops.map(loop => loop.id === updatedLoop.id ? updatedLoop : loop));
  };

  const handleDeleteLoop = (id: string) => {
    setLoops(loops.filter(loop => loop.id !== id));
  };

  const filteredLoops = loops.filter(loop => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return loop.status === "active";
    if (activeTab === "broken") return loop.status === "broken";
    if (activeTab === "completed") return loop.status === "completed";
    return true;
  });

  const stats = {
    active: loops.filter(loop => loop.status === "active").length,
    broken: loops.filter(loop => loop.status === "broken").length,
    completed: loops.filter(loop => loop.status === "completed").length,
    longestStreak: loops.reduce((max, loop) => Math.max(max, loop.longestStreak), 0),
  };

  return (
    <div className="space-y-8">
      {/* Welcome and Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Loops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Current active habit loops</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Broken Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.broken}</div>
            <p className="text-xs text-muted-foreground">Habits with broken streaks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Fully completed habit loops</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.longestStreak}</div>
            <p className="text-xs text-muted-foreground">Your best streak so far</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Loops */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Your Loops</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Loop
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Loop</DialogTitle>
                <DialogDescription>
                  Add a new habit loop to track. Start small and build consistency.
                </DialogDescription>
              </DialogHeader>
              <CreateLoopForm onLoopCreated={handleLoopCreated} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="broken">Broken</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-muted"></CardHeader>
                    <CardContent className="py-4">
                      <div className="h-4 w-3/4 bg-muted rounded mb-3"></div>
                      <div className="h-3 w-1/2 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredLoops.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No loops found</h3>
                <p className="text-muted-foreground mb-6">Get started by creating your first loop</p>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Loop
                  </Button>
                </DialogTrigger>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLoops.map((loop) => (
                  <LoopCard 
                    key={loop.id} 
                    loop={loop} 
                    onUpdate={handleUpdateLoop} 
                    onDelete={handleDeleteLoop}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="active" className="mt-6">
            {filteredLoops.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No active loops</h3>
                <p className="text-muted-foreground mb-6">Create a new loop to start building habits</p>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create New Loop
                  </Button>
                </DialogTrigger>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLoops.map((loop) => (
                  <LoopCard 
                    key={loop.id} 
                    loop={loop} 
                    onUpdate={handleUpdateLoop} 
                    onDelete={handleDeleteLoop}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="broken" className="mt-6">
            {filteredLoops.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <X className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No broken streaks</h3>
                <p className="text-muted-foreground mb-6">Great job! Keep up the consistency</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLoops.map((loop) => (
                  <LoopCard 
                    key={loop.id} 
                    loop={loop} 
                    onUpdate={handleUpdateLoop} 
                    onDelete={handleDeleteLoop}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            {filteredLoops.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Award className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No completed loops</h3>
                <p className="text-muted-foreground mb-6">Complete your habits to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLoops.map((loop) => (
                  <LoopCard 
                    key={loop.id} 
                    loop={loop} 
                    onUpdate={handleUpdateLoop} 
                    onDelete={handleDeleteLoop}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
