import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (mode: 'signin' | 'signup', email: string, password: string) => void;
  translations: {
    signIn: string;
    signUp: string;
    createAccount: string;
    email: string;
    password: string;
    haveAccount: string;
    noAccount: string;
  };
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuth, translations: t }) => {
  const [isAuthMode, setIsAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onAuth(isAuthMode, email, password);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light">
            {isAuthMode === 'signin' ? t.signIn : t.createAccount}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
            required
          />
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition-colors"
          >
            {isAuthMode === 'signin' ? t.signIn : t.signUp}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          {isAuthMode === 'signin' ? t.noAccount : t.haveAccount}{' '}
          <button
            onClick={() => setIsAuthMode(isAuthMode === 'signin' ? 'signup' : 'signin')}
            className="text-black hover:underline"
          >
            {isAuthMode === 'signin' ? t.signUp : t.signIn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;