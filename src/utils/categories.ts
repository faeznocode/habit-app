import { CategoryInfo, DEFAULT_CATEGORIES } from '../types';

const CATEGORIES_STORAGE_KEY = 'habits_custom_categories_v2';

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

/**
 * Save categories to localStorage and dispatch custom event for instant cross-component sync.
 */
export function saveCategories(categories: CategoryInfo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('habits_categories_updated', { detail: categories }));
  } catch (error) {
    console.error('🔥 Could not save categories to localStorage:', error);
  }
}

/**
 * Reset categories back to factory defaults.
 */
export function resetCategoriesToDefaults(): CategoryInfo[] {
  saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}
