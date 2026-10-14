import { CategoryInfo, DEFAULT_CATEGORIES } from '../types';
import { db } from '../firebase';
import {
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  type Unsubscribe,
} from 'firebase/firestore';

const CATEGORIES_STORAGE_KEY = 'habits_custom_categories_v2';
const FIRESTORE_DOC = doc(db, 'appConfig', 'categories');

// ---------------------------------------------------------------------------
// LocalStorage helpers (cache / offline fallback)
// ---------------------------------------------------------------------------

/**
 * Load categories from localStorage, falling back to default categories.
 */
export function loadCategories(): CategoryInfo[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not load categories from localStorage, using defaults:', error);
  }
  return DEFAULT_CATEGORIES;
}

/** Write categories to localStorage and fire a cross-component event. */
function cacheLocally(categories: CategoryInfo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('habits_categories_updated', { detail: categories }));
  } catch (error) {
    console.error('🔥 Could not cache categories to localStorage:', error);
  }
}

// ---------------------------------------------------------------------------
// Firestore helpers
// ---------------------------------------------------------------------------

/**
 * Save categories to Firestore (admin-only write) AND update the local cache.
 */
export async function saveCategories(categories: CategoryInfo[]): Promise<void> {
  try {
    await setDoc(FIRESTORE_DOC, {
      list: categories,
      updatedAt: new Date().toISOString(),
    });

    cacheLocally(categories);
    console.log(`✅ [Categories] Saved ${categories.length} categories to Firestore.`);
  } catch (error) {
    console.error('🔥 [Categories] Failed to save categories:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time Firestore category updates.
 * Calls `onUpdate` immediately with cached data, then on every Firestore change.
 * Returns an unsubscribe function.
 */
export function subscribeCategories(onUpdate: (cats: CategoryInfo[]) => void): Unsubscribe {
  // Fire immediately with locally cached data so the UI is never blank
  onUpdate(loadCategories());

  const unsubscribe = onSnapshot(
    FIRESTORE_DOC,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.list)) {
          cacheLocally(data.list);
          onUpdate(data.list);
        }
      } else {
        // No Firestore doc yet — seed from defaults/local cache
        const current = loadCategories();
        onUpdate(current);
      }
    },
    (error) => {
      console.warn('⚠️ [Categories] Firestore listener error, using local cache:', error.message);
      onUpdate(loadCategories());
    }
  );

  return unsubscribe;
}

/**
 * One-shot fetch from Firestore (for non-realtime reads).
 */
export async function fetchCategories(): Promise<CategoryInfo[]> {
  try {
    const snap = await getDoc(FIRESTORE_DOC);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.list)) {
        cacheLocally(data.list);
        return data.list as CategoryInfo[];
      }
    }
  } catch (error) {
    console.warn('⚠️ [Categories] Could not fetch from Firestore, using local cache:', error);
  }
  return loadCategories();
}

/**
 * Reset categories back to factory defaults (writes to Firestore + local cache).
 */
export async function resetCategoriesToDefaults(): Promise<CategoryInfo[]> {
  await saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}
