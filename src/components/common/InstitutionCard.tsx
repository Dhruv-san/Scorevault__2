import React, { useState } from 'react';
import { 
  MapPin, 
  Bookmark, 
  Scale, 
  Check, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Award, 
  IndianRupee 
} from 'lucide-react';
import { Institution } from '../../types';
import { dataService } from '../../services/dataService';
import { StarRating } from './StarRating';
import { Badge } from './Badge';

interface InstitutionCardProps {
  institution: Institution;
  onSelect: (institution: Institution) => void;
  onToggleCompare?: () => void;
  onToggleSave?: () => void;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  institution,
  onSelect,
  onToggleCompare,
  onToggleSave
}) => {
  const [isSaved, setIsSaved] = useState(dataService.isSaved(institution.id));
  const [inCompare, setInCompare] = useState(dataService.isInComparison(institution.id));

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = dataService.toggleSave(institution.id);
    setIsSaved(nextSaved);
    if (onToggleSave) onToggleSave();
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = dataService.toggleComparison(institution.id);
    if (res.error) {
      alert(res.error);
    } else {
      setInCompare(res.active);
      if (onToggleCompare) onToggleCompare();
    }
  };

  return (
    <div
      id={`institution-card-${institution.slug}`}
      onClick={() => onSelect(institution)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail and Tags */}
        <div className="relative aspect-16/9 w-full bg-slate-100 overflow-hidden">
          <img
            src={institution.heroImage}
            alt={institution.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-900/80 text-white backdrop-blur-xs border border-white/10">
                {institution.type}
              </span>
              {institution.nirfRank && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-2xs">
                  <Award className="w-3 h-3" />
                  NIRF #{institution.nirfRank}
                </span>
              )}
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleSaveClick}
              className={`p-2 rounded-full backdrop-blur-md pointer-events-auto transition-all ${
                isSaved 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-blue-600'
              }`}
              title={isSaved ? 'Saved to your list' : 'Save institution'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Bottom Photo Overlay Info */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="font-medium truncate text-white/90">
              {institution.ownership} • {institution.boardOrUniversity}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Header row: Title & Verified */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 font-display">
              {institution.name}
            </h3>
            {institution.verifiedInstitution && (
              <span className="shrink-0 text-blue-600" title="Scorevault Verified Profile">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{institution.locality}, {institution.city}</span>
          </div>

          {/* Ratings Row */}
          <div className="flex items-center gap-2 mb-3.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/80">
              <span className="text-xs font-bold text-amber-900">{institution.rating}</span>
              <span className="text-amber-500 text-xs">★</span>
            </div>
            <span className="text-xs text-slate-500">
              ({institution.reviewCount} authentic reviews)
            </span>
          </div>

          {/* Metric Highlights Pill Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3.5">
            <div>
              <span className="text-slate-400 block font-medium">Estimated Fees</span>
              <span className="font-semibold text-slate-800 truncate block">
                {institution.feeRange.displayText.split('/')[0]}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">
                {institution.type === 'School' ? 'Faculty Ratio' : 'Avg. Package'}
              </span>
              <span className="font-semibold text-slate-800 truncate block">
                {institution.type === 'School' 
                  ? `${institution.studentFacultyRatio} Students` 
                  : (institution.averagePlacement || 'Top Recruiter Base')}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-1">
            {institution.description}
          </p>
        </div>
      </div>

      {/* Footer Action Strip */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <button
          onClick={handleCompareClick}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
            inCompare
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{inCompare ? 'Comparing' : 'Compare'}</span>
        </button>

        <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          View Profile →
        </span>
      </div>
    </div>
  );
};
