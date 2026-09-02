import React, { useState } from 'react';
import { Search, MapPin, Sparkles, ArrowRight, Building, GraduationCap, School, BookOpen, Stethoscope, Briefcase, Landmark } from 'lucide-react';
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
    if (query.trim()) {
      onSearchSubmit(query.trim());
    } else {
      onSearchSubmit('');
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearchSubmit(example);
  };

  return (
    <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-20 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 border-b border-slate-200/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Neutrality Trust Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>India’s Authentic Education Intelligence Platform</span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 font-display max-w-4xl mx-auto leading-tight sm:leading-tight">
          Find the right school or college.
        </h1>
        <p className="mt-3.5 sm:mt-5 text-base sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
          Real reviews. Detailed information. Better decisions.
        </p>

        {/* Large Smart Search Bar */}
        <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white border-2 border-slate-200 focus-within:border-blue-600 rounded-2xl p-2 sm:p-2.5 shadow-lg shadow-slate-200/50 transition-all"
          >
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            </div>
            
            <input
              type="text"
              id="hero-search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search schools, colleges, courses or locations..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none pr-3"
            />

            <button
              type="submit"
              id="hero-search-submit-btn"
              className="px-5 sm:px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </form>

          {/* Prompt Examples */}
          <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Try searching:</span>
            {searchExamples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(ex)}
                className="text-slate-600 hover:text-blue-600 hover:underline bg-slate-100/80 hover:bg-blue-50 px-2 py-0.5 rounded-md transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mt-12 pt-8 border-t border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Popular Categories
            </h2>
            <button 
              onClick={() => onSelectCategory('Schools')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View All Categories →
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.value}
                id={`hero-category-${cat.value.toLowerCase()}`}
                onClick={() => onSelectCategory(cat.value)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs sm:text-sm font-semibold text-slate-800 transition-all shadow-2xs hover:shadow-xs group"
              >
                <span className="text-slate-500 group-hover:text-blue-600 transition-colors">
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Cities */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Popular Educational Hubs
            </h2>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {CITIES_DATA.map(city => (
              <button
                key={city.id}
                id={`hero-city-${city.id}`}
                onClick={() => onSelectCity(city.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 hover:text-slate-950 transition-colors"
              >
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{city.name}</span>
                <span className="text-[10px] text-slate-400">({city.institutionCount})</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
