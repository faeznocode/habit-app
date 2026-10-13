import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Habit, HabitLogsState } from '../types';
import { DEFAULT_HABITS } from '../utils/storage';

function sanitizeHabit(habit: Habit): Record<string, any> {
  const data: Record<string, any> = {
    id: habit.id,
    title: habit.title || 'Untitled Habit',
    category: habit.category || 'health',
    color: habit.color || '#007AFF',
    icon: habit.icon || 'water',
    timeOfDay: habit.timeOfDay || 'anytime',
    frequency: habit.frequency || 'daily',
    targetType: habit.targetType || 'boolean',
    createdAt: habit.createdAt || new Date().toISOString(),
  };

  if (habit.cue !== undefined && habit.cue !== null) {
    data.cue = habit.cue;
  }
  if (habit.targetValue !== undefined && habit.targetValue !== null) {
    data.targetValue = Number(habit.targetValue);
  }
  if (habit.unit !== undefined && habit.unit !== null) {
    data.unit = habit.unit;
  }
  if (habit.archived !== undefined) {
    data.archived = Boolean(habit.archived);
  }

  return data;
}

function parseHabitDoc(data: any): Habit {
  return {
    id: data.id,
    title: data.title || '',
    cue: data.cue || undefined,
    category: data.category || 'health',
    color: data.color || '#007AFF',
    icon: data.icon || 'water',
    timeOfDay: data.timeOfDay || 'anytime',
    frequency: data.frequency || 'daily',
    targetType: data.targetType || 'boolean',
    targetValue: data.targetValue !== undefined ? Number(data.targetValue) : undefined,
    unit: data.unit || undefined,
    createdAt: data.createdAt || new Date().toISOString(),
    archived: Boolean(data.archived),
  };
}

/**
 * Subscribe to real-time habits from /users/{userId}/habits.
 * Automatically seeds DEFAULT_HABITS for new users if their collection is empty.
 */
export function subscribeHabits(
  userId: string,
  onHabitsChange: (habits: Habit[]) => void,
  onError?: (error: any) => void
): () => void {
  if (!userId) return () => {};

  const habitsCol = collection(db, 'users', userId, 'habits');
  let hasSeeded = false;

  const unsubscribe = onSnapshot(
    habitsCol,
    async (snapshot) => {
      if (snapshot.empty && !hasSeeded) {
        hasSeeded = true;
        console.log(`🌱 [Firestore] No habits found for user ${userId}. Seeding starter habits...`);
        try {
          await seedDefaultHabits(userId);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${userId}/habits/seed`);
        }
        return;
      }

      const items: Habit[] = [];
      snapshot.forEach((docSnap) => {
        items.push(parseHabitDoc(docSnap.data()));
      });

      // Sort by creation date
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      console.log(`📦 [Firestore] Loaded ${items.length} private habits for user ${userId}.`);
      onHabitsChange(items);
    },
    (error) => {
      console.error(`🔥 [Firestore] Error listening to /users/${userId}/habits:`, error);
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/habits`);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Seed initial default habits into /users/{userId}/habits.
 */
export async function seedDefaultHabits(userId: string): Promise<void> {
  if (!userId) return;
  const batch = writeBatch(db);
  for (const habit of DEFAULT_HABITS) {
    const docRef = doc(db, 'users', userId, 'habits', habit.id);
    batch.set(docRef, sanitizeHabit(habit));
  }
  await batch.commit();
  console.log(`✅ [Firestore] Default habits seeded for user ${userId}.`);
}

/**
 * Create or update a habit under /users/{userId}/habits/{habitId}.
 */
export async function saveHabitToFirestore(userId: string, habit: Habit): Promise<void> {
  if (!userId) throw new Error('Cannot save habit: No authenticated user.');
  const path = `users/${userId}/habits/${habit.id}`;
  try {
    const data = sanitizeHabit(habit);
    await setDoc(doc(db, 'users', userId, 'habits', habit.id), data);
    console.log(`✅ [Firestore] Saved habit "${habit.title}" for user ${userId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Delete a habit from /users/{userId}/habits/{habitId}.
 */
export async function deleteHabitFromFirestore(userId: string, habitId: string): Promise<void> {
  if (!userId) throw new Error('Cannot delete habit: No authenticated user.');
  const path = `users/${userId}/habits/${habitId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'habits', habitId));
    console.log(`🗑️ [Firestore] Deleted habit ${habitId} for user ${userId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Subscribe to real-time habit logs from /users/{userId}/habit_logs.
 */
export function subscribeLogs(
  userId: string,
  onLogsChange: (logs: HabitLogsState) => void,
  onError?: (error: any) => void
): () => void {
  if (!userId) return () => {};

  const logsCol = collection(db, 'users', userId, 'habit_logs');

  const unsubscribe = onSnapshot(
    logsCol,
    (snapshot) => {
      const logsState: HabitLogsState = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.dateKey && data.entries) {
          logsState[data.dateKey] = data.entries;
        }
      });
      console.log(`📦 [Firestore] Received habit logs for ${Object.keys(logsState).length} dates (user: ${userId}).`);
      onLogsChange(logsState);
    },
    (error) => {
      console.error(`🔥 [Firestore] Error listening to /users/${userId}/habit_logs:`, error);
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/habit_logs`);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Save completion value for a habit on a specific date under /users/{userId}/habit_logs/{dateKey}.
 */
export async function saveHabitLogValueToFirestore(
  userId: string,
  dateKey: string,
  habitId: string,
  value: number | boolean,
  currentDayLogs?: Record<string, number | boolean>
): Promise<void> {
  if (!userId) throw new Error('Cannot save habit log: No authenticated user.');
  const path = `users/${userId}/habit_logs/${dateKey}`;
  try {
    const updatedEntries = {
      ...(currentDayLogs || {}),
      [habitId]: value,
    };
    await setDoc(
      doc(db, 'users', userId, 'habit_logs', dateKey),
      {
        dateKey,
        entries: updatedEntries,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`✅ [Firestore] Logged "${habitId}" = ${value} on ${dateKey} for user ${userId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Batch save habit logs under /users/{userId}/habit_logs.
 */
export async function saveAllLogsToFirestore(userId: string, logs: HabitLogsState): Promise<void> {
  if (!userId) throw new Error('Cannot save logs: No authenticated user.');
  const path = `users/${userId}/habit_logs/batch`;
  try {
    const batch = writeBatch(db);
    const dateKeys = Object.keys(logs);
    for (const dateKey of dateKeys) {
      const docRef = doc(db, 'users', userId, 'habit_logs', dateKey);
      batch.set(docRef, {
        dateKey,
        entries: logs[dateKey],
        updatedAt: new Date().toISOString(),
      });
    }
    await batch.commit();
    console.log(`✅ [Firestore] Saved logs for ${dateKeys.length} dates for user ${userId}.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Reset all habit data for this specific user back to defaults.
 */
export async function resetFirestoreData(userId: string): Promise<void> {
  if (!userId) throw new Error('Cannot reset data: No authenticated user.');
  const path = `users/${userId}/reset`;
  try {
    // 1. Delete user habits
    const habitsSnap = await getDocs(collection(db, 'users', userId, 'habits'));
    const batch1 = writeBatch(db);
    habitsSnap.forEach((d) => batch1.delete(d.ref));
    await batch1.commit();

    // 2. Delete user logs
    const logsSnap = await getDocs(collection(db, 'users', userId, 'habit_logs'));
    const batch2 = writeBatch(db);
    logsSnap.forEach((d) => batch2.delete(d.ref));
    await batch2.commit();

    // 3. Seed defaults for this user
    await seedDefaultHabits(userId);
    console.log(`🔄 [Firestore] Reset habits & logs back to default for user ${userId}.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}
