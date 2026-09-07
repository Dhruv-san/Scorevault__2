import React, { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, School, GraduationCap } from 'lucide-react';
import { CITIES_DATA } from '../../data/seedData';
import { Institution } from '../../types';
import { dataService } from '../../services/dataService';
import { InstitutionCard } from '../common/InstitutionCard';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { updatePageSeo } from '../../utils/seo';

interface CityHubViewProps {
  initialCityName?: string;
  onBack: () => void;
  onSelectInstitution: (inst: Institution) => void;
}

export const CityHubView: React.FC<CityHubViewProps> = ({
  initialCityName = 'Lucknow',
  onBack,
  onSelectInstitution
}) => {
  const [currentCityName, setCurrentCityName] = useState(initialCityName);
  const cityInfo = CITIES_DATA.find(c => c.name.toLowerCase() === currentCityName.toLowerCase()) || CITIES_DATA[0];

  useEffect(() => {
    updatePageSeo({
      title: `Best Schools & Colleges in ${cityInfo.name}, ${cityInfo.state}`,
      description: `Discover top accredited CBSE/ICSE schools, engineering colleges, and universities in ${cityInfo.name}, ${cityInfo.state}. Read student reviews and compare fees.`,
      canonicalUrl: `https://scorevault.in/schools/${encodeURIComponent(cityInfo.name.toLowerCase())}`
    });
  }, [cityInfo]);

  const cityInstitutions = dataService.getInstitutionsByCity(cityInfo.name);
  const citySchools = cityInstitutions.filter(i => i.type === 'School');
  const cityColleges = cityInstitutions.filter(i => i.type === 'College' || i.type === 'University');

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs
          onHomeClick={onBack}
          items={[
            { label: 'Cities', onClick: onBack },
            { label: cityInfo.name }
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{cityInfo.state}, India</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 font-display">
              Education in {cityInfo.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {cityInfo.description}
            </p>
          </div>

          {/* City Quick Switcher */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Change Hub
            </label>
            <select
              value={currentCityName}
              onChange={e => setCurrentCityName(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-4"
            >
              {CITIES_DATA.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.institutionCount})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Local Highlights Pills */}
        {cityInfo.popularLocalities && cityInfo.popularLocalities.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-slate-500">Popular localities:</span>
            {cityInfo.popularLocalities.map((loc, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                {loc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Top Schools in City */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-950 font-display">
              Top Schools in {cityInfo.name}
            </h2>
          </div>
          <span className="text-xs text-slate-500">{citySchools.length} listed</span>
        </div>

        {citySchools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {citySchools.map(inst => (
              <InstitutionCard
                key={inst.id}
                institution={inst}
                onSelect={onSelectInstitution}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            More verified schools in {cityInfo.name} are currently being audited by Scorevault researchers.
          </div>
        )}
      </section>

      {/* Top Colleges in City */}
      <section className="mt-14">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-950 font-display">
              Premier Colleges & Universities in {cityInfo.name}
            </h2>
          </div>
          <span className="text-xs text-slate-500">{cityColleges.length} listed</span>
        </div>

        {cityColleges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityColleges.map(inst => (
              <InstitutionCard
                key={inst.id}
                institution={inst}
                onSelect={onSelectInstitution}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            More verified colleges in {cityInfo.name} are currently being audited by Scorevault researchers.
          </div>
        )}
      </section>

    </article>
  );
};
