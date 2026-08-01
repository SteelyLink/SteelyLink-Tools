import type { AbstractIntlMessages } from 'next-intl';

/**
 * Trims the message bundle down to what a page's *client* components actually read.
 *
 * `NextIntlClientProvider` serializes whatever it is handed into the HTML and again
 * into the RSC payload fetched on every client-side navigation. Handing it the whole
 * bundle made each page ~810 KB of HTML and ~710 KB per navigation, most of it strings
 * no client component ever asks for: ToolFAQ (284 KB) and ToolSeo (198 KB) are rendered
 * server-side into markup and were being shipped a second time as raw JSON.
 *
 * Server components read translations through `getTranslations`, which does not go
 * through this provider — so omitting a namespace here never affects them.
 *
 * Namespaces are derived from the `useTranslations(...)` calls in `'use client'`
 * components; re-check with:
 *   grep -rl "^'use client'" src | xargs grep -oh "useTranslations(['\"][^'\"]*"
 */

/** Read by MobileMenu and AboutDropdown, which live in the layout on every page. */
export const SHELL_NAMESPACES = ['Nav'] as const;

/** Read by the tool cores, HowToUse and RelatedTools. */
export const TOOL_NAMESPACES = ['Nav', 'Tool', 'ToolNames', 'ToolDescriptions'] as const;

export function pickMessages(
  messages: AbstractIntlMessages,
  namespaces: readonly string[]
): AbstractIntlMessages {
  const picked: Record<string, unknown> = {};
  for (const ns of namespaces) {
    if (ns in messages) picked[ns] = messages[ns];
  }
  return picked as AbstractIntlMessages;
}

/**
 * Matches the only per-tool key shape in the `Tool` namespace: `steps_<toolId>_2Desc`.
 * 666 of its 1554 keys (72 KB of 104 KB in `en`) are these, three steps per tool times
 * `Desc`, and `HowToUse` is the sole reader — it builds `steps_${toolId}_${n}` and
 * `…${n}Desc` for the tool being rendered and nothing else.
 *
 * Anchored and exact rather than a substring test, because tool ids nest: `base64` is
 * inside `base64-image`, and static keys like `base64PlainText` (read by DevToolCore for
 * any tool it backs) must survive. Matching the whole key makes both cases unambiguous.
 */
const STEP_KEY = /^steps_(.+)_\d+(?:Desc)?$/;

/**
 * Same as `pickMessages(messages, TOOL_NAMESPACES)`, but drops the step copy belonging
 * to the other ~110 tools, which this page can never read. Takes `Tool` from 104 KB to
 * roughly 33 KB per tool page.
 */
export function pickToolMessages(
  messages: AbstractIntlMessages,
  toolId: string
): AbstractIntlMessages {
  const picked = pickMessages(messages, TOOL_NAMESPACES) as Record<string, AbstractIntlMessages>;
  const tool = picked.Tool;
  if (!tool) return picked;

  const scoped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(tool)) {
    const step = STEP_KEY.exec(key);
    if (!step || step[1] === toolId) scoped[key] = value;
  }

  return { ...picked, Tool: scoped as AbstractIntlMessages };
}
