import React, { useState } from 'react';
import { motion } from 'motion/react';
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
    <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 bg-slate-950 text-white overflow-hidden border-b border-slate-800">

      {/* Ambient Looping Motion Graphics / Video Background Element */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-university-campus-building-and-fountain-42939-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Decorative Radial Color Theory Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Neutrality Trust Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-6 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>India’s Authentic Education Intelligence Platform</span>
        </motion.div>

        {/* Hero Title & Subtitle */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display max-w-4xl mx-auto leading-tight sm:leading-tight"
        >
          Know Before You Choose.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3.5 sm:mt-5 text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed"
        >
          Verified Indian school & college reviews, government cutoff data, and real-time AI counseling.
        </motion.p>

        {/* Large Glassmorphism Smart Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-10 max-w-3xl mx-auto"
        >
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 focus-within:border-blue-400 rounded-2xl p-2 sm:p-2.5 shadow-2xl transition-all"
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
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-400 focus:outline-none pr-3"
            />

            <button
              type="submit"
              id="hero-search-submit-btn"
              className="px-5 sm:px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shrink-0 shadow-lg hover:shadow-blue-500/25 flex items-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </form>

          {/* Prompt Examples */}
          <div className="mt-3.5 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Try searching:</span>
            {searchExamples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(ex)}
                className="text-slate-300 hover:text-blue-300 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition-colors border border-white/10"
              >
                {ex}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Popular Categories */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Popular Categories
            </h2>
            <button 
              onClick={() => onSelectCategory('Schools')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
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
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-white/10 text-xs sm:text-sm font-semibold text-slate-200 transition-all shadow-sm hover:scale-105 group"
              >
                <span className="text-slate-400 group-hover:text-blue-400 transition-colors">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Popular Educational Hubs
            </h2>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {CITIES_DATA.map(city => (
              <button
                key={city.id}
                id={`hero-city-${city.id}`}
                onClick={() => onSelectCity(city.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all hover:scale-105"
              >
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>{city.name}</span>
                <span className="text-[10px] text-slate-500">({city.institutionCount})</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
