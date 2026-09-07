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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 shadow-lg safe-area-pb">
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        
        {/* Explore */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center w-full min-h-[48px] py-1 text-[11px] font-medium transition-all ${
            currentView === 'home' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className={`flex flex-col items-center justify-center w-full min-h-[48px] py-1 text-[11px] font-medium transition-all ${
            currentView === 'search' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </button>

        {/* AI Counselor */}
        <button
          onClick={onOpenAdvisor}
          className="flex flex-col items-center justify-center w-full min-h-[48px] py-1 text-[11px] font-medium text-slate-800"
        >
          <div className="w-9 h-9 -mt-3 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 ring-2 ring-white">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="mt-0.5 text-blue-600 font-bold text-[10px]">AI Counselor</span>
        </button>

        {/* Compare */}
        <button
          onClick={() => onNavigate('compare')}
          className={`relative flex flex-col items-center justify-center w-full min-h-[48px] py-1 text-[11px] font-medium transition-all ${
            currentView === 'compare' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scale className="w-5 h-5 mb-0.5" />
          <span>Compare</span>
          {compareCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              {compareCount}
            </span>
          )}
        </button>

        {/* Saved */}
        <button
          onClick={() => onNavigate('saved')}
          className={`relative flex flex-col items-center justify-center w-full min-h-[48px] py-1 text-[11px] font-medium transition-all ${
            currentView === 'saved' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-5 h-5 mb-0.5" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              {savedCount}
            </span>
          )}
        </button>

      </div>
    </nav>
  );
};
