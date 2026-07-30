'use client';

import { useTranslations } from 'next-intl';

const CONFIGS = {
  'ai-bg': {
    tech: ['BRIA RMBG AI', 'ONNX Runtime', 'WebGPU / WASM'] as readonly string[],
    perkKeys: ['techBadgePerkAi', 'techBadgePerkSameAsPaid', 'techBadgePerkNoUpload'] as const,
  },
  'converter': {
    tech: [] as readonly string[],
    perkKeys: ['techBadgePerkFree', 'techBadgePerkSameAsPaid', 'techBadgePerkNoUpload'] as const,
  },
} as const;

type BadgeMode = keyof typeof CONFIGS;

export function TechBadge({ mode }: { mode: BadgeMode }) {
  const t = useTranslations('Tool');
  const { tech, perkKeys } = CONFIGS[mode];
  return (
    <div className="mt-3 flex items-center gap-3 flex-wrap">
      {/* Tech chips */}
      {tech.length > 0 && (
        <>
          {tech.map((chip, i) => (
            <span key={chip} className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded px-1.5 py-0.5">
                {chip}
              </span>
              {i < tech.length - 1 && <span className="text-slate-700 text-[10px]">·</span>}
            </span>
          ))}
          <span className="text-slate-700 text-sm select-none">|</span>
        </>
      )}

      {/* Perks inline */}
      {perkKeys.map((key, i) => (
        <span key={key} className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-emerald-400 flex-shrink-0" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="text-[11.5px] text-slate-400 whitespace-nowrap">{t(key)}</span>
          </span>
          {i < perkKeys.length - 1 && <span className="text-slate-700 text-[10px]">·</span>}
        </span>
      ))}
    </div>
  );
}
