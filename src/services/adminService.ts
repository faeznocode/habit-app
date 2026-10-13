import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, User, handleFirestoreError, OperationType } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastActiveAt: string;
  role?: string;
}

/**
 * Check whether a user is an authorized administrator.
 * Single source of truth: existence of document /admins/{uid}
 * Clients can only read their own /admins/{uid} document.
 */
import firebaseConfig from '../../firebase-applet-config.json';

export interface AdminCheckDetails {
  isAdmin: boolean;
  uid: string;
  email?: string | null;
  databaseId: string;
  status: 'verified' | 'not_found' | 'error';
  errorMessage?: string;
  checkedAt: string;
}

/**
 * Check whether a user is an authorized administrator with rich diagnostic feedback.
 */
export async function checkIsAdminDetailed(uid: string, email?: string | null): Promise<AdminCheckDetails> {
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
  const now = new Date().toLocaleTimeString();

  if (!uid) {
    return {
      isAdmin: false,
      uid: '',
      email,
      databaseId,
      status: 'error',
      errorMessage: 'No authenticated user UID provided.',
      checkedAt: now,
    };
  }

  try {
    console.log(`🔍 [Admin Verification] Checking document /admins/${uid} in database: ${databaseId}...`);
    const adminDocRef = doc(db, 'admins', uid);
    const adminSnap = await getDoc(adminDocRef);

    if (adminSnap.exists()) {
      console.log(`✅ [Admin Verification] SUCCESS! Document /admins/${uid} found.`);
      return {
        isAdmin: true,
        uid,
        email,
        databaseId,
        status: 'verified',
        checkedAt: now,
      };
    } else {
      console.warn(`⚠️ [Admin Verification] Document /admins/${uid} was not found in database: ${databaseId}.`);
      return {
        isAdmin: false,
        uid,
        email,
        databaseId,
        status: 'not_found',
        errorMessage: `Document "/admins/${uid}" does not exist in database "${databaseId}".`,
        checkedAt: now,
      };
    }
  } catch (error: any) {
    const msg = error?.message || String(error);
    console.error(`🚨 [Admin Verification] Firestore error reading /admins/${uid}:`, msg);
    return {
      isAdmin: false,
      uid,
      email,
      databaseId,
      status: 'error',
      errorMessage: msg,
      checkedAt: now,
    };
  }
}

/**
 * Check whether a user is an authorized administrator.
 * Single source of truth: existence of document /admins/{uid}
 */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  const details = await checkIsAdminDetailed(uid);
  return details.isAdmin;
}

/**
 * Non-destructively synchronizes the authenticated user's profile to /users/{uid}.
 * Does NOT set or modify admin roles or any protected administrative fields.
 * Preserves all existing habit subcollections and user data via merge.
 */
export async function syncUserProfile(user: User): Promise<void> {
  if (!user || !user.uid) return;

  const userDocRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  try {
    const existingSnap = await getDoc(userDocRef);
    const isNew = !existingSnap.exists();

    const profileData: Record<string, any> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      lastActiveAt: now,
    };

    if (isNew) {
      profileData.createdAt = now;
    }

    // Merge into /users/{uid} without touching role or habit subcollections
    await setDoc(userDocRef, profileData, { merge: true });
    console.log(`👤 [User Directory] Profile synchronized for ${user.email} (${user.uid})`);
  } catch (error) {
    console.error(`⚠️ [User Directory] Could not sync user profile for ${user.uid}:`, error);
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

import { collection, getDocs } from 'firebase/firestore';

/**
 * Fetch list of registered users for Admin User Management.
 * Only accessible by verified administrators.
 */
export async function fetchRegisteredUsers(): Promise<UserProfile[]> {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const users: UserProfile[] = [];

    snapshot.forEach((d) => {
      const data = d.data();
      users.push({
        uid: data.uid || d.id,
        email: data.email || 'No email',
        displayName: data.displayName || 'Unnamed User',
        photoURL: data.photoURL || undefined,
        createdAt: data.createdAt || 'Unknown',
        lastActiveAt: data.lastActiveAt || data.createdAt || 'Unknown',
        role: data.role || 'user',
      });
    });

    // Sort by last active or created descending
    users.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
    return users;
  } catch (error) {
    console.error('🔥 [Admin] Failed to fetch users list:', error);
    return [];
  }
}

