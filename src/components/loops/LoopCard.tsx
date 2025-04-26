import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { loopService } from '@/services/loopService';
import { Loop, DayStatus } from '@/types';
import { 
  Calendar, 
  Check, 
  X, 
  Lock, 
  Globe, 
  Users, 
  Trash2,
  Loader2,
  Share2,
  Facebook,
  Instagram
} from 'lucide-react';
import { format } from 'date-fns';
import StreakHeatmap from './StreakHeatmap';
import { toast } from '@/components/ui/sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface LoopCardProps {
  loop: Loop;
  onUpdate: (loop: Loop) => void;
  onDelete: (id: string) => void;
}

const LoopCard = ({ loop, onUpdate, onDelete }: LoopCardProps) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCheckIn = async (status: DayStatus) => {
    try {
      setIsCheckingIn(true);
      const today = new Date().toISOString().split('T')[0];
      
      const updatedLoop = await loopService.updateDayStatus(loop.id, today, status);
      onUpdate(updatedLoop);
      
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 2000);
    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleDeleteLoop = async () => {
    try {
      setIsDeleting(true);
      await loopService.deleteLoop(loop.id);
      onDelete(loop.id);
    } catch (error) {
      console.error('Error deleting loop:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = (platform: 'facebook' | 'instagram') => {
    const shareText = `Check out my habit loop "${loop.title}" on LoopList! I'm on a ${loop.currentStreak} day streak! 🎯`;
    const shareUrl = `${window.location.origin}/loops/${loop.id}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'instagram':
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        toast('Share text copied to clipboard! Open Instagram to share.');
        break;
    }
  };

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekdays': return 'Weekdays';
      case '3x-week': return '3x per week';
      case 'custom': return 'Custom';
      default: return frequency;
    }
  };

  const getStatusIcon = () => {
    switch (loop.status) {
      case 'active': return <div className="h-2 w-2 rounded-full bg-loop-active"></div>;
      case 'broken': return <div className="h-2 w-2 rounded-full bg-loop-broken"></div>;
      case 'completed': return <div className="h-2 w-2 rounded-full bg-loop-completed"></div>;
      default: return null;
    }
  };

  const getVisibilityIcon = () => {
    switch (loop.visibility) {
      case 'private': return <Lock className="h-4 w-4" />;
      case 'public': return <Globe className="h-4 w-4" />;
      case 'friends': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayStatus = loop.days[today];
  const hasCheckedIn = todayStatus === 'checked';

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${
      loop.status === 'active' ? 'border-l-4 border-l-loop-active' :
      loop.status === 'broken' ? 'border-l-4 border-l-loop-broken' :
      'border-l-4 border-l-loop-completed'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{loop.emoji || '🔄'}</span>
            <div>
              <CardTitle className="text-lg">{loop.title}</CardTitle>
              <CardDescription>
                Started {format(new Date(loop.startDate), 'MMM d, yyyy')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getVisibilityIcon()}
            {loop.visibility === 'public' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare('facebook')}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('instagram')}>
                    <Instagram className="h-4 w-4 mr-2" />
                    Share on Instagram
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Frequency: {formatFrequency(loop.frequency)}</span>
            <span className="font-medium">{Math.round(loop.completionRate)}% complete</span>
          </div>
          
          <StreakHeatmap loop={loop} />
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold">{loop.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current streak</div>
            </div>
            <div>
              <div className="text-xl font-bold">{loop.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest streak</div>
            </div>
            <div>
              <div className="text-xl font-bold">
                {Object.values(loop.days).filter(status => status === 'checked').length}
              </div>
              <div className="text-xs text-muted-foreground">Days completed</div>
            </div>
          </div>
          
          {showConfirmation && (
            <Alert>
              <AlertDescription>
                {hasCheckedIn ? "Great job! You've checked in for today." : "You've marked today as missed."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 flex justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={hasCheckedIn ? "default" : "outline"}
            size="sm"
            disabled={isCheckingIn}
            onClick={() => handleCheckIn('checked')}
          >
            {isCheckingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            Done
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isCheckingIn}
            onClick={() => handleCheckIn('missed')}
          >
            <X className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the "{loop.title}" loop and all of its streak data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteLoop} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default LoopCard;
