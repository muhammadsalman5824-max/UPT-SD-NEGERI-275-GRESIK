import React, { useState, useEffect } from 'react';
import {
  User,
  TeacherAsset,
  Extracurricular,
  StudentInterest,
  MentoringLog,
  Achievement,
  EvaluationFeedback,
  FeedbackSummary,
  ModaPembelajaran,
} from './types';
import { api } from './api/client';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TeacherAssetsModule } from './components/TeacherAssetsModule';
import { ExtracurricularModule } from './components/ExtracurricularModule';
import { MentoringLogsModule } from './components/MentoringLogsModule';
import { AchievementsModule } from './components/AchievementsModule';
import { FeedbackModule } from './components/FeedbackModule';
import { StudentEntryModule } from './components/StudentEntryModule';
import { LoginModal } from './components/LoginModal';
import { SchoolLogo } from './components/SchoolLogo';
import {
  School,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
  Users,
  MessageSquareHeart,
  LogIn,
  RefreshCw,
  HeartHandshake,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data states
  const [teacherAssets, setTeacherAssets] = useState<TeacherAsset[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
  const [studentInterests, setStudentInterests] = useState<StudentInterest[]>([]);
  const [mentoringLogs, setMentoringLogs] = useState<MentoringLog[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [feedbackList, setFeedbackList] = useState<EvaluationFeedback[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary>({
    total_responden: 0,
    rerata_kepuasan: 5.0,
    distribusi_peran: { murid: 0, orang_tua: 0, guru: 0 },
    aspek_tertinggi: 'Kualitas Pembimbingan Guru',
    daftar_masukan: [],
  });

  // Fetch initial data
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [users, assets, extras, interests, logs, achs, fbs, fbSum] = await Promise.all([
        api.getUsers(),
        api.getTeacherAssets(),
        api.getExtracurriculars(),
        api.getStudentInterests(),
        api.getMentoringLogs(),
        api.getAchievements(),
        api.getFeedback(),
        api.getFeedbackSummary(),
      ]);

      setAvailableUsers(users);
      setTeacherAssets(assets);
      setExtracurriculars(extras);
      setStudentInterests(interests);
      setMentoringLogs(logs);
      setAchievements(achs);
      setFeedbackList(fbs);
      setFeedbackSummary(fbSum);

      // Default active user to Kepala Sekolah if not set
      if (!currentUser && users.length > 0) {
        setCurrentUser(users[0]);
      }
    } catch (err) {
      console.error('Failed to load SI-PASTI data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogin = async (username: string, password?: string) => {
    const res = await api.login(username, password);
    setCurrentUser(res.user);
    loadAllData();
  };

  const handleSaveTeacherAsset = async (data: {
    user_id: number;
    latar_belakang_pendidikan: string;
    keahlian_khusus: string;
    komitmen_empati?: string;
    bidang_sertifikasi?: string;
    rekomendasi_ekstra?: string;
  }) => {
    await api.saveTeacherAsset(data);
    const updated = await api.getTeacherAssets();
    setTeacherAssets(updated);
  };

  const handleConfirmTeacherAsset = async (
    id: number,
    data: {
      catatan_konfirmasi_ks: string;
      status_konfirmasi: boolean;
      komitmen_empati?: string;
      rekomendasi_ekstra?: string;
    }
  ) => {
    await api.confirmTeacherAsset(id, data);
    const updated = await api.getTeacherAssets();
    setTeacherAssets(updated);
  };

  const handleUpdateTeacherAsset = async (
    id: number,
    data: {
      latar_belakang_pendidikan?: string;
      keahlian_khusus?: string;
      komitmen_empati?: string;
      bidang_sertifikasi?: string;
      rekomendasi_ekstra?: string;
      catatan_konfirmasi_ks?: string;
      status_konfirmasi?: boolean;
    }
  ) => {
    await api.updateTeacherAsset(id, data);
    const updated = await api.getTeacherAssets();
    setTeacherAssets(updated);
  };

  const handleUpdateUser = async (id: number, data: Partial<User> & { password?: string }) => {
    const updatedUser = await api.updateUser(id, data);
    const [users, assets, extras] = await Promise.all([
      api.getUsers(),
      api.getTeacherAssets(),
      api.getExtracurriculars(),
    ]);
    setAvailableUsers(users);
    setTeacherAssets(assets);
    setExtracurriculars(extras);
    if (currentUser && currentUser.id === id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleCreateUser = async (data: {
    nama: string;
    username: string;
    nip_nisn?: string;
    role?: 'kepala_sekolah' | 'guru' | 'murid' | 'orang_tua';
    nomor_wa?: string;
    jabatan?: string;
    email?: string;
    password?: string;
    kelas?: string;
    jenis_kelamin?: 'L' | 'P';
    tanggal_lahir?: string;
    tempat_lahir?: string;
    alamat?: string;
    nama_ortu?: string;
    wa_ortu?: string;
    minat_utama?: string;
    catatan_bakat?: string;
    tahun_masuk?: number;
  }) => {
    const res = await api.createUser(data);
    const [users, assets] = await Promise.all([
      api.getUsers(),
      api.getTeacherAssets(),
    ]);
    setAvailableUsers(users);
    setTeacherAssets(assets);
    return res;
  };

  const handleDeleteUser = async (id: number) => {
    await api.deleteUser(id);
    const [users, assets, extras] = await Promise.all([
      api.getUsers(),
      api.getTeacherAssets(),
      api.getExtracurriculars(),
    ]);
    setAvailableUsers(users);
    setTeacherAssets(assets);
    setExtracurriculars(extras);
    if (currentUser && currentUser.id === id && users.length > 0) {
      setCurrentUser(users[0]);
    }
  };

  const handleRegisterInterest = async (data: {
    murid_id: number;
    ekstra_id: number;
    persetujuan_ortu?: boolean;
    catatan_ortu?: string;
  }) => {
    await api.registerStudentInterest(data);
    const [updatedInterests, updatedExtras] = await Promise.all([
      api.getStudentInterests(),
      api.getExtracurriculars(),
    ]);
    setStudentInterests(updatedInterests);
    setExtracurriculars(updatedExtras);
  };

  const handleUpdateConsent = async (
    id: number,
    data: { persetujuan_ortu: boolean; catatan_ortu?: string }
  ) => {
    await api.updateParentConsent(id, data);
    const updated = await api.getStudentInterests();
    setStudentInterests(updated);
  };

  const handleUpdateExtracurricular = async (
    id: number,
    data: {
      nama_ekstra?: string;
      pembina_id?: number;
      kategori?: 'akademik' | 'non_akademik';
      deskripsi?: string;
      jadwal?: string;
      ruang?: string;
      biaya_efisiensi?: number;
      kuota?: number;
    }
  ) => {
    await api.updateExtracurricular(id, data);
    const [updatedExtras, updatedInterests] = await Promise.all([
      api.getExtracurriculars(),
      api.getStudentInterests(),
    ]);
    setExtracurriculars(updatedExtras);
    setStudentInterests(updatedInterests);
  };

  const handleDeleteExtracurricular = async (id: number) => {
    await api.deleteExtracurricular(id);
    const [updatedExtras, updatedInterests] = await Promise.all([
      api.getExtracurriculars(),
      api.getStudentInterests(),
    ]);
    setExtracurriculars(updatedExtras);
    setStudentInterests(updatedInterests);
  };

  const handleUpdateStudentInterest = async (
    id: number,
    data: { ekstra_id?: number; catatan_ortu?: string; persetujuan_ortu?: boolean }
  ) => {
    await api.updateStudentInterest(id, data);
    const [updatedInterests, updatedExtras] = await Promise.all([
      api.getStudentInterests(),
      api.getExtracurriculars(),
    ]);
    setStudentInterests(updatedInterests);
    setExtracurriculars(updatedExtras);
  };

  const handleDeleteStudentInterest = async (id: number) => {
    await api.deleteStudentInterest(id);
    const [updatedInterests, updatedExtras] = await Promise.all([
      api.getStudentInterests(),
      api.getExtracurriculars(),
    ]);
    setStudentInterests(updatedInterests);
    setExtracurriculars(updatedExtras);
  };

  const handleCreateMentoringLog = async (data: {
    ekstra_id: number;
    pembina_id: number;
    murid_id: number;
    tanggal: string;
    moda_pembelajaran: ModaPembelajaran;
    catatan_kegiatan: string;
    indikator_capaian?: string;
  }) => {
    await api.createMentoringLog(data);
    const updated = await api.getMentoringLogs();
    setMentoringLogs(updated);
  };

  const handleSuperviseLog = async (id: number, catatan_supervisi_ks: string) => {
    await api.superviseMentoringLog(id, catatan_supervisi_ks);
    const updated = await api.getMentoringLogs();
    setMentoringLogs(updated);
  };

  const handleCreateAchievement = async (data: {
    ekstra_id: number;
    murid_id: number;
    nama_lomba: string;
    tingkat: 'sekolah' | 'kecamatan' | 'kabupaten';
    capaian: string;
    tanggal_kegiatan: string;
    penyelenggara?: string;
    keterangan?: string;
  }) => {
    await api.createAchievement(data);
    const updated = await api.getAchievements();
    setAchievements(updated);
  };

  const handleUpdateAchievement = async (
    id: number,
    data: {
      ekstra_id?: number;
      murid_id?: number;
      nama_lomba?: string;
      tingkat?: 'sekolah' | 'kecamatan' | 'kabupaten';
      capaian?: string;
      tanggal_kegiatan?: string;
      penyelenggara?: string;
      keterangan?: string;
    }
  ) => {
    await api.updateAchievement(id, data);
    const updated = await api.getAchievements();
    setAchievements(updated);
  };

  const handleDeleteAchievement = async (id: number) => {
    await api.deleteAchievement(id);
    const updated = await api.getAchievements();
    setAchievements(updated);
  };

  const handleSubmitFeedback = async (data: {
    user_id: number;
    peran: 'murid' | 'orang_tua' | 'guru';
    isi_umpan_balik: string;
    rating?: number;
    aspek_evaluasi?: string;
  }) => {
    await api.submitFeedback(data);
    const [updatedList, updatedSum] = await Promise.all([
      api.getFeedback(),
      api.getFeedbackSummary(),
    ]);
    setFeedbackList(updatedList);
    setFeedbackSummary(updatedSum);
  };

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <SchoolLogo size="xl" className="mx-auto mb-4 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-800">Memuat Aplikasi SI-PASTI...</h2>
          <p className="text-xs text-slate-500 mt-1">UPT SD Negeri 275 Gresik</p>
        </div>
      </div>
    );
  }

  const activeUser = currentUser || availableUsers[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={activeUser}
        onSelectUser={handleSelectUser}
        availableUsers={availableUsers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            currentUser={activeUser}
            teacherAssets={teacherAssets}
            extracurriculars={extracurriculars}
            studentInterests={studentInterests}
            mentoringLogs={mentoringLogs}
            achievements={achievements}
            feedbackSummary={feedbackSummary}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'teacher-assets' && (
          <TeacherAssetsModule
            currentUser={activeUser}
            teacherAssets={teacherAssets}
            availableUsers={availableUsers}
            onSaveTeacherAsset={handleSaveTeacherAsset}
            onUpdateTeacherAsset={handleUpdateTeacherAsset}
            onConfirmTeacherAsset={handleConfirmTeacherAsset}
            onUpdateUser={handleUpdateUser}
            onCreateUser={handleCreateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {(activeTab === 'students' || activeTab === 'student-entry') && (
          <StudentEntryModule
            currentUser={activeUser}
            availableUsers={availableUsers}
            extracurriculars={extracurriculars}
            studentInterests={studentInterests}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onRegisterInterest={handleRegisterInterest}
          />
        )}

        {activeTab === 'extracurriculars' && (
          <ExtracurricularModule
            currentUser={activeUser}
            extracurriculars={extracurriculars}
            studentInterests={studentInterests}
            availableUsers={availableUsers}
            onNavigateToStudents={() => setActiveTab('students')}
            onRegisterInterest={handleRegisterInterest}
            onUpdateConsent={handleUpdateConsent}
            onUpdateExtracurricular={handleUpdateExtracurricular}
            onDeleteExtracurricular={handleDeleteExtracurricular}
            onUpdateStudentInterest={handleUpdateStudentInterest}
            onDeleteStudentInterest={handleDeleteStudentInterest}
          />
        )}

        {activeTab === 'mentoring-logs' && (
          <MentoringLogsModule
            currentUser={activeUser}
            mentoringLogs={mentoringLogs}
            extracurriculars={extracurriculars}
            studentInterests={studentInterests}
            onCreateLog={handleCreateMentoringLog}
            onSuperviseLog={handleSuperviseLog}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsModule
            currentUser={activeUser}
            achievements={achievements}
            extracurriculars={extracurriculars}
            studentInterests={studentInterests}
            onCreateAchievement={handleCreateAchievement}
            onUpdateAchievement={handleUpdateAchievement}
            onDeleteAchievement={handleDeleteAchievement}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackModule
            currentUser={activeUser}
            feedbackList={feedbackList}
            feedbackSummary={feedbackSummary}
            onSubmitFeedback={handleSubmitFeedback}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <SchoolLogo size="sm" />
            <div>
              <span className="font-bold text-slate-700">SI-PASTI</span> • Strategi Optimalisasi Aset Internal untuk Peningkatan Prestasi Murid
              <div className="text-[11px] text-slate-400">
                UPT SD Negeri 275 Gresik • Dinas Pendidikan Kabupaten Gresik
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowLoginModal(true)}
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ganti Akun / Login</span>
            </button>
            <button
              onClick={loadAllData}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              title="Perbarui data dari server"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Login & Demo Role Switcher Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        availableUsers={availableUsers}
        onSelectDemoUser={handleSelectUser}
      />
    </div>
  );
}
