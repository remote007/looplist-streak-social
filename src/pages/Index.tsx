
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to landing or dashboard based on authentication
    const isLoggedIn = sessionStorage.getItem('looplist_user');
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-12 w-12 mx-auto rounded-full bg-primary/30 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-primary"></div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
