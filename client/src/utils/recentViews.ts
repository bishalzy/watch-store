const STORAGE_KEY = "watchstore_recently_viewed";
const MAX_RECENT_ITEMS = 5;

/**
 * Retrieves the list of recently viewed product IDs from localStorage.
 */
export function getRecentlyViewed(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id) => typeof id === "number" && !isNaN(id));
    }
    return [];
  } catch (err) {
    console.error("Failed to read recently viewed products:", err);
    return [];
  }
}

/**
 * Records a viewed product ID into localStorage, ensuring uniqueness and keeping
 * up to MAX_RECENT_ITEMS with the most recent at the beginning.
 */
export function addRecentlyViewed(productId: number): void {
  if (!productId || isNaN(productId)) return;

  try {
    const existing = getRecentlyViewed();
    const updated = [productId, ...existing.filter((id) => id !== productId)].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save recently viewed product:", err);
  }
}

/**
 * Clears the browsing history stored in localStorage.
 */
export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear recently viewed products:", err);
  }
}
