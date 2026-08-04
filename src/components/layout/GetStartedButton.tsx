'use client';

import { scrollToSection } from '@/lib/utils/scroll';

interface Props {
  label: string;
  className?: string;
}

export function GetStartedButton({ label, className }: Props) {
  return (
    <button onClick={() => scrollToSection('categories')} className={className}>
      {label}
    </button>
  );
}
