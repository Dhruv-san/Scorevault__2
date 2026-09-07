import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Building2, 
  RotateCcw, 
  Map as MapIcon, 
  Grid,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Institution, SearchFilterParams } from '../../types';
import { dataService } from '../../services/dataService';
import { InstitutionCard } from '../common/InstitutionCard';
import { CITIES_DATA } from '../../data/seedData';

interface SearchAndFilterViewProps {
  initialParams?: SearchFilterParams;
  onSelectInstitution: (inst: Institution) => void;
  onBackToHome: () => void;
}

export const SearchAndFilterView: React.FC<SearchAndFilterViewProps> = ({
  initialParams,
  onSelectInstitution,
  onBackToHome
}) => {
  const [query, setQuery] = useState(initialParams?.query || '');
  const [selectedCity, setSelectedCity] = useState(initialParams?.city || 'All');
  const [selectedType, setSelectedType] = useState<string>(initialParams?.type || 'All');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams?.category || 'All');
  const [selectedBoard, setSelectedBoard] = useState<string>(initialParams?.board || 'All');
  const [selectedOwnership, setSelectedOwnership] = useState<string>(initialParams?.ownership || 'All');
  const [minRating, setMinRating] = useState<number>(initialParams?.minRating || 0);
  const [hostelOnly, setHostelOnly] = useState<boolean>(initialParams?.hostel || false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(initialParams?.verifiedOnly || false);
  const [maxFee, setMaxFee] = useState<number>(initialParams?.maxFee || 0);
  const [sortBy, setSortBy] = useState<SearchFilterParams['sortBy']>(initialParams?.sortBy || 'recommended');
  
  const [suggestions, setSuggestions] = useState<{ institutions: any[]; cities: any[]; courses: string[] }>({
    institutions: [],
    cities: [],
    courses: []
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedMapInstitution, setSelectedMapInstitution] = useState<Institution | null>(null);

  // Sync state to URL parameters for shareable, indexable URLs
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCity !== 'All') params.set('city', selectedCity);
    if (selectedType !== 'All') params.set('type', selectedType);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedBoard !== 'All') params.set('board', selectedBoard);
    if (selectedOwnership !== 'All') params.set('ownership', selectedOwnership);
    if (minRating > 0) params.set('minRating', minRating.toString());
    if (hostelOnly) params.set('hostel', 'true');
    if (verifiedOnly) params.set('verified', 'true');
    if (sortBy !== 'recommended') params.set('sortBy', sortBy);

    const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState(null, '', newRelativePathQuery);
  }, [query, selectedCity, selectedType, selectedCategory, selectedBoard, selectedOwnership, minRating, hostelOnly, verifiedOnly, sortBy]);

  // Live autocomplete fetch
  useEffect(() => {
    if (query.trim().length >= 2) {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setSuggestions(json.data);
            setShowSuggestions(true);
          }
        })
        .catch(() => {});
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  // Compute filtered institutions
  const filteredResults = useMemo(() => {
    return dataService.getInstitutions({
      query,
      city: selectedCity,
      type: selectedType as any,
      category: selectedCategory,
      board: selectedBoard,
      ownership: selectedOwnership as any,
      minRating,
      hostel: hostelOnly,
      verifiedOnly,
      maxFee: maxFee > 0 ? maxFee : undefined,
      sortBy
    });
  }, [
    query,
    selectedCity,
    selectedType,
    selectedCategory,
    selectedBoard,
    selectedOwnership,
    minRating,
    hostelOnly,
    verifiedOnly,
    maxFee,
    sortBy
  ]);

  const resetFilters = () => {
    setQuery('');
    setSelectedCity('All');
    setSelectedType('All');
    setSelectedCategory('All');
    setSelectedBoard('All');
    setSelectedOwnership('All');
    setMinRating(0);
    setHostelOnly(false);
    setVerifiedOnly(false);
    setMaxFee(0);
    setSortBy('recommended');
  };

  const activeFilterCount = [
    selectedCity !== 'All',
    selectedType !== 'All',
    selectedCategory !== 'All',
    selectedBoard !== 'All',
    selectedOwnership !== 'All',
    minRating > 0,
    hostelOnly,
    verifiedOnly,
    maxFee > 0
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Header Banner */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
              Browse Educational Institutions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing <span className="font-bold text-slate-900">{filteredResults.length}</span> accredited schools, colleges, and universities across India
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
            >
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Autocomplete Input Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 relative">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              id="search-input-field"
              placeholder="Search by institution name, city, course, board, or pincode (e.g. IIT Bombay, CBSE, B.Tech, 226001)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 shadow-2xs"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setShowSuggestions(false); }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Live Autocomplete Suggestions Box */}
            {showSuggestions && (suggestions.institutions.length > 0 || suggestions.cities.length > 0 || suggestions.courses.length > 0) && (
              <div className="absolute top-12 left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 text-xs animate-in fade-in duration-100">
                {suggestions.institutions.length > 0 && (
                  <div className="mb-2">
                    <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Institutions</span>
                    {suggestions.institutions.map(i => (
                      <div
                        key={i.id}
                        onClick={() => {
                          setQuery(i.name);
                          setShowSuggestions(false);
                          const matched = dataService.getInstitutionById(i.id);
                          if (matched) onSelectInstitution(matched);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between font-semibold text-slate-800"
                      >
                        <span className="truncate">{i.name}</span>
                        <span className="text-[10px] text-slate-400">{i.city} • {i.type}</span>
                      </div>
                    ))}
                  </div>
                )}

                {suggestions.cities.length > 0 && (
                  <div className="mb-2 pt-2 border-t border-slate-100">
                    <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Cities</span>
                    {suggestions.cities.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCity(c.name);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-1.5 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-slate-700"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{c.name}, {c.state}</span>
                      </div>
                    ))}
                  </div>
                )}

                {suggestions.courses.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Popular Courses</span>
                    {suggestions.courses.map((course, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setQuery(course);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-1.5 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-slate-700"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>{course}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Sort by:</label>
            <div className="relative">
              <select
                id="search-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800 shadow-2xs pr-8 cursor-pointer"
              >
                <option value="recommended">Scorevault Recommendation Index</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="most_reviewed">Most Reviewed</option>
                <option value="lowest_fees">Lowest Fees</option>
                <option value="established">Oldest Established</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Pills Summary */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-slate-500">Active filters:</span>
            {selectedCity !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                City: {selectedCity}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCity('All')} />
              </span>
            )}
            {selectedType !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                Type: {selectedType}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('All')} />
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium">
                Rating: {minRating}+ ★
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} />
              </span>
            )}
            {hostelOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                Hostel Available
                <X className="w-3 h-3 cursor-pointer" onClick={() => setHostelOnly(false)} />
              </span>
            )}
            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                Verified Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium ml-1"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout with Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Filter Options
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              City / Location
            </label>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="All">All Cities across India</option>
              {CITIES_DATA.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.institutionCount})</option>
              ))}
            </select>
          </div>

          {/* Institution Type */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Institution Type
            </label>
            <div className="space-y-1.5">
              {['All', 'School', 'College', 'University'].map(type => (
                <label key={type} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-950">
                  <input
                    type="radio"
                    name="instType"
                    checked={selectedType === type}
                    onChange={() => setSelectedType(type)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{type === 'All' ? 'All Types' : type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Board / Affiliation */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Board / Affiliation
            </label>
            <select
              value={selectedBoard}
              onChange={e => setSelectedBoard(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="All">All Boards / Affiliations</option>
              <option value="CBSE">CBSE Board</option>
              <option value="ICSE">CISCE / ICSE / ISC</option>
              <option value="Autonomous">Autonomous / National Importance</option>
              <option value="VTU">VTU (Karnataka)</option>
              <option value="University of Delhi">University of Delhi (DU)</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Minimum Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[0, 3.5, 4.0, 4.5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setMinRating(rating)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    minRating === rating
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {rating === 0 ? 'Any' : `${rating}★+`}
                </button>
              ))}
            </div>
          </div>

          {/* Ownership */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Ownership
            </label>
            <select
              value={selectedOwnership}
              onChange={e => setSelectedOwnership(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="All">All Ownership Models</option>
              <option value="Public">Public / Government</option>
              <option value="Private">Private</option>
              <option value="Government-Aided">Government-Aided</option>
            </select>
          </div>

          {/* Checkboxes: Hostel & Verified */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hostelOnly}
                onChange={e => setHostelOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Hostel Facility Available</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Scorevault Verified Profile Only</span>
            </label>
          </div>

        </aside>

        {/* Results Container */}
        <div className="lg:col-span-3">
          {viewMode === 'grid' ? (
            filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResults.map(institution => (
                  <InstitutionCard
                    key={institution.id}
                    institution={institution}
                    onSelect={onSelectInstitution}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 font-display">No institutions found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  We couldn't find matching schools or colleges for your criteria. Try loosening your filters or searching another Indian city.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )
          ) : (
            /* Map View Representation */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Interactive Geographic Distribution
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pins represent verified campuses across Indian metropolitan educational zones.
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {filteredResults.length} locations mapped
                </span>
              </div>

              {/* Map Canvas Frame */}
              <div className="relative w-full h-96 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="relative w-full h-full">
                  {filteredResults.map((inst, index) => {
                    const leftPercent = 15 + ((index * 23) % 70);
                    const topPercent = 20 + ((index * 31) % 65);
                    const isSelected = selectedMapInstitution?.id === inst.id;

                    return (
                      <div
                        key={inst.id}
                        style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                      >
                        <button
                          onClick={() => setSelectedMapInstitution(inst)}
                          className={`group flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                              : 'bg-slate-900 text-white hover:bg-blue-600'
                          }`}
                        >
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span className="max-w-[120px] truncate">{inst.shortName}</span>
                          <span className="text-[10px] opacity-80">{inst.rating}★</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedMapInstitution && (
                  <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-white p-4 rounded-xl border border-slate-200 shadow-xl z-20 animate-in fade-in-50 duration-150">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {selectedMapInstitution.name}
                      </h4>
                      <button
                        onClick={() => setSelectedMapInstitution(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      {selectedMapInstitution.locality}, {selectedMapInstitution.city}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="font-bold text-blue-600">
                        {selectedMapInstitution.rating} ★ ({selectedMapInstitution.reviewCount} reviews)
                      </span>
                      <button
                        onClick={() => onSelectInstitution(selectedMapInstitution)}
                        className="text-[11px] font-bold text-slate-900 underline hover:text-blue-600"
                      >
                        Open Full Profile →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Filter Institutions
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* City */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">City</label>
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="All">All Cities</option>
                    {CITIES_DATA.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">Type</label>
                  <div className="flex gap-2">
                    {['All', 'School', 'College'].map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedType(t)}
                        className={`flex-1 py-1.5 rounded-lg border font-semibold ${
                          selectedType === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">Rating</label>
                  <div className="flex gap-1.5">
                    {[0, 3.5, 4.0, 4.5].map(r => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`flex-1 py-1.5 rounded-lg border font-semibold ${
                          minRating === r ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200'
                        }`}
                      >
                        {r === 0 ? 'Any' : `${r}★+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hostelOnly}
                      onChange={e => setHostelOnly(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Hostel Facility Available</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={e => setVerifiedOnly(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Verified Profiles Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 text-xs font-bold border border-slate-200 text-slate-700 rounded-xl"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl"
              >
                Show {filteredResults.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
