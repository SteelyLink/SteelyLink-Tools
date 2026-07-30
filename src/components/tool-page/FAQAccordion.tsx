'use client';

import { useState } from 'react';

export interface FAQItem {
  q: string;
  a: string;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-slate-200 font-medium text-sm pr-4">{item.q}</span>
            <svg
              className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-slate-800/60 pt-3 animate-fade-in">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
