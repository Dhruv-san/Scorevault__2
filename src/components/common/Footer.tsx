import React from 'react';
import { ShieldCheck, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const cities = ['Lucknow', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'];
  const categories = [
    { label: 'Schools', value: 'Schools' },
    { label: 'Engineering Colleges', value: 'Engineering' },
    { label: 'MBA / Management', value: 'Management' },
    { label: 'Medical Colleges', value: 'Medical' },
    { label: 'Law Colleges', value: 'Law' },
    { label: 'Universities', value: 'Universities' }
  ];

  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600 text-sm">
      {/* Neutrality Trust Bar */}
      <div className="bg-slate-900 text-slate-300 py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">The Scorevault Neutrality Guarantee</p>
              <p className="text-slate-400 text-xs">
                We never take money from schools or colleges to manipulate ratings, hide negative reviews, or boost ranks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Independent Indian Consumer Platform
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-950 font-display">
                SCORE<span className="text-blue-600">VAULT</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              India's authentic discovery, rating, review, and comparison platform for schools, engineering colleges, universities, and MBA institutions.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <p className="font-medium text-slate-700">“Know before you choose.”</p>
              <p className="mt-1">Built to help Indian students and parents make confident educational decisions.</p>
            </div>
          </div>

          {/* Col 2: Popular Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Popular Cities
            </h4>
            <ul className="space-y-2 text-xs">
              {cities.map(city => (
                <li key={city}>
                  <button
                    onClick={() => onNavigate('city', city)}
                    className="hover:text-blue-600 transition-colors text-left"
                  >
                    Schools & Colleges in {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.map(cat => (
                <li key={cat.value}>
                  <button
                    onClick={() => onNavigate('category', cat.value)}
                    className="hover:text-blue-600 transition-colors text-left"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Trust & Moderation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Trust & Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-blue-600 transition-colors">
                  Moderation Hub
                </button>
              </li>
              <li>
                <span className="text-slate-500">Student ID Verification</span>
              </li>
              <li>
                <span className="text-slate-500">Anti-Defamation Guard</span>
              </li>
              <li>
                <span className="text-slate-500">Institution Claim Process</span>
              </li>
              <li>
                <span className="text-slate-500">Zero Sponsored Placements</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Scorevault India Technologies. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Crafted for Indian education seekers</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
