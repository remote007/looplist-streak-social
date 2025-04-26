
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { loopService } from '@/services/loopService';
import { PublicLoop } from '@/types';
import { Search, Clock, Calendar, Copy, Heart, TrendingUp, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const Explore = () => {
  const { user } = useAuth();
  const [publicLoops, setPublicLoops] = useState<PublicLoop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'streak'>('recent');
  const [loadingClone, setLoadingClone] = useState<string | null>(null);
  const [loadingCheer, setLoadingCheer] = useState<{loopId: string, emoji: string} | null>(null);

  useEffect(() => {
    const fetchPublicLoops = async () => {
      try {
        const fetchedLoops = await loopService.getPublicLoops();
        setPublicLoops(fetchedLoops);
      } catch (error) {
        console.error('Error fetching public loops:', error);
        toast('Failed to load public loops');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicLoops();
  }, []);

  const handleCloneLoop = async (loopId: string) => {
    try {
      setLoadingClone(loopId);
      await loopService.cloneLoop(loopId);
      toast('Loop cloned successfully! Find it in your dashboard.');
    } catch (error) {
      console.error('Error cloning loop:', error);
      toast('Failed to clone loop');
    } finally {
      setLoadingClone(null);
    }
  };

  const handleCheerLoop = async (loopId: string, emoji: string) => {
    try {
      setLoadingCheer({ loopId, emoji });
      await loopService.addCheer(loopId, emoji);
      
      // Update the publicLoops state to reflect the new cheer
      setPublicLoops(prevLoops => 
        prevLoops.map(loop => {
          if (loop.id === loopId) {
            const alreadyCheered = loop.cheers.some(
              cheer => cheer.userId === user?.id && cheer.emoji === emoji
            );
            
            if (alreadyCheered) {
              // Remove the cheer
              return {
                ...loop,
                cheers: loop.cheers.filter(
                  cheer => !(cheer.userId === user?.id && cheer.emoji === emoji)
                )
              };
            } else {
              // Add the cheer
              return {
                ...loop,
                cheers: [
                  ...loop.cheers,
                  {
                    id: Math.random().toString(),
                    userId: user?.id || '',
                    userName: user?.name || '',
                    emoji,
                    timestamp: new Date().toISOString()
                  }
                ]
              };
            }
          }
          return loop;
        })
      );
    } catch (error) {
      console.error('Error adding cheer:', error);
      toast('Failed to add cheer');
    } finally {
      setLoadingCheer(null);
    }
  };

  const filteredLoops = publicLoops
    .filter(loop => 
      loop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loop.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.longestStreak - a.longestStreak;
      }
    });

  const renderStreakDots = (count: number, maxDots = 10) => {
    const dots = [];
    const displayCount = Math.min(count, maxDots);
    
    for (let i = 0; i < displayCount; i++) {
      dots.push(
        <div 
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < displayCount ? 'bg-loop-active' : 'bg-gray-200'
          }`}
        />
      );
    }
    
    return (
      <div className="flex space-x-1">
        {dots}
        {count > maxDots && <span className="text-xs text-gray-500 ml-1">+{count - maxDots}</span>}
      </div>
    );
  };

  const hasUserCheered = (loop: PublicLoop, emoji: string) => {
    return loop.cheers.some(cheer => 
      cheer.userId === user?.id && cheer.emoji === emoji
    );
  };

  const getCheerCount = (loop: PublicLoop, emoji: string) => {
    return loop.cheers.filter(cheer => cheer.emoji === emoji).length;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Explore Public Loops</h1>
          <p className="text-muted-foreground">Discover and clone habit loops from other users</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-[260px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search loops or users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            <Clock className="mr-1 h-4 w-4" />
            Recent
          </Button>
          <Button
            variant={sortBy === 'streak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('streak')}
          >
            <TrendingUp className="mr-1 h-4 w-4" />
            Streaks
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="h-4 w-3/4 bg-muted rounded mb-3"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <div className="h-8 w-20 bg-muted rounded"></div>
                <div className="h-8 w-20 bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredLoops.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          {searchQuery ? (
            <>
              <h3 className="text-lg font-medium mb-2">No matching loops found</h3>
              <p className="text-muted-foreground">Try a different search term</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-2">No public loops available</h3>
              <p className="text-muted-foreground">Be the first to share a public loop!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoops.map((loop) => (
            <Card key={loop.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={loop.user.avatar} alt={loop.user.name} />
                      <AvatarFallback>{loop.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{loop.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(loop.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    loop.status === 'active' ? 'bg-green-100 text-green-700' :
                    loop.status === 'broken' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {loop.status === 'active' ? 'Active' : 
                     loop.status === 'broken' ? 'Broken' : 'Completed'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{loop.emoji || '🔄'}</span>
                  <h3 className="font-medium leading-none">{loop.title}</h3>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{loop.frequency}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    <span>Streak: {loop.currentStreak} days</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  {renderStreakDots(loop.currentStreak)}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{Math.round(loop.completionRate)}%</span>
                    <span className="text-muted-foreground ml-1">completion rate</span>
                  </div>
                  <div>
                    <span className="font-medium">{loop.longestStreak}</span>
                    <span className="text-muted-foreground ml-1">longest streak</span>
                  </div>
                </div>
              </CardContent>
              
              <Separator />
              
              <CardFooter className="pt-3">
                <div className="flex items-center gap-2">
                  {['🔥', '👏', '💯'].map((emoji) => (
                    <Button
                      key={emoji}
                      variant={hasUserCheered(loop, emoji) ? "default" : "outline"}
                      size="sm"
                      className="gap-1"
                      disabled={!user || loadingCheer !== null}
                      onClick={() => handleCheerLoop(loop.id, emoji)}
                    >
                      {loadingCheer?.loopId === loop.id && loadingCheer?.emoji === emoji ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span>{emoji}</span>
                      )}
                      <span>{getCheerCount(loop, emoji) || ''}</span>
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  disabled={loadingClone === loop.id}
                  onClick={() => handleCloneLoop(loop.id)}
                >
                  {loadingClone === loop.id ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="mr-1 h-4 w-4" />
                  )}
                  Clone
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
