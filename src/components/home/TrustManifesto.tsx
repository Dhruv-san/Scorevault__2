import React from 'react';
import { ShieldCheck, UserCheck, EyeOff, BarChart3, CheckCircle2 } from 'lucide-react';

export const TrustManifesto: React.FC = () => {
  const pillars = [
    {
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
      title: 'Verified Reviewer Identity',
      desc: 'We verify college roll numbers, university email domains, and school fee receipts before awarding Verified Badges.'
    },
    {
      icon: <EyeOff className="w-5 h-5 text-indigo-600" />,
      title: 'Zero Paid Deletions',
      desc: 'No institution can pay to remove critical reviews, alter star ratings, or buy preferential organic ranking.'
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
      title: 'Nuanced Category Rubrics',
      desc: 'Schools evaluated for safety and holistic activities; colleges evaluated for median placements and research faculty.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      title: 'Anti-Abuse Content Shield',
      desc: 'Defamation, harassment, and private contact disclosures are blocked before publication through automated guards.'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-full">
            The Trust Standard
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
            Why Indian parents and students trust Scorevault
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Traditional education portals rely on sponsored marketing. Scorevault is built on radical transparency and community accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-4">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Audited Daily</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
