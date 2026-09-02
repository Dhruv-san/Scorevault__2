import React from 'react';
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="grid grid-cols-5 items-center justify-items-center">
        
        {/* Explore */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-medium transition-colors ${
            currentView === 'home' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-medium transition-colors ${
            currentView === 'search' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </button>

        {/* AI Counselor in center with subtle highlight */}
        <button
          onClick={onOpenAdvisor}
          className="flex flex-col items-center justify-center w-full py-1 text-[10px] font-medium text-slate-800"
        >
          <div className="w-8 h-8 -mt-3 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="mt-0.5 text-blue-600 font-bold">Advisor</span>
        </button>

        {/* Compare */}
        <button
          onClick={() => onNavigate('compare')}
          className={`relative flex flex-col items-center justify-center w-full py-1 text-[10px] font-medium transition-colors ${
            currentView === 'compare' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scale className="w-5 h-5 mb-0.5" />
          <span>Compare</span>
          {compareCount > 0 && (
            <span className="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {compareCount}
            </span>
          )}
        </button>

        {/* Saved */}
        <button
          onClick={() => onNavigate('saved')}
          className={`relative flex flex-col items-center justify-center w-full py-1 text-[10px] font-medium transition-colors ${
            currentView === 'saved' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-5 h-5 mb-0.5" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>

      </div>
    </nav>
  );
};
