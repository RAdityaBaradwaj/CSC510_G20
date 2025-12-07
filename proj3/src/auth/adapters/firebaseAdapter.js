import { initializeApp, getApps } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  updateProfile, getIdToken
} from "firebase/auth";
import { validateAdminCredentials } from "../../utils/adminAuth";

// Prevent double init in Vite
const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    });

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// Store mock admin session
let mockAdminUser = null;

// Create a mock admin user object
function createMockAdminUser(email) {
  return {
    uid: `admin-${email.replace('@', '-').replace('.', '-')}`,
    email: email,
    displayName: 'Admin',
    isAdmin: true
  };
}

// Finalize redirect 
(async () => {
  try {
    await getRedirectResult(auth);
  } catch (_) {
    // No-op if there wasn't a redirect
  }
})();

// Check for mock admin session on load
const storedMockAdmin = localStorage.getItem('mockAdminUser');
if (storedMockAdmin) {
  try {
    mockAdminUser = JSON.parse(storedMockAdmin);
  } catch (e) {
    localStorage.removeItem('mockAdminUser');
  }
}

async function googleLogin() {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    // Common: popup blocked/closed -> use redirect
    const popupIssues = new Set([
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
    ]);
    if (popupIssues.has(e?.code)) {
      await signInWithRedirect(auth, provider);
      return;
    }
    // Surface other errors so UI can show e.code
    throw e;
  }
}

// Custom login that handles admin credentials
async function loginWithAdminCheck(email, password) {
  // Check if this is an admin login
  if (validateAdminCredentials(email, password)) {
    // Create mock admin user
    const adminUser = createMockAdminUser(email);
    mockAdminUser = adminUser;
    localStorage.setItem('mockAdminUser', JSON.stringify(adminUser));
    
    // Return a promise that resolves with the admin user
    // This will trigger the auth state change callback
    return Promise.resolve({
      user: adminUser
    });
  }
  
  // Otherwise, use normal Firebase login
  return signInWithEmailAndPassword(auth, email, password);
}

// Custom logout that clears mock admin
async function logoutWithAdminCheck() {
  mockAdminUser = null;
  localStorage.removeItem('mockAdminUser');
  return signOut(auth);
}

// Enhanced auth state observer that includes mock admin
function onAuthStateChangedWithAdmin(cb) {
  // Check for mock admin on initial load (before Firebase listener)
  if (mockAdminUser && !auth.currentUser) {
    // Use setTimeout to ensure this runs after any Firebase initialization
    setTimeout(() => cb(mockAdminUser), 0);
  }
  
  // Set up Firebase auth state listener
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // Firebase user logged in - clear mock admin
      mockAdminUser = null;
      localStorage.removeItem('mockAdminUser');
      cb({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName });
    } else if (mockAdminUser) {
      // Mock admin user logged in (no Firebase user)
      cb(mockAdminUser);
    } else {
      // No user
      cb(null);
    }
  });
  
  return unsubscribe;
}

export default {
  onAuthStateChanged: onAuthStateChangedWithAdmin,
  login: loginWithAdminCheck,
  signup: async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
  },
  loginWithGoogle: () => googleLogin(),
  logout: logoutWithAdminCheck,
  getToken: async () => {
    if (auth.currentUser) {
      return getIdToken(auth.currentUser);
    }
    // Mock admin doesn't have a real token
    if (mockAdminUser) {
      return Promise.resolve('mock-admin-token');
    }
    return null;
  },
};
