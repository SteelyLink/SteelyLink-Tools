'use client';

import { useState, useCallback, useEffect } from 'react';

export interface CategoryItem {
  key: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  desc: string;
  sectionId: string;
}

interface Props {
  categories: CategoryItem[];
}

export function CategoryGridClient({ categories }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [gridHighlight, setGridHighlight] = useState(false);

  useEffect(() => {
    const doHighlight = () => {
      setGridHighlight(true);
      setTimeout(() => setGridHighlight(false), 1200);
    };
    window.addEventListener('highlight-categories', doHighlight);
    return () => window.removeEventListener('highlight-categories', doHighlight);
  }, []);

  const handleClick = useCallback((key: string, sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActive(key);

    const el = document.getElementById(sectionId);
    if (!el) return;

    // Scroll section into center view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Brief highlight: add class, remove after animation
    el.classList.add('category-section-highlight');
    setTimeout(() => el.classList.remove('category-section-highlight'), 1400);
  }, []);

  return (
    <div className={`rounded-2xl transition-[padding,ring-color,ring-offset-color] duration-500 ${gridHighlight ? 'ring-2 ring-indigo-400/60 ring-offset-4 ring-offset-slate-950 p-3' : 'p-0'}`}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {categories.map((cat) => {
        const isActive = active === cat.key;
        return (
          <button
            key={cat.key}
            onClick={(e) => handleClick(cat.key, cat.sectionId, e)}
            className={`group relative text-left p-6 rounded-xl border transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 overflow-hidden cursor-pointer ${
              isActive
                ? 'bg-indigo-950/60 border-indigo-500/60 shadow-lg shadow-indigo-500/15 -translate-y-0.5'
                : 'bg-slate-900 border-slate-800 hover:border-indigo-500/40'
            }`}
          >
            {/* Hover/active overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-slate-800/40 to-transparent transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`} />

            {/* Active ring animation */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl border-2 border-indigo-400/40 animate-pulse pointer-events-none" />
            )}

            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.iconBg} flex items-center justify-center mb-4 border transition-transform ${
                isActive ? 'scale-110' : 'group-hover:scale-105'
              }`}>
                <span
                  className={`material-symbols-outlined text-xl ${cat.iconColor}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {cat.icon}
                </span>
              </div>
              <h3 className={`font-semibold text-base mb-2 transition-colors ${
                isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
              }`}>
                {cat.label}
              </h3>
              <p className={`text-sm leading-relaxed transition-colors ${
                isActive ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
              }`}>
                {cat.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
    </div>
  );
}
