import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHomeClick: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onHomeClick }) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://scorevault.in/'
      },
      ...items.map((item, idx) => ({
        '@type': 'ListItem',
        'position': idx + 2,
        'name': item.label
      }))
    ]
  };

  return (
    <nav aria-label="Breadcrumb" className="my-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
        <li>
          <button
            onClick={onHomeClick}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors font-medium"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Home</span>
          </button>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              {isLast || !item.onClick ? (
                <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="hover:text-slate-900 transition-colors font-medium truncate max-w-[150px]"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
