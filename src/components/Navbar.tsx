import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, UserPlus, LogOut, Menu, X } from 'lucide-react';
import { useUserStore, useFormStore } from '../store';

const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useUserStore();
  const { openForm } = useFormStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-black flex items-center">
          <Users className="mr-2" size={24} />
          <span>Seminario de transformación digital</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden focus:outline-none" 
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {!isAuthenticated && (
            <Link to="/admin" className="btn btn-outline flex items-center h-10 px-5 leading-none items-center justify-center" style={{ minWidth: '110px', display: 'flex', alignItems: 'center' }}>
              Admin
            </Link>
          )}
          
          {isAuthenticated && (
            <>
              <Link to="/directory" className="text-black hover:text-gray-700">
                Directory
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="text-black hover:text-gray-700">
                  Admin Panel
                </Link>
              )}
              
              <button 
                className="btn btn-outline flex items-center" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2" size={18} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md z-50 p-4 flex flex-col space-y-4">
            {!isAuthenticated && (
              <>
                <Link 
                  to="/admin" 
                  className="btn btn-outline flex items-center justify-center w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              </>
            )}
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/directory" 
                  className="text-black hover:text-gray-700 py-2 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Directory
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-black hover:text-gray-700 py-2 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                
                <button 
                  className="btn btn-outline flex items-center justify-center w-full" 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2" size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;