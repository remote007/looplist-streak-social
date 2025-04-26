
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loopService } from '@/services/loopService';
import { Loop, LoopFrequency, LoopVisibility } from '@/types';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  emoji: z.string().optional(),
  frequency: z.enum(['daily', 'weekdays', '3x-week', 'custom']),
  startDate: z.date(),
  visibility: z.enum(['private', 'public', 'friends']),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLoopFormProps {
  onLoopCreated: (loop: Loop) => void;
}

const emojis = ['📚', '🏋️', '🧘', '🍎', '💧', '🛌', '💪', '🧠', '🏃', '🚫', '🧹', '✏️', '🎯', '⏰', '🎸'];

const CreateLoopForm = ({ onLoopCreated }: CreateLoopFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('📚');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      emoji: '📚',
      frequency: 'daily',
      startDate: new Date(),
      visibility: 'private',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const loopData = {
        title: data.title,
        emoji: selectedEmoji,
        frequency: data.frequency as LoopFrequency,
        startDate: data.startDate.toISOString(),
        visibility: data.visibility as LoopVisibility,
      };
      
      const newLoop = await loopService.createLoop(loopData);
      onLoopCreated(newLoop);
    } catch (error) {
      console.error('Error creating loop:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[64px] min-h-[64px] text-3xl"
                  >
                    {selectedEmoji}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-2">
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 p-0 text-2xl"
                        onClick={() => {
                          setSelectedEmoji(emoji);
                          field.onChange(emoji);
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Loop Title</FormLabel>
                <FormControl>
                  <Input placeholder="Read 10 pages every day" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="3x-week">3x per week</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => date && field.onChange(date)}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Loop
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateLoopForm;
