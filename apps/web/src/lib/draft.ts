const key = (userId: string) => `pulse:draft:${userId}`;

// Drafts live in the browser. Storage can be blocked or full, and a draft is never worth an error.
export function loadDraft(userId: string): string {
  try {
    return window.localStorage.getItem(key(userId)) ?? '';
  } catch {
    return '';
  }
}

export function saveDraft(userId: string, text: string): void {
  try {
    if (text) window.localStorage.setItem(key(userId), text);
    else window.localStorage.removeItem(key(userId));
  } catch {
    // ignore
  }
}
