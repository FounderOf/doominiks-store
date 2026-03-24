import { useState } from 'react';
import { X, User, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi');
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Password tidak cocok');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password minimal 6 karakter');
        setLoading(false);
        return;
      }
      if (username.length < 3) {
        setError('Username minimal 3 karakter');
        setLoading(false);
        return;
      }
    }

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));

    if (mode === 'login') {
      const success = login(username, password);
      if (!success) {
        setError('Username atau password salah');
        setLoading(false);
        return;
      }
    } else {
      const success = register(username, password);
      if (!success) {
        setError('Username sudah digunakan');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-900/50 w-full max-w-md overflow-hidden shadow-2xl shadow-red-500/10">
        {/* Decorative glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-2xl blur -z-10" />
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-red-900/20 to-orange-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Selamat Datang!' : 'Buat Akun Baru'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {mode === 'login' ? 'Masuk ke akun Anda' : 'Daftar untuk mulai belanja'}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                {mode === 'login' ? 'Masuk' : 'Daftar'}
              </>
            )}
          </button>

          <div className="text-center">
            <span className="text-gray-400 text-sm">
              {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            </span>
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
            </button>
          </div>

          {mode === 'register' && (
            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-xs text-center">
                Dengan mendaftar, Anda mendapatkan bonus <span className="text-yellow-400">100 Coins</span> gratis!
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
