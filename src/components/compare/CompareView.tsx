import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  X, 
  Plus, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  Award, 
  ShieldCheck, 
  Building2, 
  HelpCircle 
} from 'lucide-react';
import { Institution } from '../../types';
import { dataService } from '../../services/dataService';
import { StarRating } from '../common/StarRating';
import { askScorevaultAdvisor } from '../../services/aiService';

interface CompareViewProps {
  onBack: () => void;
  onSelectInstitution: (inst: Institution) => void;
  onOpenSearch: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  onBack,
  onSelectInstitution,
  onOpenSearch
}) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [aiThinkingAnalysis, setAiThinkingAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = () => {
    const list = dataService.getComparisonInstitutions();
    setInstitutions(list);
    setAllInstitutions(dataService.getInstitutions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = (id: string) => {
    dataService.toggleComparison(id);
    loadData();
    setAiThinkingAnalysis(null);
  };

  const handleAddInstitution = (id: string) => {
    const res = dataService.toggleComparison(id);
    if (res.error) {
      alert(res.error);
    } else {
      loadData();
      setSelectorOpen(false);
      setAiThinkingAnalysis(null);
    }
  };

  const handleRunAiThinkingCompare = async () => {
    if (institutions.length < 2) return;
    setAiLoading(true);
    try {
      const names = institutions.map(i => `${i.name} (${i.city})`).join(' vs ');
      const res = await askScorevaultAdvisor({
        prompt: `Execute a rigorous, high-level comparative decision analysis between: ${names}.
Analyze:
1. Academic rigor, faculty quality, and curriculum updates.
2. Placement median statistics vs fee investments (ROI analysis).
3. Campus culture, hostel living realities, and peer competition.
4. Who should choose which institution (Persona matching for students/parents).
Give an objective, transparent verdict without diplomatic hedging.`,
        useThinking: true,
        institutionContext: institutions
      });
      setAiThinkingAnalysis(res.reply);
    } catch (e) {
      setAiThinkingAnalysis('Deep comparison intelligence service is taking longer than usual. Please review the empirical matrix below.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
              <Scale className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
              Side-by-Side Institution Comparison
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare metrics, fees, faculty ratios, and authentic feedback for up to 4 schools or colleges.
          </p>
        </div>

        {institutions.length >= 2 && (
          <button
            onClick={handleRunAiThinkingCompare}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-all self-start sm:self-auto shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Analyzing Tradeoffs (Deep Thinking)...' : 'AI Deep Decision Analysis'}</span>
          </button>
        )}
      </div>

      {/* AI Deep Thinking Comparative Analysis Box */}
      {aiThinkingAnalysis && (
        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 rounded-2xl border border-indigo-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <h3 className="text-sm font-bold text-indigo-950 font-display">
                Scorevault High-Reasoning Comparative Dossier
              </h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
              Gemini High Thinking Engine
            </span>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {aiThinkingAnalysis}
          </div>
        </div>
      )}

      {/* Empty State */}
      {institutions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 font-display">No institutions selected</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Add up to 4 schools or colleges from search or discovery to compare them side by side.
          </p>
          <button
            onClick={onOpenSearch}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-xs"
          >
            Browse Institutions to Compare
          </button>
        </div>
      ) : (
        /* Comparison Matrix Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  <th className="p-4 sm:p-5 w-48 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/80">
                    Feature / Metric
                  </th>
                  {institutions.map(inst => (
                    <th key={inst.id} className="p-4 sm:p-5 min-w-[220px] max-w-[260px] align-top">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                          {inst.type}
                        </span>
                        <button
                          onClick={() => handleRemove(inst.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div 
                        onClick={() => onSelectInstitution(inst)}
                        className="cursor-pointer group"
                      >
                        <h4 className="text-sm font-bold text-slate-950 group-hover:text-blue-600 line-clamp-2 font-display">
                          {inst.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {inst.locality}, {inst.city}
                        </p>
                      </div>
                    </th>
                  ))}

                  {/* Add Slot */}
                  {institutions.length < 4 && (
                    <th className="p-4 sm:p-5 min-w-[180px] align-middle text-center border-l border-dashed border-slate-200">
                      <button
                        onClick={() => setSelectorOpen(true)}
                        className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl hover:bg-blue-50/40 transition-colors group"
                      >
                        <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 mb-1" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">
                          Add Institution
                        </span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {/* Row: Scorevault Rating */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">Overall Rating</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-extrabold text-slate-950">{inst.rating}</span>
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-[11px] text-slate-400">({inst.reviewCount} reviews)</span>
                      </div>
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: NIRF / Ranking */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">National Rank</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5 font-semibold">
                      {inst.nirfRank ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                          <Award className="w-3 h-3 text-amber-600" />
                          NIRF #{inst.nirfRank}
                        </span>
                      ) : (
                        <span className="text-slate-400">State / Board Accredited</span>
                      )}
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Annual Fee Range */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">Estimated Tuition</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5 font-bold text-emerald-700">
                      {inst.feeRange.displayText}
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Placements / Faculty Ratio */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">
                    Placements / Ratio
                  </td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5 font-semibold text-slate-800">
                      {inst.type === 'School' 
                        ? `${inst.studentFacultyRatio} Student-Faculty Ratio` 
                        : (inst.averagePlacement || 'Placement cell data')}
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Board / University */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">Board / University</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5 font-medium">
                      {inst.boardOrUniversity}
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Ownership */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">Ownership Model</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5 font-medium">
                      {inst.ownership}
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Campus Size */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">Campus Acreage</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5">
                      {inst.campusSize}
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Hostel */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">Hostel Facility</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5 font-medium">
                      {inst.hostelAvailable ? '✓ On-campus Hostels' : '✕ Day Scholars'}
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Category Breakdown - Academics */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">Academics Score</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5 font-bold text-blue-600">
                      {(inst.categoryRatings?.academics || inst.rating).toFixed(1)} / 5.0
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Category Breakdown - Infrastructure */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/50">Infrastructure Score</td>
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5 font-bold text-blue-600">
                      {(inst.categoryRatings?.infrastructure || inst.rating).toFixed(1)} / 5.0
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>

                {/* Row: Action view profile */}
                <tr>
                  <td className="p-4 sm:p-5 bg-slate-50/50" />
                  {institutions.map(inst => (
                    <td key={inst.id} className="p-4 sm:p-5">
                      <button
                        onClick={() => onSelectInstitution(inst)}
                        className="w-full py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  ))}
                  {institutions.length < 4 && <td />}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selector Modal to add an institution */}
      {selectorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Select Institution to Compare
              </h3>
              <button onClick={() => setSelectorOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {allInstitutions
                .filter(inst => !institutions.some(i => i.id === inst.id))
                .map(inst => (
                  <div
                    key={inst.id}
                    onClick={() => handleAddInstitution(inst.id)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{inst.name}</h4>
                      <p className="text-[11px] text-slate-500">{inst.locality}, {inst.city} • {inst.type}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600">+ Add</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
