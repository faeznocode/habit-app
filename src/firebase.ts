import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export type { User };

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  // Optional: prompt user to select account if they have multiple Google accounts
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  console.log('✅ [Auth] Signed in with Google:', result.user.email, result.user.uid);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
  console.log('👋 [Auth] User signed out.');
}

export function subscribeAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('🔥 [Firestore Error Details]:\n' + JSON.stringify(errInfo, null, 2));

  if (errMessage.includes('permission') || errMessage.includes('PERMISSION_DENIED')) {
    console.error('🚨 [Firestore Permission Denied] Operation: ' + operationType + ' at path: ' + path);
  } else if (
    errMessage.includes('offline') ||
    errMessage.includes('unavailable') ||
    errMessage.includes('client is offline')
  ) {
    console.error('⚠️ [Firestore Offline/Connection Error] Database connection issue at path: ' + path);
  }

  return errInfo;
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ [Firestore] Successfully connected to database: ' + firebaseConfig.firestoreDatabaseId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('⚠️ [Firestore Connection Warning] The client is offline or database is starting up.');
    } else {
      console.log('ℹ️ [Firestore Connection Checked] Response received from server.');
    }
    return false;
  }
}

testConnection();
