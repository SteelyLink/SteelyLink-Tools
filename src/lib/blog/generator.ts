import type { BlogPostContent } from '@/types/blog';
import type { ToolDefinition } from '@/types/tools';

const CATEGORY_TIPS: Record<string, string[]> = {
  image: [
    'Convert images to WebP format to reduce file size by 30–50% compared to JPEG without noticeable quality loss.',
    'Use batch processing mode when working with multiple images — it saves time and keeps settings consistent.',
    'Your original files are never modified; downloads are always new files so originals stay safe.',
  ],
  pdf: [
    'Compress PDFs before emailing — most email servers reject attachments over 25 MB.',
    'Always password-protect PDFs that contain personal, financial, or legal information.',
    'Keep an uncompressed original as backup before applying heavy compression.',
  ],
  dev: [
    'Validate your JSON or XML before passing it to an API — malformed data causes silent failures.',
    'All encoding operations run entirely in your browser — no data is sent to any server.',
    'Use keyboard shortcuts (Ctrl+A then Ctrl+C) to quickly copy formatted output.',
  ],
  calc: [
    'Double-check the conversion direction before using results — input and output units are clearly labeled.',
    'For very large or very small numbers, use scientific notation (e.g. 1e6 for 1,000,000).',
    'Bookmark the tool for fast access during meetings or while coding.',
  ],
  finance: [
    'Always verify live exchange rates with your bank before making large currency transactions.',
    'BIN lookups are useful for fraud detection — cross-check the issuer before processing payments.',
    'Financial data displayed is for reference only; always confirm with official sources.',
  ],
  game: [
    'After converting sensitivity, fine-tune ±10% in-game to find your personal comfort zone.',
    'Make sure your DPI setting is identical in both games for an accurate sensitivity conversion.',
    'Warm up in deathmatch for 10–15 minutes after any sensitivity change before competitive play.',
  ],
  encode: [
    'UTF-8 is the safest encoding choice for international text — use it by default.',
    'For Markdown editing, preview your content before exporting to catch formatting issues.',
    'Auto-save happens every 500ms — your work is never lost even if the tab closes.',
  ],
  audio: [
    'Export audio at 320 kbps MP3 for the best balance of quality and file size.',
    'Use WAV format when maximum quality is needed for further editing.',
    'Always listen to a preview before downloading to catch unexpected artifacts.',
  ],
  light: [
    'All processing runs locally in your browser — your data never leaves your device.',
    'Use the copy button to quickly paste results into other applications.',
    'Reload the page if you want to start fresh with a new input.',
  ],
};

interface AutoGenParams {
  toolId: string;
  toolName: string;
  toolDesc: string;
  toolData: ToolDefinition;
  tt: (key: string, values?: Record<string, string>) => string;
  tb: (key: string, values?: Record<string, string>) => string;
  locale: string;
}

export function generateAutoContent({
  toolId,
  toolName,
  toolDesc,
  toolData,
  tt,
  tb,
}: AutoGenParams): BlogPostContent {
  const tips = CATEGORY_TIPS[toolData.category] ?? CATEGORY_TIPS.light;
  const descLower = toolDesc.toLowerCase().replace(/\.$/, '');

  return {
    title: tb('articleTitle', { tool: toolName }),
    metaTitle: tb('articleMetaTitle', { tool: toolName }),
    metaDescription: tb('articleMetaDesc', { desc: toolDesc.slice(0, 140) }),
    keywords: toolData.keywords,
    intro: tb('articleIntro', { tool: toolName, desc: descLower }),
    steps: [1, 2, 3].map((n) => {
      const keyTitle = `steps_${toolId}_${n}`;
      const keyDesc = `steps_${toolId}_${n}Desc`;
      const titleRaw = tt(keyTitle);
      const descRaw = tt(keyDesc);
      return {
        heading: titleRaw === keyTitle ? tt(`step${n}`) : titleRaw,
        body: descRaw === keyDesc ? tt(`step${n}Desc`) : descRaw,
      };
    }),
    tips,
    faqs: [
      {
        q: tt('faqFree', { tool: toolName }),
        a: tt('faqFreeAnswer', { tool: toolName }),
      },
      { q: tt('faqUpload'), a: tt('faqUploadAnswer') },
      { q: tt('faqFileSize'), a: tt('faqFileSizeAnswer') },
    ],
    conclusion: tb('articleConclusion', { tool: toolName }),
  };
}
