
import { User } from '../types';
import { toast } from '@/components/ui/sonner';

// For demo purposes, we'll use these mock users
const mockUsers = [
  {
    id: 'user1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco'
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
  }
];

// Session storage keys
const USER_KEY = 'looplist_user';
const TOKEN_KEY = 'looplist_token';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Login a user
  login: async (email: string, password: string): Promise<User> => {
    await delay(800); // Simulate API request
    
    const user = mockUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Create a user object without the password
    const { password: _, ...userWithoutPassword } = user;
    const authUser = userWithoutPassword as User;
    
    // Store in session storage
    sessionStorage.setItem(USER_KEY, JSON.stringify(authUser));
    sessionStorage.setItem(TOKEN_KEY, `mock-jwt-token-${user.id}`);
    
    return authUser;
  },
  
  // Register a new user
  register: async (name: string, email: string, password: string): Promise<User> => {
    await delay(800); // Simulate API request
    
    // Check if user already exists
    if (mockUsers.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }
    
    // Create a new user
    const newUser = {
      id: `user${mockUsers.length + 1}`,
      name,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    
    // Add to mock users (in a real app, this would be a database call)
    mockUsers.push(newUser);
    
    // Create a user object without the password
    const { password: _, ...userWithoutPassword } = newUser;
    const authUser = userWithoutPassword as User;
    
    // Store in session storage
    sessionStorage.setItem(USER_KEY, JSON.stringify(authUser));
    sessionStorage.setItem(TOKEN_KEY, `mock-jwt-token-${newUser.id}`);
    
    return authUser;
  },
  
  // Logout the current user
  logout: () => {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
  
  // Get the current authenticated user
  getCurrentUser: (): User | null => {
    const userJson = sessionStorage.getItem(USER_KEY);
    if (!userJson) {
      return null;
    }
    
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error parsing user from session storage', error);
      return null;
    }
  },
  
  // Check if a user is authenticated
  isAuthenticated: (): boolean => {
    return !!sessionStorage.getItem(TOKEN_KEY);
  },

  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    await delay(500);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    const updatedUser = { ...currentUser, ...updates };
    sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    
    toast('Profile updated successfully');
    return updatedUser;
  }
};

export default authService;
