// "@handle" in a post. Handles are lowercase letters, digits and underscores.
const MENTION = /(^|[^a-z0-9_])@([a-z0-9_]{3,30})(?![a-z0-9_])/gi;

export function extractMentions(text: string): string[] {
  const handles = new Set<string>();
  for (const match of text.matchAll(MENTION)) handles.add(match[2]!.toLowerCase());
  return [...handles];
}

export interface TextPart {
  text: string;
  mention?: string;
}

// Splits a post into plain text and mentions, so the UI can link the mentions without HTML.
export function splitMentions(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(MENTION)) {
    const start = match.index + match[1]!.length;
    if (start > last) parts.push({ text: text.slice(last, start) });
    parts.push({ text: `@${match[2]!}`, mention: match[2]!.toLowerCase() });
    last = start + 1 + match[2]!.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
