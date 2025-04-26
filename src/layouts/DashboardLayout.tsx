
import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loopService } from '@/services/loopService';

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Initialize demo data when the dashboard loads
    if (isAuthenticated) {
      loopService.initializeDemo();
    }
  }, [isAuthenticated]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/30 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary"></div>
          </div>
          <div className="mt-4 text-sm font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to landing if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col dashboard-gradient">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
