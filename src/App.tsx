import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { AuthModal } from './components/common/AuthModal';
import { HeroSection } from './components/home/HeroSection';
import { TrendingSection } from './components/home/TrendingSection';
import { TrustManifesto } from './components/home/TrustManifesto';
import { SearchAndFilterView } from './components/search/SearchAndFilterView';
import { InstitutionProfileView } from './components/institution/InstitutionProfileView';
import { CompareView } from './components/compare/CompareView';
import { SavedInstitutionsView } from './components/saved/SavedInstitutionsView';
import { CityHubView } from './components/city/CityHubView';
import { CategoryHubView } from './components/category/CategoryHubView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AIAdvisorModal } from './components/advisor/AIAdvisorModal';
import { dataService } from './services/dataService';
import { Institution, SearchFilterParams } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [searchParams, setSearchParams] = useState<SearchFilterParams>({});
  const [selectedCityName, setSelectedCityName] = useState<string>('Lucknow');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Schools');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);

  // Keyboard shortcut: Cmd+K or Ctrl+K triggers search view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentView('search');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'schools') {
      setSelectedCategoryName('Schools');
      setCurrentView('category');
      return;
    }
    if (view === 'colleges') {
      setSelectedCategoryName('Colleges');
      setCurrentView('category');
      return;
    }
    if (view === 'cities') {
      setSelectedCityName(param || 'Lucknow');
      setCurrentView('city');
      return;
    }
    if (view === 'city') {
      setSelectedCityName(param || 'Lucknow');
      setCurrentView('city');
      return;
    }
    if (view === 'category') {
      setSelectedCategoryName(param || 'Schools');
      setCurrentView('category');
      return;
    }
    setCurrentView(view);
  };

  const handleOpenSearchWithQuery = (query: string) => {
    setSearchParams({ query });
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInstitution = (inst: Institution) => {
    setSelectedInstitution(inst);
    setCurrentView('institution');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trendingInstitutions = dataService.getTrendingInstitutions();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-slate-900 pb-16 md:pb-0 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Universal Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => {
          setSearchParams({});
          setCurrentView('search');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAdvisor={() => setAdvisorModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div>
            <HeroSection
              onSearchSubmit={handleOpenSearchWithQuery}
              onSelectCategory={cat => handleNavigate('category', cat)}
              onSelectCity={city => handleNavigate('city', city)}
            />

            <TrendingSection
              institutions={trendingInstitutions}
              onSelectInstitution={handleSelectInstitution}
              onExploreMore={() => handleNavigate('search')}
            />

            <TrustManifesto />
          </div>
        )}

        {currentView === 'search' && (
          <SearchAndFilterView
            initialParams={searchParams}
            onSelectInstitution={handleSelectInstitution}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'institution' && selectedInstitution && (
          <InstitutionProfileView
            institution={selectedInstitution}
            onBack={() => handleNavigate('search')}
            onRequireAuth={() => setAuthModalOpen(true)}
            onCompareNavigate={() => handleNavigate('compare')}
          />
        )}

        {currentView === 'compare' && (
          <CompareView
            onBack={() => handleNavigate('home')}
            onSelectInstitution={handleSelectInstitution}
            onOpenSearch={() => handleNavigate('search')}
          />
        )}

        {currentView === 'saved' && (
          <SavedInstitutionsView
            onBack={() => handleNavigate('home')}
            onSelectInstitution={handleSelectInstitution}
            onExploreMore={() => handleNavigate('search')}
            onCompareNavigate={() => handleNavigate('compare')}
          />
        )}

        {currentView === 'city' && (
          <CityHubView
            initialCityName={selectedCityName}
            onBack={() => handleNavigate('home')}
            onSelectInstitution={handleSelectInstitution}
          />
        )}

        {currentView === 'category' && (
          <CategoryHubView
            initialCategory={selectedCategoryName}
            onBack={() => handleNavigate('home')}
            onSelectInstitution={handleSelectInstitution}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            onBack={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => {
          setSearchParams({});
          setCurrentView('search');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdvisor={() => setAdvisorModalOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <AIAdvisorModal
        isOpen={advisorModalOpen}
        onClose={() => setAdvisorModalOpen(false)}
      />

    </div>
  );
}
