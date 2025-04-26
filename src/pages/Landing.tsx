
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Footer from '@/components/layout/Footer';
import { User, CalendarCheck, Check } from 'lucide-react';

const Landing = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-4rem)]">
          {/* Left Side - About */}
          <div className="hero-gradient flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="max-w-md mx-auto animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">LoopList</h1>
              <p className="text-xl md:text-2xl mb-6 text-gray-800">Social Streak Tracker for Micro-Habits</p>
              <div className="space-y-6 my-10">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CalendarCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Track Your Streaks</h3>
                    <p className="text-gray-600">Build consistent habits with visual streak tracking.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Public Accountability</h3>
                    <p className="text-gray-600">Share your habits and get support from others.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Micro-Habits Focus</h3>
                    <p className="text-gray-600">Small, achievable daily actions lead to big changes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white dark:bg-gray-900">
            <div className="max-w-md mx-auto w-full">
              <Card className="border shadow-lg">
                <CardContent className="pt-6">
                  <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <LoginForm />
                    </TabsContent>
                    <TabsContent value="register">
                      <RegisterForm setActiveTab={setActiveTab} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
