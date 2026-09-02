import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowLeft, Trash2, Scale, ArrowRight, Building2 } from 'lucide-react';
import { Institution } from '../../types';
import { dataService } from '../../services/dataService';
import { InstitutionCard } from '../common/InstitutionCard';

interface SavedInstitutionsViewProps {
  onBack: () => void;
  onSelectInstitution: (inst: Institution) => void;
  onExploreMore: () => void;
  onCompareNavigate: () => void;
}

export const SavedInstitutionsView: React.FC<SavedInstitutionsViewProps> = ({
  onBack,
  onSelectInstitution,
  onExploreMore,
  onCompareNavigate
}) => {
  const [savedList, setSavedList] = useState<Institution[]>([]);

  const loadSaved = () => {
    setSavedList(dataService.getSavedInstitutions());
  };

  useEffect(() => {
    loadSaved();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
              My Saved Institutions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            You have shortlisted <span className="font-bold text-slate-900">{savedList.length}</span> schools and colleges for evaluation.
          </p>
        </div>

        {savedList.length > 1 && (
          <button
            onClick={onCompareNavigate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Scale className="w-4 h-4" />
            <span>Open in Comparison Matrix</span>
          </button>
        )}
      </div>

      {savedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 font-display">No saved institutions</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Click the bookmark icon on any school or college card to add it to your shortlist.
          </p>
          <button
            onClick={onExploreMore}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-xs"
          >
            Discover Top Institutions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map(inst => (
            <InstitutionCard
              key={inst.id}
              institution={inst}
              onSelect={onSelectInstitution}
              onToggleSave={loadSaved}
            />
          ))}
        </div>
      )}

    </div>
  );
};
