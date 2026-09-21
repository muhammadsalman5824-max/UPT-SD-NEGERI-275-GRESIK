import React, { useState } from 'react';
import { School, Sparkles, KeyRound, UserCheck, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import { User } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password?: string) => Promise<void>;
  availableUsers: User[];
  onSelectDemoUser: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  availableUsers,
  onSelectDemoUser,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Silakan isi username.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      await onLogin(username.trim(), password);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'kepala_sekolah',
      title: 'Kepala Sekolah (Evaluator)',
      name: 'Drs. H. Sukardi, M.Pd',
      username: 'kasek',
      icon: ShieldCheck,
      color: 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950',
    },
    {
      role: 'guru',
      title: 'Guru Pembina Sains',
      name: 'Nur Aini, S.Pd',
      username: 'guru_nuraini',
      icon: UserCheck,
      color: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950',
    },
    {
      role: 'murid',
      title: 'Murid Berbakat (5A)',
      name: 'Budi Pratama',
      username: 'murid_budi',
      icon: GraduationCap,
      color: 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-950',
    },
    {
      role: 'orang_tua',
      title: 'Wali Murid Budi',
      name: 'Bpk. Agus Pratama',
      username: 'ortu_budi',
      icon: Users,
      color: 'border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-950',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
        <div className="text-center mb-6">
          <SchoolLogo size="xl" className="mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-slate-900">Masuk ke SI-PASTI</h2>
          <p className="text-xs text-slate-500 mt-1">
            UPT SD Negeri 275 Gresik • Multi-Role Access Control
          </p>
        </div>

        {/* 1-Click Demo Login Shortcuts */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Pilih Akses Cepat Simulasi 4 Peran (1-Klik)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((demo) => {
              const Icon = demo.icon;
              const targetUser = availableUsers.find((u) => u.username === demo.username);
              return (
                <button
                  key={demo.username}
                  onClick={() => {
                    if (targetUser) {
                      onSelectDemoUser(targetUser);
                      onClose();
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${demo.color}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {demo.title}
                    </span>
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                  </div>
                  <div className="font-bold text-xs truncate">{demo.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">atau masuk manual</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Manual form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Username Akun</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: kasek, guru_nuraini, murid_budi"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">Default demo: password123</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {isLoading ? 'Memproses...' : 'Masuk Aplikasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
