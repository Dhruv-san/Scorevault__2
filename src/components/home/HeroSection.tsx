import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ArrowRight, Building, GraduationCap, School, BookOpen, Stethoscope, Briefcase, Landmark, Sparkles } from 'lucide-react';
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
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 bg-white text-slate-900 overflow-hidden border-b border-slate-200/80">

      {/* Moving Animated Vector Graphics Elements (White Theme Canvas) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Animated Geometric Blobs */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-10 -left-10 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl opacity-70"
        />
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl opacity-60"
        />

        {/* Subtle SVG Grid Motion Graphic */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Neutrality Trust Tag */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-6 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span>India’s Authentic Education Intelligence Platform</span>
        </motion.div>

        {/* Hero Title & Subtitle with Enhanced Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 font-display max-w-4xl mx-auto leading-[1.1]"
        >
          Know <span className="text-blue-600 underline decoration-blue-200 decoration-wavy underline-offset-8">Before</span> You Choose.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 sm:mt-6 text-base sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed"
        >
          Verified Indian school & college reviews, government cutoff data, and real-time AI counseling.
        </motion.p>

        {/* Smart Search Bar on White Theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-10 max-w-3xl mx-auto"
        >
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white border-2 border-slate-200/90 focus-within:border-blue-600 rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl"
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
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none pr-3 font-medium"
            />

            <button
              type="submit"
              id="hero-search-submit-btn"
              className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shrink-0 shadow-md hover:shadow-blue-500/25 flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </form>

          {/* Search Examples */}
          <div className="mt-3.5 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Try searching:</span>
            {searchExamples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(ex)}
                className="text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/60 font-medium"
              >
                {ex}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Popular Categories */}
        <div className="mt-12 pt-8 border-t border-slate-200/70">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
              Popular Categories
            </h2>
            <button 
              onClick={() => onSelectCategory('Schools')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/50 text-xs sm:text-sm font-bold text-slate-800 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
              >
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
              Popular Educational Hubs
            </h2>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {CITIES_DATA.map(city => (
              <button
                key={city.id}
                id={`hero-city-${city.id}`}
                onClick={() => onSelectCity(city.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-all hover:scale-105"
              >
                <MapPin className="w-3 h-3 text-blue-600" />
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
