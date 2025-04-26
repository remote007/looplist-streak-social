
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Palette, Check } from "lucide-react";

const Themes = () => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value as 'default' | 'modern' | 'vintage');
  };

  const applyTheme = () => {
    setTheme(selectedTheme as 'default' | 'modern' | 'vintage');
  };

  const themeOptions = [
    {
      id: 'default',
      name: 'Default Theme',
      description: 'Clean and minimalist design with purple accents',
      preview: {
        primary: '#8B5CF6',
        background: '#F9FAFB',
        text: '#1F2937'
      }
    },
    {
      id: 'modern',
      name: 'Modern Dark',
      description: 'Sleek dark mode with blue accents and rounded corners',
      preview: {
        primary: '#0EA5E9',
        background: '#0F172A',
        text: '#F1F5F9'
      }
    },
    {
      id: 'vintage',
      name: 'Vintage',
      description: 'Warm, classic design with serif fonts and earthy tones',
      preview: {
        primary: '#B45309',
        background: '#FFFBEB',
        text: '#78350F'
      }
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Themes</h1>
        <p className="text-muted-foreground">Personalize your LoopList experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Your Theme</CardTitle>
          <CardDescription>
            Select a theme that suits your style and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedTheme} 
            onValueChange={handleThemeChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {themeOptions.map(option => (
              <div key={option.id} className="relative">
                <RadioGroupItem 
                  value={option.id} 
                  id={option.id} 
                  className="sr-only"
                />
                <Label
                  htmlFor={option.id}
                  className={`
                    block p-4 rounded-lg cursor-pointer border-2 transition-all
                    ${selectedTheme === option.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div 
                    className="h-24 rounded-md mb-4"
                    style={{
                      background: option.preview.background,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div 
                      className="w-16 h-8 rounded-full"
                      style={{ background: option.preview.primary }}
                    ></div>
                  </div>
                  <div className="font-medium mb-1">{option.name}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                  
                  {selectedTheme === option.id && (
                    <div className="absolute top-4 right-4 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={applyTheme} 
            disabled={theme === selectedTheme}
            className="ml-auto"
          >
            <Palette className="mr-2 h-4 w-4" />
            Apply Theme
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Themes;
