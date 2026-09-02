import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bookmark, 
  Scale, 
  Sparkles, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  LogOut, 
  Building2, 
  GraduationCap, 
  MapPin, 
  SlidersHorizontal 
} from 'lucide-react';
import { authService } from '../../services/authService';
import { dataService } from '../../services/dataService';
import { User } from '../../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenAdvisor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
  onOpenAdvisor
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(dataService.getComparisonIds().length);
  const [savedCount, setSavedCount] = useState(dataService.getSavedInstitutions().length);

  useEffect(() => {
    const unsub = authService.subscribe(user => {
      setCurrentUser(user);
    });

    const interval = setInterval(() => {
      setCompareCount(dataService.getComparisonIds().length);
      setSavedCount(dataService.getSavedInstitutions().length);
    }, 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { id: 'home', label: 'Explore' },
    { id: 'schools', label: 'Schools', param: 'Schools' },
    { id: 'colleges', label: 'Colleges', param: 'Colleges' },
    { id: 'cities', label: 'Cities' },
    { id: 'compare', label: 'Compare', badge: compareCount > 0 ? compareCount : undefined }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <button 
              id="header-logo-btn"
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800/60 group-hover:bg-blue-600 transition-colors">
                <ShieldCheck className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-950 font-display">
                    SCORE<span className="text-blue-600">VAULT</span>
                  </span>
                  <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                    IN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide -mt-0.5">
                  Know before you choose
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const isActive = currentView === link.id || (link.param && currentView === 'category' && link.param === 'Schools');
                return (
                  <button
                    key={link.id}
                    id={`nav-link-${link.id}`}
                    onClick={() => onNavigate(link.id, link.param)}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50/70 font-semibold' 
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
                    }`}
                  >
                    {link.label}
                    {link.badge !== undefined && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, AI Advisor, Saved & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Search trigger button */}
            <button
              id="header-quick-search-btn"
              onClick={onOpenSearch}
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 text-sm text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors w-64 shadow-xs"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-normal truncate">Search schools, cities, exams...</span>
              <kbd className="ml-auto text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Mobile search icon button */}
            <button
              id="header-mobile-search-btn"
              onClick={onOpenSearch}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Advisor Button */}
            <button
              id="header-ai-advisor-btn"
              onClick={onOpenAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 bg-gradient-to-r from-amber-50 via-blue-50 to-indigo-50 border border-blue-200/70 rounded-lg hover:border-blue-300 hover:shadow-xs transition-all"
              title="Scorevault AI Education Counselor"
            >
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="hidden sm:inline">AI Counselor</span>
            </button>

            {/* Saved Bookmarks Button */}
            <button
              id="header-saved-btn"
              onClick={() => onNavigate('saved')}
              className={`relative p-2 rounded-lg transition-colors ${
                currentView === 'saved' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
              title="Saved Institutions"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Compare Quick Icon for small screens */}
            <button
              id="header-compare-btn"
              onClick={() => onNavigate('compare')}
              className={`md:hidden relative p-2 rounded-lg transition-colors ${
                currentView === 'compare' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
              title="Compare"
            >
              <Scale className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            {/* User Profile / Authentication */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="header-user-profile-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100"
                  />
                  <span className="hidden sm:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-slate-700 animate-in fade-in-50 duration-100">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('saved');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      My Saved Institutions ({savedCount})
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('compare');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Scale className="w-4 h-4 text-slate-400" />
                      Comparison List ({compareCount})
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      Moderation & Admin Hub
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        authService.logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-sign-in-btn"
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              id="header-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.id, link.param);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-sm font-medium rounded-lg flex items-center justify-between ${
                  currentView === link.id
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin');
              }}
              className="w-full text-left px-3.5 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Moderation / Admin</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
