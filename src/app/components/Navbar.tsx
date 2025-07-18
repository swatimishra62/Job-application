'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Briefcase, User, LogOut, Home } from 'lucide-react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchUser();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 ${
      pathname === path 
        ? 'bg-white/20 text-white font-semibold shadow-lg' 
        : 'text-white/90 hover:text-white'
    }`;

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white px-6 py-4 shadow-xl border-b border-blue-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold hover:scale-105 transition-transform duration-300">
          <Briefcase className="w-8 h-8 text-yellow-400" />
          <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
            JobTracker Pro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 items-center">
          {isLoggedIn && (
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          {isLoggedIn && (
            <Link href="/profile" className={linkClass('/profile')}>
              <User className="w-4 h-4" />
              Profile
            </Link>
          )}
          {!isLoggedIn && (
            <Link href="/login" className={linkClass('/login')}>
              Login
            </Link>
          )}
          {!isLoggedIn && (
            <Link href="/signup" className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-300 hover:scale-105 shadow-lg">
              Sign Up
            </Link>
          )}

          {isLoggedIn && user?.username && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black flex items-center justify-center font-bold shadow-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-red-200 hover:text-red-100 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-2 px-4 pb-4 border-t border-white/20">
          {isLoggedIn && (
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          {isLoggedIn && (
            <Link href="/profile" className={linkClass('/profile')}>
              <User className="w-4 h-4" />
              Profile
            </Link>
          )}
          {!isLoggedIn && (
            <Link href="/login" className={linkClass('/login')}>
              Login
            </Link>
          )}
          {!isLoggedIn && (
            <Link href="/signup" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-semibold block text-center">
              Sign Up
            </Link>
          )}
          {isLoggedIn && (
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-red-200 hover:text-red-100 w-full text-left px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
