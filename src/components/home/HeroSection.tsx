import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, Building, GraduationCap, School, BookOpen, Stethoscope, Briefcase, Landmark } from 'lucide-react';
import { CITIES_DATA } from '../../data/seedData';

interface HeroSectionProps {
  onSearchSubmit: (query: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectCity: (cityName: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchSubmit,
  onSelectCategory,
  onSelectCity
}) => {
  const [query, setQuery] = useState('');

  const searchExamples = [
    'Schools in Lucknow',
    'Best colleges in Delhi',
    'Engineering colleges in Bangalore',
    'CBSE schools near me',
    'MBA colleges in Mumbai'
  ];

  const categories = [
    { label: 'Schools', icon: <School className="w-4 h-4" />, value: 'Schools' },
    { label: 'Colleges', icon: <GraduationCap className="w-4 h-4" />, value: 'Colleges' },
    { label: 'Engineering', icon: <Building className="w-4 h-4" />, value: 'Engineering' },
    { label: 'Management', icon: <Briefcase className="w-4 h-4" />, value: 'Management' },
    { label: 'Medical', icon: <Stethoscope className="w-4 h-4" />, value: 'Medical' },
    { label: 'Law', icon: <Landmark className="w-4 h-4" />, value: 'Law' },
    { label: 'Universities', icon: <BookOpen className="w-4 h-4" />, value: 'Universities' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(query.trim());
  };

  return (
    <section className="bg-white text-slate-900 border-b border-slate-200/80 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Simple Trust Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>India’s Education Intelligence Directory</span>
        </div>

        {/* Clean Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 font-display tracking-tight leading-tight">
          Find the Right School or College in India
        </h1>
        <p className="mt-3 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Authentic student reviews, verified fee structures, government cutoffs, and side-by-side comparisons.
        </p>

        {/* Product-Focused Search Bar */}
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch bg-white border border-slate-300 focus-within:border-blue-600 rounded-2xl p-1.5 shadow-sm transition-all gap-2"
          >
            <div className="flex items-center flex-1 px-3 py-2 sm:py-0">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by school, college, course, city, or pincode..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium min-h-[38px]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Search Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Popular:</span>
            {searchExamples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setQuery(ex); onSearchSubmit(ex); }}
                className="text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors border border-slate-200/60 font-medium text-[11px] min-h-[32px]"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-10 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
              Browse Categories
            </h2>
            <button 
              onClick={() => onSelectCategory('Schools')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              All Categories →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 text-xs font-bold text-slate-800 transition-colors text-left min-h-[44px]"
              >
                <span className="text-slate-500 shrink-0">{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
              Major Educational Hubs
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {CITIES_DATA.map(city => (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.name)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors min-h-[36px]"
              >
                <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                <span>{city.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({city.institutionCount})</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
