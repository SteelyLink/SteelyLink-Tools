import { getTranslations } from 'next-intl/server';
import { CategoryGridClient } from './CategoryGridClient';
import type { CategoryItem } from './CategoryGridClient';

interface Props {
  locale: string;
}

const CATEGORY_DEFS = [
  { key: 'image',  icon: 'image',          iconBg: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/20',   iconColor: 'text-indigo-400', labelKey: 'imageCategory',  descKey: 'imageCategoryDesc',  sectionId: 'image-tools' },
  { key: 'pdf',    icon: 'picture_as_pdf', iconBg: 'from-red-500/20 to-rose-500/20 border-red-500/20',         iconColor: 'text-red-400',    labelKey: 'pdfCategory',    descKey: 'pdfCategoryDesc',    sectionId: 'pdf-tools' },
  { key: 'dev',    icon: 'terminal',       iconBg: 'from-purple-500/20 to-pink-500/20 border-purple-500/20',   iconColor: 'text-purple-400', labelKey: 'devCategory',    descKey: 'devCategoryDesc',    sectionId: 'dev-tools' },
  { key: 'light',  icon: 'apps',           iconBg: 'from-amber-500/20 to-orange-500/20 border-amber-500/20',   iconColor: 'text-amber-400',  labelKey: 'lightCategory',  descKey: 'lightCategoryDesc',  sectionId: 'utility-tools' },
  { key: 'calc',   icon: 'calculate',      iconBg: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20', iconColor: 'text-emerald-400',labelKey: 'calcCategory',   descKey: 'calcCategoryDesc',   sectionId: 'calc-tools' },
  { key: 'finance',icon: 'account_balance',iconBg: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/20', iconColor: 'text-yellow-400', labelKey: 'financeCategory',descKey: 'financeCategoryDesc',sectionId: 'finance-tools' },
  { key: 'encode', icon: 'code',           iconBg: 'from-violet-500/20 to-purple-500/20 border-violet-500/20', iconColor: 'text-violet-400', labelKey: 'encodeCategory', descKey: 'encodeCategoryDesc', sectionId: 'encode-tools' },
  { key: 'audio',  icon: 'audio_file',     iconBg: 'from-pink-500/20 to-rose-500/20 border-pink-500/20',       iconColor: 'text-pink-400',   labelKey: 'audioCategory',  descKey: 'audioCategoryDesc',  sectionId: 'audio-tools' },
  { key: 'game',   icon: 'sports_esports', iconBg: 'from-green-500/20 to-emerald-500/20 border-green-500/20', iconColor: 'text-green-400',  labelKey: 'gameCategory',   descKey: 'gameCategoryDesc',   sectionId: 'game-tools' },
];

export async function CategoryGrid({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  const categories: CategoryItem[] = CATEGORY_DEFS.map((def) => ({
    key: def.key,
    icon: def.icon,
    iconBg: def.iconBg,
    iconColor: def.iconColor,
    label: t(def.labelKey as 'imageCategory'),
    desc:  t(def.descKey  as 'imageCategoryDesc'),
    sectionId: def.sectionId,
  }));

  return (
    <section id="categories">
      <h2 className="section-title mb-8">{t('categoriesTitle')}</h2>
      <CategoryGridClient categories={categories} />
    </section>
  );
}
