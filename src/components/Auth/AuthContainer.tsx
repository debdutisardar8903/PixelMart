'use client';

import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

type AuthView = 'login' | 'register' | 'forgot-password';

export default function AuthContainer() {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const { loading } = useAuthRedirect();

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center overflow-hidden relative">
        {/* Geometric Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-pink-100 to-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex items-center justify-center px-6 overflow-hidden relative">
      {/* Geometric Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-pink-100 to-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Additional geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-300 rounded-full opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-purple-300 rounded-full opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-yellow-300 rounded-full opacity-30"></div>
        
        {/* Geometric lines */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-30"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-30"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {currentView === 'login' && (
          <Login
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        )}
        
        {currentView === 'register' && (
          <Register
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}
        
        {currentView === 'forgot-password' && (
          <ForgotPassword
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}
      </div>
    </div>
  );
}
