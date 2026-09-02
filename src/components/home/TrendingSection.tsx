import React, { useState } from 'react';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
import { Institution } from '../../types';
import { InstitutionCard } from '../common/InstitutionCard';

interface TrendingSectionProps {
  institutions: Institution[];
  onSelectInstitution: (institution: Institution) => void;
  onExploreMore: () => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  institutions,
  onSelectInstitution,
  onExploreMore
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'schools' | 'colleges' | 'engineering'>('all');

  const filteredInstitutions = institutions.filter(inst => {
    if (activeTab === 'schools') return inst.type === 'School';
    if (activeTab === 'colleges') return inst.type === 'College';
    if (activeTab === 'engineering') return inst.category === 'Engineering';
    return true;
  });

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>High Interest Institutions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
            Trending Across India
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Top rated by verified students, alumni, and parents over the last 30 days.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All' },
            { id: 'schools', label: 'Top Schools' },
            { id: 'colleges', label: 'Colleges' },
            { id: 'engineering', label: 'Engineering' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Institution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstitutions.slice(0, 6).map(institution => (
          <InstitutionCard
            key={institution.id}
            institution={institution}
            onSelect={onSelectInstitution}
          />
        ))}
      </div>

      {/* View All button */}
      <div className="mt-10 text-center">
        <button
          onClick={onExploreMore}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 shadow-2xs transition-all"
        >
          <span>Browse All 4,000+ Indian Institutions</span>
          <ArrowRight className="w-4 h-4 text-blue-600" />
        </button>
      </div>
    </section>
  );
};
