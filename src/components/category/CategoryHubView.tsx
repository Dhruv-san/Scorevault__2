import React, { useState } from 'react';
import { ArrowLeft, School, GraduationCap, Building, Briefcase, Stethoscope, Landmark, BookOpen } from 'lucide-react';
import { Institution } from '../../types';
import { dataService } from '../../services/dataService';
import { InstitutionCard } from '../common/InstitutionCard';

interface CategoryHubViewProps {
  initialCategory?: string;
  onBack: () => void;
  onSelectInstitution: (inst: Institution) => void;
}

export const CategoryHubView: React.FC<CategoryHubViewProps> = ({
  initialCategory = 'Schools',
  onBack,
  onSelectInstitution
}) => {
  const [category, setCategory] = useState(initialCategory);

  const categoryMeta: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
    Schools: {
      title: 'Top K-12 Schools in India',
      desc: 'Discover premier CBSE, CISCE (ICSE/ISC), and International Baccalaureate (IB) institutions rated by authentic parents and alumni.',
      icon: <School className="w-5 h-5 text-blue-600" />
    },
    Colleges: {
      title: 'Undergraduate & Graduate Colleges',
      desc: 'Explore India’s leading colleges across engineering, commerce, arts, sciences, and professional vocations.',
      icon: <GraduationCap className="w-5 h-5 text-blue-600" />
    },
    Engineering: {
      title: 'Top Engineering Colleges (B.Tech / M.Tech)',
      desc: 'Compare IITs, NITs, BITS, and autonomous technological institutes for JEE cutoffs, median placements, and laboratory infrastructure.',
      icon: <Building className="w-5 h-5 text-blue-600" />
    },
    Management: {
      title: 'Top Business Schools & MBA Programs',
      desc: 'Authentic reviews on CAT percentiles, consulting and BFSI recruitment, summer stipends, and executive peer networks.',
      icon: <Briefcase className="w-5 h-5 text-blue-600" />
    },
    Medical: {
      title: 'Premier Medical Colleges & Hospitals',
      desc: 'NEET counseling benchmarks, patient bed-to-student clinical exposure, and postgraduate residency insights.',
      icon: <Stethoscope className="w-5 h-5 text-blue-600" />
    },
    Law: {
      title: 'National Law Universities & Law Schools',
      desc: 'CLAT cutoffs, moot court records, judicial clerkships, and corporate tier-1 law firm placements.',
      icon: <Landmark className="w-5 h-5 text-blue-600" />
    },
    Universities: {
      title: 'Central, State & Deemed Universities',
      desc: 'NAAC A++ and UGC-recognized multidisciplinary research universities across Indian states.',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />
    }
  };

  const currentMeta = categoryMeta[category] || categoryMeta['Schools'];
  const institutions = dataService.getInstitutionsByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {Object.keys(categoryMeta).map(catKey => (
          <button
            key={catKey}
            onClick={() => setCategory(catKey)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              category === catKey
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {catKey}
          </button>
        ))}
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            {currentMeta.icon}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
            {currentMeta.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          {currentMeta.desc}
        </p>
      </div>

      {/* Grid of Institutions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map(inst => (
          <InstitutionCard
            key={inst.id}
            institution={inst}
            onSelect={onSelectInstitution}
          />
        ))}
      </div>

    </div>
  );
};
