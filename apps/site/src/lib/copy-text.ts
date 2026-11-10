/** Clipboard writes are denied in Arena's sandboxed preview iframe. Fail cleanly
 * there, while retaining the native clipboard behavior on a normal site tab. */
export async function copyText(text: string): Promise<boolean> {
  if (typeof window === "undefined" || window.self !== window.top) return false;
  if (!navigator.clipboard?.writeText) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
