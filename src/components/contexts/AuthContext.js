'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  ref, 
  set, 
  get, 
  child, 
  serverTimestamp 
} from 'firebase/database';
import { auth, database } from '@/lib/firebase';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Available profile images
  const profileImages = [
    '13fc6350-b883-4615-b8d0-4c203c125535.jpg',
    '4cd502d1-9e99-43dc-b2a3-45d5a52f3704.jpg',
    '519eabc9-cd78-41a1-99fb-5d47d89015e8.jpg',
    '5eff03a1-04c0-4903-a58f-6dfb7427ba5d.jpg',
    '7c7f9738-d7a5-4009-b68d-42d63a4f77e2.jpg',
    '8ae4b851-4163-42f0-8737-26e7d88ce539.jpg',
    '8d52b32e-631e-4259-87a6-e14d2e7fd6a1.jpg',
    'aIgirl_AI.jpg',
    'anime-stylecelebrating-valentines-day.jpg',
    'bc120664-d273-4e40-9986-6c8353379b07.jpg',
    'beautiful-cartoon-woman-portrait.jpg',
    'cute-cartoon-kid-posing-portrait.jpg',
    'dc1e893b-25a1-466f-a6f2-6f9366cba271.jpg',
    'eecf8cde-a38e-459b-aeed-71436f0bc99a.jpg',
    'ff591ca7-b11c-4bd7-8c8c-239aeb932a43.jpg'
  ];

  // Function to get a random profile image
  const getRandomProfileImage = (userId) => {
    // Use user ID to ensure same user always gets same image
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % profileImages.length;
    return `/profile_image/${profileImages[index]}`;
  };

  // Function to save user data to Realtime Database
  const saveUserToDatabase = async (user, additionalData = {}) => {
    try {
      const userRef = ref(database, `users/${user.uid}`);
      
      // Check if user already exists
      const snapshot = await get(userRef);
      
      let profileImageUrl = user.photoURL;
      
      // If no profile image exists, assign a random one
      if (!profileImageUrl && !snapshot.exists()) {
        profileImageUrl = getRandomProfileImage(user.uid);
      } else if (snapshot.exists() && snapshot.val().profileImageUrl) {
        // Keep existing profile image
        profileImageUrl = snapshot.val().profileImageUrl;
      } else if (!profileImageUrl) {
        // Assign random image for existing users without one
        profileImageUrl = getRandomProfileImage(user.uid);
      }
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || null,
        profileImageUrl: profileImageUrl,
        emailVerified: user.emailVerified,
        lastLoginAt: serverTimestamp(),
        ...additionalData
      };

      if (!snapshot.exists()) {
        // New user - add creation timestamp
        userData.createdAt = serverTimestamp();
        console.log('Creating new user in database:', userData);
      } else {
        // Existing user - update login time and any new data
        console.log('Updating existing user in database:', userData);
      }

      await set(userRef, userData);
      console.log('User data saved to database successfully');
      return { success: true, profileImageUrl };
    } catch (error) {
      console.error('Error saving user to database:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Save user data to Realtime Database
      await saveUserToDatabase(result.user);
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName
        });
        
        // Update local user state with the new display name
        setUser({
          ...result.user,
          displayName: displayName
        });
      }
      
      // Save user data to Realtime Database
      await saveUserToDatabase(result.user, { displayName });
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    console.log('resetPassword function called with email:', email);
    try {
      console.log('Attempting to send password reset email...');
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to get user data from Realtime Database
  const getUserFromDatabase = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return { success: true, userData: snapshot.val() };
      } else {
        return { success: false, error: 'User not found in database' };
      }
    } catch (error) {
      console.error('Error getting user from database:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to get user's profile image URL
  const getUserProfileImage = async (uid) => {
    try {
      const result = await getUserFromDatabase(uid);
      if (result.success && result.userData.profileImageUrl) {
        return result.userData.profileImageUrl;
      } else {
        // Return a random profile image if none exists
        return getRandomProfileImage(uid);
      }
    } catch (error) {
      console.error('Error getting user profile image:', error);
      return getRandomProfileImage(uid);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    saveUserToDatabase,
    getUserFromDatabase,
    getUserProfileImage,
    getRandomProfileImage
  };

  // Debug: Log what's being provided
  console.log('AuthContext providing:', {
    user: !!user,
    loading,
    login: !!login,
    register: !!register,
    logout: !!logout,
    resetPassword: !!resetPassword
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
