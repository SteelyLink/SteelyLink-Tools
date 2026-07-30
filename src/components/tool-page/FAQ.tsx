import { getTranslations, getMessages } from 'next-intl/server';
import { FAQAccordion, type FAQItem } from './FAQAccordion';
import { generateFaqSchema } from '@/lib/utils/seo';

interface Props {
  toolId: string;
  toolName: string;
  locale: string;
}

export async function FAQ({ toolId, toolName, locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'Tool' });
  const messages = await getMessages({ locale });

  const toolFaqMap = (messages as Record<string, unknown>).ToolFAQ as Record<string, FAQItem[]> | undefined;
  const toolFaqs = toolFaqMap?.[toolId];

  const genericFaqs: FAQItem[] = [
    { q: t('faqFree',     { tool: toolName }), a: t('faqFreeAnswer',     { tool: toolName }) },
    { q: t('faqUpload'),                        a: t('faqUploadAnswer') },
    { q: t('faqFileSize'),                      a: t('faqFileSizeAnswer') },
    { q: t('faqMobile'),                        a: t('faqMobileAnswer') },
    { q: t('faqBrowser'),                       a: t('faqBrowserAnswer') },
    { q: t('faqSupported'),                     a: t('faqSupportedAnswer') },
  ];

  const faqs = toolFaqs && toolFaqs.length > 0 ? toolFaqs : genericFaqs;
  const faqSchema = generateFaqSchema(faqs);

  return (
    <section className="mb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-5">{t('faq')}</h2>
      <FAQAccordion items={faqs} />
    </section>
  );
}
