import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Filter,
  Wallet,
  MessageSquare,
  AlertCircle,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  UserPlus,
  Info,
} from 'lucide-react';
import { User, Extracurricular, StudentInterest } from '../types';

interface ExtracurricularModuleProps {
  currentUser: User;
  extracurriculars: Extracurricular[];
  studentInterests: StudentInterest[];
  availableUsers?: User[];
  onNavigateToStudents?: () => void;
  onRegisterInterest: (data: {
    murid_id: number;
    ekstra_id: number;
    persetujuan_ortu?: boolean;
    catatan_ortu?: string;
  }) => Promise<void>;
  onUpdateConsent: (
    id: number,
    data: { persetujuan_ortu: boolean; catatan_ortu?: string }
  ) => Promise<void>;
  onUpdateExtracurricular?: (
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
  ) => Promise<void>;
  onDeleteExtracurricular?: (id: number) => Promise<void>;
  onUpdateStudentInterest?: (
    id: number,
    data: { ekstra_id?: number; catatan_ortu?: string; persetujuan_ortu?: boolean }
  ) => Promise<void>;
  onDeleteStudentInterest?: (id: number) => Promise<void>;
}

export const ExtracurricularModule: React.FC<ExtracurricularModuleProps> = ({
  currentUser,
  extracurriculars,
  studentInterests,
  availableUsers = [],
  onNavigateToStudents,
  onRegisterInterest,
  onUpdateConsent,
  onUpdateExtracurricular,
  onDeleteExtracurricular,
  onUpdateStudentInterest,
  onDeleteStudentInterest,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'akademik' | 'non_akademik'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [registeringEkstra, setRegisteringEkstra] = useState<Extracurricular | null>(null);
  const [selectedMuridId, setSelectedMuridId] = useState<number>(
    currentUser.role === 'murid' ? currentUser.id : 6
  );
  const [registerConsent, setRegisterConsent] = useState<boolean>(true);
  const [catatanDaftar, setCatatanDaftar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Extract registered students from availableUsers
  const students = useMemo(() => {
    return availableUsers.filter((u) => u.role === 'murid');
  }, [availableUsers]);

  // Selected student object for preview
  const selectedStudent = useMemo(() => {
    const targetId = currentUser.role === 'murid' ? currentUser.id : selectedMuridId;
    return students.find((s) => s.id === targetId) || null;
  }, [students, currentUser, selectedMuridId]);

  // State for Editing Extracurricular
  const [editingEkstra, setEditingEkstra] = useState<Extracurricular | null>(null);
  const [editNamaEkstra, setEditNamaEkstra] = useState('');
  const [editKategori, setEditKategori] = useState<'akademik' | 'non_akademik'>('akademik');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editJadwal, setEditJadwal] = useState('');
  const [editRuang, setEditRuang] = useState('');
  const [editBiayaEfisiensi, setEditBiayaEfisiensi] = useState<number>(0);
  const [editKuota, setEditKuota] = useState<number>(25);
  const [isUpdatingEkstra, setIsUpdatingEkstra] = useState(false);

  // State for Editing Student Interest
  const [editingInterest, setEditingInterest] = useState<StudentInterest | null>(null);
  const [editInterestEkstraId, setEditInterestEkstraId] = useState<number>(0);
  const [editInterestCatatan, setEditInterestCatatan] = useState('');
  const [editInterestConsent, setEditInterestConsent] = useState(false);
  const [isUpdatingInterest, setIsUpdatingInterest] = useState(false);

  // Filter extracurriculars
  const filteredEkstra = extracurriculars.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.kategori === activeCategory;
    const matchesSearch =
      item.nama_ekstra.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pembina_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter student interests based on role
  const relevantInterests = studentInterests.filter((si) => {
    if (currentUser.role === 'murid') {
      return si.murid_id === currentUser.id;
    }
    if (currentUser.role === 'orang_tua' && currentUser.anak_id) {
      return si.murid_id === currentUser.anak_id;
    }
    return true;
  });

  const openRegisterEkstraModal = (ekstra: Extracurricular) => {
    setRegisteringEkstra(ekstra);
    if (currentUser.role === 'murid') {
      setSelectedMuridId(currentUser.id);
      setRegisterConsent(false);
    } else if (currentUser.role === 'orang_tua' && currentUser.anak_id) {
      setSelectedMuridId(currentUser.anak_id);
      setRegisterConsent(true);
    } else {
      const availableStudent = students.find((s) =>
        !studentInterests.some((si) => si.murid_id === s.id && si.ekstra_id === ekstra.id)
      );
      setSelectedMuridId(availableStudent ? availableStudent.id : students[0]?.id || 6);
      setRegisterConsent(true);
    }
    setCatatanDaftar('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEkstra) return;

    try {
      setIsSubmitting(true);
      await onRegisterInterest({
        murid_id: currentUser.role === 'murid' ? currentUser.id : selectedMuridId,
        ekstra_id: registeringEkstra.id,
        persetujuan_ortu: currentUser.role === 'murid' ? false : registerConsent,
        catatan_ortu: catatanDaftar,
      });

      setFeedbackMsg(`Berhasil mendaftarkan siswa ke ekstrakurikuler ${registeringEkstra.nama_ekstra}!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
      setRegisteringEkstra(null);
      setCatatanDaftar('');
    } catch (err: any) {
      alert(err.message || 'Gagal mendaftar minat ekstrakurikuler.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleConsent = async (interest: StudentInterest, newConsentStatus: boolean) => {
    try {
      await onUpdateConsent(interest.id, {
        persetujuan_ortu: newConsentStatus,
        catatan_ortu: interest.catatan_ortu,
      });
      setFeedbackMsg(`Status persetujuan untuk ${interest.murid_nama} berhasil diperbarui.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui persetujuan.');
    }
  };

  // Trigger Open Edit Ekstrakurikuler
  const openEditEkstraModal = (ekstra: Extracurricular) => {
    setEditingEkstra(ekstra);
    setEditNamaEkstra(ekstra.nama_ekstra);
    setEditKategori(ekstra.kategori);
    setEditDeskripsi(ekstra.deskripsi);
    setEditJadwal(ekstra.jadwal || '');
    setEditRuang(ekstra.ruang || '');
    setEditBiayaEfisiensi(ekstra.biaya_efisiensi || 0);
    setEditKuota(ekstra.kuota || 25);
  };

  const handleUpdateEkstraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEkstra || !onUpdateExtracurricular) return;

    try {
      setIsUpdatingEkstra(true);
      await onUpdateExtracurricular(editingEkstra.id, {
        nama_ekstra: editNamaEkstra,
        kategori: editKategori,
        deskripsi: editDeskripsi,
        jadwal: editJadwal,
        ruang: editRuang,
        biaya_efisiensi: Number(editBiayaEfisiensi),
        kuota: Number(editKuota),
      });
      setFeedbackMsg(`Ekstrakurikuler ${editNamaEkstra} berhasil diperbarui.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
      setEditingEkstra(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui data ekstrakurikuler.');
    } finally {
      setIsUpdatingEkstra(false);
    }
  };

  const handleDeleteEkstra = async (ekstra: Extracurricular) => {
    if (!onDeleteExtracurricular) return;
    const confirm = window.confirm(`Yakin ingin menghapus ekstrakurikuler "${ekstra.nama_ekstra}"?`);
    if (!confirm) return;

    try {
      await onDeleteExtracurricular(ekstra.id);
      setFeedbackMsg(`Ekstrakurikuler ${ekstra.nama_ekstra} berhasil dihapus.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus ekstrakurikuler.');
    }
  };

  // Trigger Open Edit Student Interest
  const openEditInterestModal = (interest: StudentInterest) => {
    setEditingInterest(interest);
    setEditInterestEkstraId(interest.ekstra_id);
    setEditInterestCatatan(interest.catatan_ortu || '');
    setEditInterestConsent(interest.persetujuan_ortu);
  };

  const handleUpdateInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterest || !onUpdateStudentInterest) return;

    try {
      setIsUpdatingInterest(true);
      await onUpdateStudentInterest(editingInterest.id, {
        ekstra_id: Number(editInterestEkstraId),
        catatan_ortu: editInterestCatatan,
        persetujuan_ortu: editInterestConsent,
      });
      setFeedbackMsg(`Data pendaftaran minat ${editingInterest.murid_nama} berhasil diperbarui.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
      setEditingInterest(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui pendaftaran minat.');
    } finally {
      setIsUpdatingInterest(false);
    }
  };

  const handleDeleteInterest = async (interest: StudentInterest) => {
    if (!onDeleteStudentInterest) return;
    const confirm = window.confirm(`Batalkan pendaftaran minat untuk "${interest.murid_nama}" di ${interest.ekstra_nama}?`);
    if (!confirm) return;

    try {
      await onDeleteStudentInterest(interest.id);
      setFeedbackMsg(`Pendaftaran minat berhasil dibatalkan.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan pendaftaran minat.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pemberdayaan Minat & Bakat Murid</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Katalog Ekstrakurikuler & Pendaftaran Minat
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Seluruh program dibina langsung oleh guru bertalenta internal UPT SD Negeri 275 Gresik
              tanpa pungutan biaya pembina eksternal, mengoptimalkan aset sekolah secara mandiri dan inklusif.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              Role Aktif: <strong className="text-emerald-800 uppercase">{currentUser.role.replace('_', ' ')}</strong>
            </span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {currentUser.role === 'murid' && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50/95 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Mode Peninjau Siswa: Anda dapat melihat seluruh katalog ekstrakurikuler, jadwal pembimbingan, ruang, nama guru pembina, dan daftar siswa terdaftar. Pendaftaran dan pengeditan data ekstrakurikuler dikelola oleh Dewan Guru dan Kepala Sekolah.
            </span>
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Bidang
          </button>
          <button
            onClick={() => setActiveCategory('akademik')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === 'akademik'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Akademik / Sains
          </button>
          <button
            onClick={() => setActiveCategory('non_akademik')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === 'non_akademik'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Seni, Budaya & Olahraga
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ekstrakurikuler atau pembina..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Parental Consent Notice for Orang Tua */}
      {currentUser.role === 'orang_tua' && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-purple-950">
                Panel Persetujuan Wali Murid (Parental Consent)
              </h2>
              <p className="text-xs text-purple-800 mt-0.5">
                Sebagai orang tua, persetujuan Anda sangat penting untuk mendukung keselamatan, kenyamanan,
                dan pemantauan minat bakat ananda tercinta di SDN 275 Gresik.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEkstra.map((ekstra) => {
          // Check if current student is already registered
          const isAlreadyRegistered = studentInterests.some(
            (si) =>
              si.ekstra_id === ekstra.id &&
              (currentUser.role === 'murid'
                ? si.murid_id === currentUser.id
                : currentUser.anak_id
                ? si.murid_id === currentUser.anak_id
                : false)
          );

          const formattedEfficiency = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(ekstra.biaya_efisiensi || 0);

          const isManager = currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru';
          const canEditEkstra = isManager;

          return (
            <div
              key={ekstra.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 transition shadow-xs flex flex-col justify-between group"
            >
              <div>
                {/* Badges & Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ekstra.kategori === 'akademik'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {ekstra.kategori}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{ekstra.jumlah_peserta} / {ekstra.kuota || 25} Kuota</span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition mb-2">
                    {ekstra.nama_ekstra}
                  </h3>
                  {canEditEkstra && (
                    <button
                      onClick={() => openEditEkstraModal(ekstra)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition"
                      title="Edit Data Ekstrakurikuler"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {ekstra.deskripsi}
                </p>

                {/* Logistics */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      Pembina: <strong>{ekstra.pembina_nama}</strong>
                    </span>
                  </div>
                  {ekstra.jadwal && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ekstra.jadwal}</span>
                    </div>
                  )}
                  {ekstra.ruang && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ekstra.ruang}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 text-[11px] font-semibold mt-2">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Efisiensi Anggaran: {formattedEfficiency}/bln</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {currentUser.role === 'murid' ? (
                  isAlreadyRegistered ? (
                    <div className="flex-1 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Anda Terdaftar di Klub Ini</span>
                    </div>
                  ) : (
                    <div className="flex-1 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <span>Terbuka Untuk Siswa</span>
                    </div>
                  )
                ) : isAlreadyRegistered && currentUser.role === 'orang_tua' ? (
                  <div className="flex-1 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Anak Terdaftar</span>
                  </div>
                ) : (
                  <button
                    id={`btn-register-ekstra-${ekstra.id}`}
                    onClick={() => openRegisterEkstraModal(ekstra)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{currentUser.role === 'orang_tua' ? 'Daftarkan Anak' : 'Daftarkan Siswa'}</span>
                  </button>
                )}

                {canEditEkstra && (
                  <button
                    onClick={() => openEditEkstraModal(ekstra)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Edit Ekstrakurikuler"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Edit Ekstrakurikuler */}
      {editingEkstra && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit className="w-5 h-5 text-emerald-700" />
                  <span>Edit Data Ekstrakurikuler</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui nama, jadwal, kuota, atau efisiensi anggaran ekstrakurikuler.
                </p>
              </div>
              <button
                onClick={() => setEditingEkstra(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEkstraSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Ekstrakurikuler <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editNamaEkstra}
                  onChange={(e) => setEditNamaEkstra(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editKategori}
                    onChange={(e) => setEditKategori(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="akademik">Akademik / Sains</option>
                    <option value="non_akademik">Non-Akademik / Seni & Olahraga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kuota Murid</label>
                  <input
                    type="number"
                    value={editKuota}
                    onChange={(e) => setEditKuota(Number(e.target.value))}
                    min={5}
                    max={100}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Program</label>
                <textarea
                  value={editDeskripsi}
                  onChange={(e) => setEditDeskripsi(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jadwal Latihan</label>
                  <input
                    type="text"
                    value={editJadwal}
                    onChange={(e) => setEditJadwal(e.target.value)}
                    placeholder="Contoh: Kamis, 14.30 - 16.00 WIB"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ruangan / Tempat</label>
                  <input
                    type="text"
                    value={editRuang}
                    onChange={(e) => setEditRuang(e.target.value)}
                    placeholder="Contoh: Lab IPA & Komputer"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimasi Efisiensi Anggaran (Rp/bulan)
                </label>
                <input
                  type="number"
                  value={editBiayaEfisiensi}
                  onChange={(e) => setEditBiayaEfisiensi(Number(e.target.value))}
                  step={50000}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div>
                  {(currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteEkstra(editingEkstra);
                        setEditingEkstra(null);
                      }}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEkstra(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingEkstra}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isUpdatingEkstra ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pendaftaran Minat Baru */}
      {registeringEkstra && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pendaftaran Minat Ekstrakurikuler</h3>
                <p className="text-xs text-slate-500">
                  Klub: <strong>{registeringEkstra.nama_ekstra}</strong>
                </p>
              </div>
              <button
                onClick={() => setRegisteringEkstra(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div>
                  <strong>Pembina:</strong> {registeringEkstra.pembina_nama}
                </div>
                <div>
                  <strong>Jadwal:</strong> {registeringEkstra.jadwal}
                </div>
                <div>
                  <strong>Lokasi:</strong> {registeringEkstra.ruang}
                </div>
              </div>

              {/* Pilihan / Tarik Data Siswa */}
              {currentUser.role === 'murid' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Murid Pendaftar
                  </label>
                  <div className="w-full text-xs px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-900 font-semibold flex items-center justify-between">
                    <span>{currentUser.nama} ({currentUser.kelas || 'Siswa SDN 275'})</span>
                    <span className="text-[11px] text-slate-500 font-normal">NISN: {currentUser.nip_nisn}</span>
                  </div>
                </div>
              ) : currentUser.role === 'orang_tua' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data Murid (Putra / Putri Anda)
                  </label>
                  <div className="w-full text-xs px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-900 font-semibold flex items-center justify-between">
                    <span>{selectedStudent?.nama || 'Siswa Asuhan'} ({selectedStudent?.kelas || 'Kelas 5A'})</span>
                    <span className="text-[11px] text-slate-500 font-normal">NISN: {selectedStudent?.nip_nisn || '-'}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Tarik Data Siswa Terdaftar <span className="text-rose-500">*</span>
                    </label>
                    {onNavigateToStudents && (
                      <button
                        type="button"
                        onClick={() => {
                          setRegisteringEkstra(null);
                          onNavigateToStudents();
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Entry Siswa Baru</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedMuridId}
                    onChange={(e) => setSelectedMuridId(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800"
                  >
                    {students.length === 0 ? (
                      <option value={0} disabled>Belum ada data siswa. Silakan tambahkan di Tab Data Siswa.</option>
                    ) : (
                      students.map((st) => {
                        const isAlreadyIn = studentInterests.some(
                          (si) => si.murid_id === st.id && si.ekstra_id === registeringEkstra.id
                        );
                        return (
                          <option key={st.id} value={st.id} disabled={isAlreadyIn}>
                            {st.nama} ({st.kelas || 'SDN 275'}) - NISN: {st.nip_nisn || '-'}
                            {isAlreadyIn ? ' [SUDAH TERDAFTAR]' : ''}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              )}

              {/* Ringkasan Data Siswa yang Ditarik */}
              {selectedStudent && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Identitas Siswa Terpilih</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {selectedStudent.kelas || 'Rombel SDN 275'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400">NISN:</span>{' '}
                      <strong className="text-slate-700">{selectedStudent.nip_nisn || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Gender:</span>{' '}
                      <strong className="text-slate-700">{selectedStudent.jenis_kelamin === 'L' ? 'Laki-laki' : selectedStudent.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Wali:</span>{' '}
                      <strong className="text-slate-700">{selectedStudent.nama_ortu || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Kontak WA:</span>{' '}
                      <strong className="text-slate-700">{selectedStudent.wa_ortu || selectedStudent.nomor_wa || '-'}</strong>
                    </div>
                  </div>
                  {selectedStudent.minat_utama && (
                    <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">Minat Awal:</span>{' '}
                      <span className="text-emerald-700 font-semibold">{selectedStudent.minat_utama}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Checkbox Persetujuan Orang Tua jika Guru / Kepala Sekolah mendaftarkan */}
              {currentUser.role !== 'murid' && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-register-consent"
                    checked={registerConsent}
                    onChange={(e) => setRegisterConsent(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="chk-register-consent" className="text-xs text-amber-900 font-medium cursor-pointer">
                    Sudah dikonfirmasi dan disetujui orang tua / wali murid
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Motivasi Pilihan Minat (Opsional)
                </label>
                <textarea
                  value={catatanDaftar}
                  onChange={(e) => setCatatanDaftar(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Ingin memperdalam eksperimen sains dan bercita-cita ikut lomba OSN..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegisteringEkstra(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Kirim Pendaftaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pendaftaran Minat Murid */}
      {editingInterest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit className="w-5 h-5 text-emerald-700" />
                  <span>Edit Data Pendaftaran Minat</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Murid: <strong>{editingInterest.murid_nama}</strong> ({editingInterest.kelas})
                </p>
              </div>
              <button
                onClick={() => setEditingInterest(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateInterestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilihan Ekstrakurikuler <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editInterestEkstraId}
                  onChange={(e) => setEditInterestEkstraId(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {extracurriculars.map((ekstra) => (
                    <option key={ekstra.id} value={ekstra.id}>
                      {ekstra.nama_ekstra} (Pembina: {ekstra.pembina_nama})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Harapan Orang Tua / Murid
                </label>
                <textarea
                  value={editInterestCatatan}
                  onChange={(e) => setEditInterestCatatan(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {(currentUser.role === 'orang_tua' || currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editInterestConsent}
                      onChange={(e) => setEditInterestConsent(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-purple-900">
                      Persetujuan Wali Murid Diberikan
                    </span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteInterest(editingInterest);
                    setEditingInterest(null);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Batalkan Minat</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingInterest(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingInterest}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isUpdatingInterest ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Status Pendaftaran & Persetujuan Orang Tua */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>Daftar Pendaftaran Minat & Persetujuan Orang Tua</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pemantauan status persetujuan wali murid dan data pendaftaran ekstrakurikuler peserta didik
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Total Pendaftar: <strong>{relevantInterests.length}</strong> Murid
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                <th className="py-3 px-3">Nama Murid</th>
                <th className="py-3 px-3">Ekstrakurikuler</th>
                <th className="py-3 px-3">Pembina</th>
                <th className="py-3 px-3">Tanggal Daftar</th>
                <th className="py-3 px-3">Persetujuan Orang Tua</th>
                <th className="py-3 px-3">Catatan Wali / Motivasi</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {relevantInterests.map((interest) => {
                const canEditThisInterest =
                  currentUser.role === 'kepala_sekolah' ||
                  currentUser.role === 'guru' ||
                  (currentUser.role === 'orang_tua' && interest.murid_id === currentUser.anak_id);

                return (
                  <tr key={interest.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{interest.murid_nama}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{interest.kelas}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {interest.ekstra_nama}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {interest.pembina_nama}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {interest.tanggal_daftar}
                    </td>
                    <td className="py-3 px-3">
                      {interest.persetujuan_ortu ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Disetujui Wali</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Menunggu Persetujuan</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {interest.catatan_ortu || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEditThisInterest && (
                          <button
                            onClick={() => openEditInterestModal(interest)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer flex items-center gap-1"
                            title="Edit Data Pendaftaran Minat"
                          >
                            <Edit className="w-3 h-3 text-slate-600" />
                            <span>Edit</span>
                          </button>
                        )}

                        {(currentUser.role === 'orang_tua' || currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') && (
                          <button
                            onClick={() => handleToggleConsent(interest, !interest.persetujuan_ortu)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                              interest.persetujuan_ortu
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {interest.persetujuan_ortu ? 'Batal Setuju' : 'Setujui'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
