

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  return (
    <header className="sticky top-0 z-10 flex w-full bg-surface border-b border-border-color">
      <div className="flex flex-grow items-center justify-between py-3 px-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="p-1.5 lg:hidden text-text-secondary"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div className="hidden sm:block">
             <p className="font-medium text-text-secondary text-sm">{currentTime}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {user && (
              <>
                 <div className="relative">
                    <button className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)'}}>
                        <span className="font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden sm:block font-medium text-text-primary text-sm">Hola, {user.username}</span>
                    <button onClick={logout} className="text-sm text-text-secondary hover:text-danger">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
              </>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;