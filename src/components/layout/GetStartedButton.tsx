'use client';

interface Props {
  label: string;
  className?: string;
}

export function GetStartedButton({ label, className }: Props) {
  const handleClick = () => {
    const el = document.getElementById('categories');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      setTimeout(() => window.dispatchEvent(new CustomEvent('highlight-categories')), 500);
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {label}
    </button>
  );
}
