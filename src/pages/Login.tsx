import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { KeyRound, User } from 'lucide-react';
import { authenticateUser } from '../lib/supabase';
import { useUserStore } from '../store';
import Navbar from '../components/Navbar';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser, setIsAdmin } = useUserStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !surname.trim()) {
      toast.error('Please enter both name and surname');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await authenticateUser(name, surname);
      
      if (user) {
        // Check if user is admin (for demo purposes, use a simple check)
        // In production, you would have an admin flag in the database
        const isAdmin = name.toLowerCase() === 'admin' && surname.toLowerCase() === 'admin';
        
        setCurrentUser(user);
        setIsAdmin(isAdmin);
        
        toast.success('Login successful!');
        navigate(isAdmin ? '/admin' : '/directory');
      } else {
        toast.error('Invalid credentials. Please check your name and surname.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 card">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Log in to NetEvent
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your name and surname to access the directory
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="input-label">
                  Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="input-field pl-10"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="surname" className="input-label">
                  Surname
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    required
                    className="input-field pl-10"
                    placeholder="Enter your surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
            
            <div className="text-center text-sm">
              <p>
                Don't have an account?{' '}
                <a href="/" className="font-medium text-yellow-500 hover:text-yellow-600">
                  Register for the event
                </a>
              </p>
            </div>
          </form>
        </div>
      </main>
      
      <footer className="bg-black text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 NetEvent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;