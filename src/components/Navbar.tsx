import React, { useState } from 'react';
import {
  School,
  UserCheck,
  Award,
  BookOpen,
  Users,
  MessageSquareHeart,
  ChevronDown,
  LogOut,
  Sparkles,
  Menu,
  X,
  Compass,
  GraduationCap,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface NavbarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  availableUsers: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  availableUsers,
  activeTab,
  setActiveTab,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'kepala_sekolah':
        return {
          label: 'Kepala Sekolah (Akses Penuh)',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'guru':
        return {
          label: 'Guru Pendidik (Akses Penuh)',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'murid':
        return {
          label: 'Murid (Lihat & Isi Survei)',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'orang_tua':
        return {
          label: 'Wali Murid (Orang Tua)',
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
        };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dasbor Utama', icon: Compass },
    { id: 'teacher-assets', label: 'Pemetaan Aset Guru', icon: UserCheck },
    { id: 'students', label: 'Data & Entry Siswa', icon: GraduationCap },
    { id: 'extracurriculars', label: 'Ekstrakurikuler & Minat', icon: Users },
    { id: 'mentoring-logs', label: 'Jurnal Deep Learning', icon: BookOpen },
    { id: 'achievements', label: 'Rekap Prestasi', icon: Award },
    { id: 'feedback', label: 'Survei Umpan Balik', icon: MessageSquareHeart },
  ];

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner: School identity & Role quick-switcher */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-sky-900 text-white px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <SchoolLogo size="sm" className="drop-shadow-xs" />
            <div>
              <div className="font-bold tracking-wide uppercase flex items-center gap-1.5 text-emerald-100">
                <span>UPT SD NEGERI 275 GRESIK</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-medium">
                  KAB. GRESIK
                </span>
              </div>
              <p className="text-slate-300 text-[11px] hidden sm:block">
                Inovasi SI-PASTI • Strategi Optimalisasi Aset Internal untuk Prestasi Murid
              </p>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-2 relative">
            <span className="text-slate-300 text-[11px] hidden md:inline">Simulasi Akses Peran:</span>
            <div className="relative">
              <button
                id="role-switcher-btn"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition cursor-pointer"
                title="Ganti Peran Pengguna untuk Menguji Seluruh Fungsionalitas"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold">{currentUser.nama}</span>
                <span className="text-[11px] opacity-80">({currentUser.role.replace('_', ' ')})</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Pilih Akun Simulasi Pengguna
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {availableUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      const badge = getRoleBadge(u.role);
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSelectUser(u);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex flex-col gap-0.5 transition ${
                            isSelected ? 'bg-emerald-50/80 font-semibold' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-900 font-medium">{u.nama}</span>
                            {isSelected && <span className="text-emerald-700 text-[10px]">● Aktif</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded border font-normal ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                            {u.kelas && <span className="text-[10px] text-slate-500">{u.kelas}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <SchoolLogo size="md" className="group-hover:scale-105 transition-transform" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                    SI-PASTI
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    v2.5
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none">
                  Aset Internal & Prestasi Murid
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Current User Pill & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-right">
              <div>
                <div className="text-xs font-bold text-slate-800">{currentUser.nama}</div>
                <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Buka Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 px-3 mb-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="font-semibold text-slate-800">{currentUser.nama}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">{roleInfo.label}</div>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
