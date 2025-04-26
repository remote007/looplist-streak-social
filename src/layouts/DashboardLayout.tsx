
// Just update the navigation items to include Themes and correct order
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  BarChart2,
  Globe,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  Palette,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive, onClick }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
      isActive 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
    }`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  const navigationItems = [
    { to: '/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
    { to: '/explore', icon: <Globe size={18} />, label: 'Explore' },
    { to: '/themes', icon: <Palette size={18} />, label: 'Themes' },
    { to: '/profile', icon: <User size={18} />, label: 'Profile' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' }
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-primary text-white h-8 w-8 rounded-md flex items-center justify-center">
                <span className="font-bold">L</span>
              </div>
              <span className="font-semibold text-lg">LoopList</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-80">
                <SheetHeader className="mb-4">
                  <SheetTitle>
                    <Link to="/dashboard" className="flex items-center gap-2" onClick={closeMobileMenu}>
                      <div className="bg-primary text-white h-8 w-8 rounded-md flex items-center justify-center">
                        <span className="font-bold">L</span>
                      </div>
                      <span className="font-semibold text-lg">LoopList</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-1 py-4">
                  {navigationItems.map((item) => (
                    <NavItem
                      key={item.to}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      isActive={isActive(item.to)}
                      onClick={closeMobileMenu}
                    />
                  ))}
                </div>
                <Separator />
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:flex md:w-64 lg:w-72 border-r flex-col p-4">
          <div className="space-y-1 py-2 flex-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.to)}
              />
            ))}
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
