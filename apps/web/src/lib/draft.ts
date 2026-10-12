const key = (scope: string) => `pulse:draft:${scope}`;

// Drafts live in the browser. Storage can be blocked or full, and a draft is never worth an error.
export function loadDraft(scope: string): string {
  try {
    return window.localStorage.getItem(key(scope)) ?? '';
  } catch {
    return '';
  }
}

export function saveDraft(scope: string, text: string): void {
  try {
    if (text) window.localStorage.setItem(key(scope), text);
    else window.localStorage.removeItem(key(scope));
  } catch {
    // ignore
  }
}
