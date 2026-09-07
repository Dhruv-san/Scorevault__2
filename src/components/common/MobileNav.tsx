import React from 'react';
import { motion } from 'motion/react';
import { Compass, Search, Scale, Bookmark, Sparkles } from 'lucide-react';
import { dataService } from '../../services/dataService';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenAdvisor: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAdvisor
}) => {
  const compareCount = dataService.getComparisonIds().length;
  const savedCount = dataService.getSavedInstitutions().length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-2 py-2 pb-safe shadow-2xl">
      <div className="grid grid-cols-5 items-center justify-items-center">
        
        {/* Explore */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 text-[11px] font-bold transition-colors ${
            currentView === 'home' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
          {currentView === 'home' && (
            <motion.div layoutId="mobile-nav-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5" />
          )}
        </motion.button>

        {/* Search */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onOpenSearch}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 text-[11px] font-bold transition-colors ${
            currentView === 'search' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
          {currentView === 'search' && (
            <motion.div layoutId="mobile-nav-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5" />
          )}
        </motion.button>

        {/* AI Counselor Center Floating Trigger */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onOpenAdvisor}
          className="flex flex-col items-center justify-center w-full min-h-[44px] py-1 text-[11px] font-bold text-slate-900"
        >
          <div className="w-9 h-9 -mt-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-white">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="mt-0.5 text-blue-600 font-black">Advisor</span>
        </motion.button>

        {/* Compare */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onNavigate('compare')}
          className={`relative flex flex-col items-center justify-center w-full min-h-[44px] py-1 text-[11px] font-bold transition-colors ${
            currentView === 'compare' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scale className="w-5 h-5 mb-0.5" />
          <span>Compare</span>
          {compareCount > 0 && (
            <span className="absolute top-0 right-3.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
              {compareCount}
            </span>
          )}
          {currentView === 'compare' && (
            <motion.div layoutId="mobile-nav-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5" />
          )}
        </motion.button>

        {/* Saved */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onNavigate('saved')}
          className={`relative flex flex-col items-center justify-center w-full min-h-[44px] py-1 text-[11px] font-bold transition-colors ${
            currentView === 'saved' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-5 h-5 mb-0.5" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-0 right-3.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
              {savedCount}
            </span>
          )}
          {currentView === 'saved' && (
            <motion.div layoutId="mobile-nav-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5" />
          )}
        </motion.button>

      </div>
    </nav>
  );
};
