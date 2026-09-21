import React, { useState } from 'react';
import {
  UserCheck,
  Award,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  PlusCircle,
  Search,
  BookOpen,
  GraduationCap,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  Send,
  Edit,
  Edit3,
  UserCog,
  Users,
  Phone,
  Mail,
  Trash2,
  ShieldCheck,
  Save,
  Key,
  School,
  User as UserIcon,
} from 'lucide-react';
import { User, TeacherAsset } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface TeacherAssetsModuleProps {
  currentUser: User;
  teacherAssets: TeacherAsset[];
  availableUsers?: User[];
  onSaveTeacherAsset: (data: {
    user_id: number;
    latar_belakang_pendidikan: string;
    keahlian_khusus: string;
    komitmen_empati?: string;
    bidang_sertifikasi?: string;
    rekomendasi_ekstra?: string;
  }) => Promise<void>;
  onUpdateTeacherAsset?: (
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
  ) => Promise<void>;
  onConfirmTeacherAsset: (
    id: number,
    data: {
      catatan_konfirmasi_ks: string;
      status_konfirmasi: boolean;
      komitmen_empati?: string;
      rekomendasi_ekstra?: string;
    }
  ) => Promise<void>;
  onUpdateUser?: (id: number, data: any) => Promise<any>;
  onCreateUser?: (data: any) => Promise<any>;
  onDeleteUser?: (id: number) => Promise<void>;
}

export const TeacherAssetsModule: React.FC<TeacherAssetsModuleProps> = ({
  currentUser,
  teacherAssets,
  availableUsers = [],
  onSaveTeacherAsset,
  onUpdateTeacherAsset,
  onConfirmTeacherAsset,
  onUpdateUser,
  onCreateUser,
  onDeleteUser,
}) => {
  // Main view switcher: 'assets' for mapping/talents, 'personnel' for Kepala Sekolah & Guru personnel directory
  const [activeSubTab, setActiveSubTab] = useState<'assets' | 'personnel'>('personnel');

  const [searchTerm, setSearchTerm] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [showSelfForm, setShowSelfForm] = useState(false);
  const [selectedAssetForConfirm, setSelectedAssetForConfirm] = useState<TeacherAsset | null>(null);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<TeacherAsset | null>(null);

  // User Edit Modal (for Kepala Sekolah or Guru)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [editUserNama, setEditUserNama] = useState('');
  const [editUserNip, setEditUserNip] = useState('');
  const [editUserJabatan, setEditUserJabatan] = useState('');
  const [editUserNomorWa, setEditUserNomorWa] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Add New Teacher Modal
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherNama, setNewTeacherNama] = useState('');
  const [newTeacherNip, setNewTeacherNip] = useState('');
  const [newTeacherJabatan, setNewTeacherJabatan] = useState('');
  const [newTeacherNomorWa, setNewTeacherNomorWa] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('password123');
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);

  // Form states for Teacher Self-Submission
  const myExistingAsset = teacherAssets.find((a) => a.user_id === currentUser.id);
  const [pendidikan, setPendidikan] = useState(myExistingAsset?.latar_belakang_pendidikan || '');
  const [keahlian, setKeahlian] = useState(myExistingAsset?.keahlian_khusus || '');
  const [sertifikasi, setSertifikasi] = useState(myExistingAsset?.bidang_sertifikasi || '');
  const [komitmen, setKomitmen] = useState(myExistingAsset?.komitmen_empati || '');
  const [usulanEkstra, setUsulanEkstra] = useState(myExistingAsset?.rekomendasi_ekstra || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  // Form states for Edit Asset Modal
  const [editPendidikan, setEditPendidikan] = useState('');
  const [editKeahlian, setEditKeahlian] = useState('');
  const [editSertifikasi, setEditSertifikasi] = useState('');
  const [editKomitmen, setEditKomitmen] = useState('');
  const [editUsulanEkstra, setEditUsulanEkstra] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form states for Headmaster Confirmation / 1-on-1 interview
  const [catatanKS, setCatatanKS] = useState('');
  const [statusConfirm, setStatusConfirm] = useState(true);
  const [komitmenKS, setKomitmenKS] = useState('');
  const [rekomendasiKS, setRekomendasiKS] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Staff lists
  const kepalaSekolahList = availableUsers.filter((u) => u.role === 'kepala_sekolah');
  const guruList = availableUsers.filter((u) => u.role === 'guru');

  // Filtered lists
  const filteredAssets = teacherAssets.filter(
    (item) =>
      item.nama_guru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keahlian_khusus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.latar_belakang_pendidikan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGuruList = guruList.filter(
    (g) =>
      g.nama.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      (g.nip_nisn && g.nip_nisn.toLowerCase().includes(staffSearchTerm.toLowerCase())) ||
      (g.jabatan && g.jabatan.toLowerCase().includes(staffSearchTerm.toLowerCase())) ||
      g.username.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendidikan || !keahlian) {
      alert('Mohon lengkapi latar belakang pendidikan dan keahlian khusus.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveTeacherAsset({
        user_id: currentUser.id,
        latar_belakang_pendidikan: pendidikan,
        keahlian_khusus: keahlian,
        komitmen_empati: komitmen,
        bidang_sertifikasi: sertifikasi,
        rekomendasi_ekstra: usulanEkstra,
      });
      setSubmitSuccessMsg('Profil talenta dan komitmen empati berhasil disimpan!');
      setTimeout(() => setSubmitSuccessMsg(''), 4000);
      setShowSelfForm(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan profil aset guru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (asset: TeacherAsset) => {
    setSelectedAssetForEdit(asset);
    setEditPendidikan(asset.latar_belakang_pendidikan || '');
    setEditKeahlian(asset.keahlian_khusus || '');
    setEditSertifikasi(asset.bidang_sertifikasi || '');
    setEditKomitmen(asset.komitmen_empati || '');
    setEditUsulanEkstra(asset.rekomendasi_ekstra || '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForEdit) return;

    try {
      setIsEditing(true);
      if (onUpdateTeacherAsset) {
        await onUpdateTeacherAsset(selectedAssetForEdit.id, {
          latar_belakang_pendidikan: editPendidikan,
          keahlian_khusus: editKeahlian,
          bidang_sertifikasi: editSertifikasi,
          komitmen_empati: editKomitmen,
          rekomendasi_ekstra: editUsulanEkstra,
        });
      } else {
        await onSaveTeacherAsset({
          user_id: selectedAssetForEdit.user_id,
          latar_belakang_pendidikan: editPendidikan,
          keahlian_khusus: editKeahlian,
          bidang_sertifikasi: editSertifikasi,
          komitmen_empati: editKomitmen,
          rekomendasi_ekstra: editUsulanEkstra,
        });
      }
      setSubmitSuccessMsg(`Data aset guru ${selectedAssetForEdit.nama_guru} berhasil diperbarui!`);
      setTimeout(() => setSubmitSuccessMsg(''), 4000);
      setSelectedAssetForEdit(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui data aset guru.');
    } finally {
      setIsEditing(false);
    }
  };

  const openConfirmModal = (asset: TeacherAsset) => {
    setSelectedAssetForConfirm(asset);
    setCatatanKS(asset.catatan_konfirmasi_ks || '');
    setStatusConfirm(asset.status_konfirmasi ?? true);
    setKomitmenKS(asset.komitmen_empati || '');
    setRekomendasiKS(asset.rekomendasi_ekstra || '');
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForConfirm) return;

    try {
      setIsConfirming(true);
      await onConfirmTeacherAsset(selectedAssetForConfirm.id, {
        catatan_konfirmasi_ks: catatanKS,
        status_konfirmasi: statusConfirm,
        komitmen_empati: komitmenKS,
        rekomendasi_ekstra: rekomendasiKS,
      });
      setSubmitSuccessMsg('Konfirmasi wawancara 1-on-1 dan status pembina berhasil disimpan!');
      setTimeout(() => setSubmitSuccessMsg(''), 4000);
      setSelectedAssetForConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan konfirmasi.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Open User Edit Modal (For Kepala Sekolah or Guru)
  const openUserEditModal = (user: User) => {
    setSelectedUserForEdit(user);
    setEditUserNama(user.nama);
    setEditUserNip(user.nip_nisn || '');
    setEditUserJabatan(user.jabatan || (user.role === 'kepala_sekolah' ? 'Kepala UPT SD Negeri 275 Gresik' : 'Guru Pendidik'));
    setEditUserNomorWa(user.nomor_wa || '');
    setEditUserEmail(user.email || '');
    setEditUserUsername(user.username);
    setEditUserPassword('');
  };

  const handleUserUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit || !onUpdateUser) return;

    if (!editUserNama.trim()) {
      alert('Nama lengkap tidak boleh kosong.');
      return;
    }

    try {
      setIsUpdatingUser(true);
      await onUpdateUser(selectedUserForEdit.id, {
        nama: editUserNama.trim(),
        nip_nisn: editUserNip.trim(),
        jabatan: editUserJabatan.trim(),
        nomor_wa: editUserNomorWa.trim(),
        email: editUserEmail.trim(),
        username: editUserUsername.trim(),
        password: editUserPassword.trim() ? editUserPassword.trim() : undefined,
      });

      const roleLabel = selectedUserForEdit.role === 'kepala_sekolah' ? 'Kepala Sekolah' : 'Guru';
      setSubmitSuccessMsg(`Data ${roleLabel} "${editUserNama}" berhasil diperbarui!`);
      setTimeout(() => setSubmitSuccessMsg(''), 4000);
      setSelectedUserForEdit(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui data pengguna.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleCreateTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateUser) return;

    if (!newTeacherNama.trim() || !newTeacherUsername.trim()) {
      alert('Nama lengkap dan username wajib diisi.');
      return;
    }

    try {
      setIsCreatingTeacher(true);
      await onCreateUser({
        nama: newTeacherNama.trim(),
        nip_nisn: newTeacherNip.trim() || '-',
        jabatan: newTeacherJabatan.trim() || 'Guru Pendidik',
        nomor_wa: newTeacherNomorWa.trim(),
        email: newTeacherEmail.trim(),
        username: newTeacherUsername.trim(),
        password: newTeacherPassword.trim() || 'password123',
        role: 'guru',
      });

      setSubmitSuccessMsg(`Guru baru "${newTeacherNama}" berhasil ditambahkan ke sistem!`);
      setTimeout(() => setSubmitSuccessMsg(''), 4000);
      setShowAddTeacherModal(false);
      setNewTeacherNama('');
      setNewTeacherNip('');
      setNewTeacherJabatan('');
      setNewTeacherNomorWa('');
      setNewTeacherEmail('');
      setNewTeacherUsername('');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan guru baru.');
    } finally {
      setIsCreatingTeacher(false);
    }
  };

  const handleDeleteTeacher = async (user: User) => {
    if (!onDeleteUser) return;
    if (user.role === 'kepala_sekolah') {
      alert('Kepala Sekolah tidak dapat dihapus. Anda dapat mengubah datanya melalui tombol "Ganti / Edit Data".');
      return;
    }

    const confirm = window.confirm(`Apakah Anda yakin ingin menghapus data guru "${user.nama}" dari sistem?`);
    if (!confirm) return;

    try {
      await onDeleteUser(user.id);
      setSubmitSuccessMsg(`Data guru "${user.nama}" berhasil dihapus.`);
      setTimeout(() => setSubmitSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus guru.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Modul Sumber Daya Pendidik & Aset Guru</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Pemetaan Aset, Profil Guru & Kepala Sekolah
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Pemberdayaan kompetensi internal UPT SD Negeri 275 Gresik: kelola data identitas Kepala Sekolah,
              dewan guru, serta pemetaan kualifikasi talenta untuk bimbingan ekstrakurikuler murid.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeSubTab === 'personnel' && (currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') && (
              <button
                id="btn-add-teacher"
                onClick={() => setShowAddTeacherModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Guru Baru</span>
              </button>
            )}

            {activeSubTab === 'assets' && (currentUser.role === 'guru' || currentUser.role === 'kepala_sekolah') && (
              <button
                id="btn-open-guru-form"
                onClick={() => {
                  if (myExistingAsset) {
                    openEditModal(myExistingAsset);
                  } else {
                    setShowSelfForm(!showSelfForm);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
              >
                {myExistingAsset ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                <span>{myExistingAsset ? 'Edit Profil Talenta' : 'Isi Pemetaan Talenta Guru'}</span>
              </button>
            )}
          </div>
        </div>

        {currentUser.role === 'murid' && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Mode Peninjau Siswa: Anda dapat meninjau seluruh direktori dewan guru dan profil keahlian aset talenta pendidik. Pengeditan dan penambahan data hanya diperuntukkan bagi Kepala Sekolah dan Guru.
            </span>
          </div>
        )}

        {submitSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{submitSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          id="tab-personnel-directory"
          onClick={() => setActiveSubTab('personnel')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeSubTab === 'personnel'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Kepala Sekolah & Dewan Guru</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeSubTab === 'personnel' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {kepalaSekolahList.length + guruList.length}
          </span>
        </button>

        <button
          id="tab-assets-mapping"
          onClick={() => setActiveSubTab('assets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeSubTab === 'assets'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Matriks Pemetaan Aset & Talenta Guru</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeSubTab === 'assets' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {teacherAssets.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DAFTAR KEPALA SEKOLAH & GURU (Bisa Diganti Datanya) */}
      {activeSubTab === 'personnel' && (
        <div className="space-y-6">
          {/* SECTION A: KEPALA SEKOLAH */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <SchoolLogo size="xl" className="shrink-0 drop-shadow-md" />

                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold mb-1 border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pimpinan Satuan Pendidikan & Penanggung Jawab SI-PASTI</span>
                  </div>

                  {kepalaSekolahList.length > 0 ? (
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {kepalaSekolahList[0].nama}
                      </h2>
                      <p className="text-xs text-emerald-200 mt-0.5">
                        NIP: {kepalaSekolahList[0].nip_nisn || '-'} •{' '}
                        {kepalaSekolahList[0].jabatan || 'Kepala UPT SD Negeri 275 Gresik'}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-emerald-100/90 flex-wrap">
                        <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                          <UserIcon className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Username: <strong>@{kepalaSekolahList[0].username}</strong></span>
                        </span>
                        {kepalaSekolahList[0].nomor_wa && (
                          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                            <Phone className="w-3.5 h-3.5 text-emerald-300" />
                            <span>WA: {kepalaSekolahList[0].nomor_wa}</span>
                          </span>
                        )}
                        {kepalaSekolahList[0].email && (
                          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                            <Mail className="w-3.5 h-3.5 text-emerald-300" />
                            <span>{kepalaSekolahList[0].email}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-lg font-bold text-white">Drs. H. Sukardi, M.Pd</h2>
                      <p className="text-xs text-emerald-200">Kepala UPT SD Negeri 275 Gresik</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {kepalaSekolahList.length > 0 && (currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') && (
                  <button
                    id="btn-edit-kepala-sekolah"
                    onClick={() => openUserEditModal(kepalaSekolahList[0])}
                    className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-700" />
                    <span>Ganti / Edit Data Kepala Sekolah</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION B: DEWAN GURU UPT SDN 275 GRESIK */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-700" />
                  <span>Daftar Dewan Guru & Tenaga Pendidik</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap guru dapat diganti/diedit identitasnya, disesuaikan jabatannya, atau ditambahkan guru baru.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={staffSearchTerm}
                  onChange={(e) => setStaffSearchTerm(e.target.value)}
                  placeholder="Cari nama guru, NIP, jabatan..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Grid of Teachers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuruList.map((guru) => {
                // Check if this guru has an asset mapping record
                const guruAsset = teacherAssets.find((a) => a.user_id === guru.id);

                return (
                  <div
                    key={guru.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-300 transition shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm shrink-0">
                            {guru.nama.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                              {guru.nama}
                            </h3>
                            <p className="text-[11px] text-slate-500">NIP: {guru.nip_nisn || '-'}</p>
                          </div>
                        </div>

                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                          Guru
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 my-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[11px]">
                          <span className="text-slate-400 font-medium">Jabatan / Tugas:</span>{' '}
                          <strong className="text-slate-800 block sm:inline">
                            {guru.jabatan || 'Guru Pendidik Internal'}
                          </strong>
                        </div>

                        <div className="text-[11px] flex items-center gap-2 flex-wrap text-slate-500">
                          <span>Akun: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono">@{guru.username}</code></span>
                          {guru.nomor_wa && (
                            <span>• WA: {guru.nomor_wa}</span>
                          )}
                        </div>

                        {guru.email && (
                          <div className="text-[10px] text-slate-400 truncate">
                            Email: {guru.email}
                          </div>
                        )}

                        {guruAsset && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] flex items-center justify-between">
                            <span className="text-slate-500">Status Aset:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                guruAsset.status_konfirmasi
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {guruAsset.status_konfirmasi ? 'Disahkan KS' : 'Menunggu KS'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      {(currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') ? (
                        <button
                          onClick={() => handleDeleteTeacher(guru)}
                          className="px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Hapus data guru"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">GTK Aktif</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {guruAsset && (
                          <button
                            onClick={() => {
                              setActiveSubTab('assets');
                              openEditModal(guruAsset);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition cursor-pointer"
                            title="Lihat / Edit Aset Talenta"
                          >
                            Aset Talenta
                          </button>
                        )}
                        {(currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') && (
                          <button
                            id={`btn-edit-guru-${guru.id}`}
                            onClick={() => openUserEditModal(guru)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Ganti / Edit Data</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIKS PEMETAAN ASET & TALENTA GURU */}
      {activeSubTab === 'assets' && (
        <div className="space-y-6">
          {/* Form Input Baru Mandiri Guru */}
          {showSelfForm && (
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Formulir Pemetaan Talenta & Portofolio Guru</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Data akan diverifikasi oleh Kepala Sekolah dalam sesi wawancara 1-on-1.
                  </p>
                </div>
                <button
                  onClick={() => setShowSelfForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Guru
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${currentUser.nama} (NIP: ${currentUser.nip_nisn || '-'})`}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Latar Belakang Pendidikan Terakhir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pendidikan}
                      onChange={(e) => setPendidikan(e.target.value)}
                      placeholder="Contoh: S1 Pendidikan Biologi / PGSD, Universitas Negeri Surabaya"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keahlian Khusus, Hobi Berprestasi, & Portofolio <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={keahlian}
                    onChange={(e) => setKeahlian(e.target.value)}
                    rows={3}
                    placeholder="Uraikan keahlian yang dapat diajarkan pada murid (contoh: Juara robotika, mahir melatih Tari Tradisional Pesisir, pelatih catur, dsb)..."
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sertifikasi / Pelatihan yang Pernah Diikuti
                    </label>
                    <input
                      type="text"
                      value={sertifikasi}
                      onChange={(e) => setSertifikasi(e.target.value)}
                      placeholder="Contoh: TOT Instruktur Sains Kemendikbudristek"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Usulan Ekstrakurikuler yang Direkomendasikan
                    </label>
                    <input
                      type="text"
                      value={usulanEkstra}
                      onChange={(e) => setUsulanEkstra(e.target.value)}
                      placeholder="Contoh: Klub Sains & Inovasi Cilik"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pernyataan Komitmen Empati Guru
                    </label>
                    <input
                      type="text"
                      value={komitmen}
                      onChange={(e) => setKomitmen(e.target.value)}
                      placeholder="Contoh: Siap membina dengan sabar dan menyenangkan"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSelfForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Profil Talenta'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari guru, keahlian khusus, atau pendidikan..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-500">
              Total: <strong className="text-slate-800">{filteredAssets.length}</strong> Guru Terdata
            </div>
          </div>

          {/* Grid of Teacher Assets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssets.map((asset) => {
              const isMe = asset.user_id === currentUser.id;
              const isManager = currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru';
              const canEdit = isManager;
              const matchedUser = availableUsers.find((u) => u.id === asset.user_id);

              return (
                <div
                  key={asset.id}
                  className={`bg-white rounded-2xl p-5 border transition shadow-xs flex flex-col justify-between ${
                    isMe ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Card Top: Name & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-slate-900 text-sm">{asset.nama_guru}</h2>
                          {isMe && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                              Profil Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">NIP: {asset.nip || '-'}</p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                          asset.status_konfirmasi
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {asset.status_konfirmasi ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Disahkan Kepala Sekolah</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Menunggu Wawancara KS</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold text-slate-700 block">Kualifikasi Akademik</span>
                          <span className="text-slate-800">{asset.latar_belakang_pendidikan}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Award className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold text-slate-700 block">Keahlian Khusus & Portofolio</span>
                          <span className="text-slate-800">{asset.keahlian_khusus}</span>
                        </div>
                      </div>

                      {asset.bidang_sertifikasi && (
                        <div className="text-[11px] text-slate-600 px-1">
                          <strong>Sertifikasi:</strong> {asset.bidang_sertifikasi}
                        </div>
                      )}

                      {asset.rekomendasi_ekstra && (
                        <div className="text-[11px] text-emerald-900 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                          <strong>Penugasan Ekstrakurikuler:</strong> {asset.rekomendasi_ekstra}
                        </div>
                      )}

                      {/* Panel Catatan Empati Guru */}
                      {asset.komitmen_empati && (
                        <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                            <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
                            <span>Komitmen Empati Pembina:</span>
                          </div>
                          <p className="italic text-amber-950">"{asset.komitmen_empati}"</p>
                        </div>
                      )}

                      {/* Panel Catatan Konfirmasi Wawancara 1-on-1 Kepala Sekolah */}
                      {asset.catatan_konfirmasi_ks && (
                        <div className="bg-sky-50/80 p-2.5 rounded-xl border border-sky-200/80 text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold text-sky-900 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-sky-700" />
                            <span>Catatan Wawancara 1-on-1 & Evaluasi Kepala Sekolah:</span>
                          </div>
                          <p className="text-sky-950">{asset.catatan_konfirmasi_ks}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(asset)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          title="Edit rincian data aset talenta guru"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit Data Aset</span>
                        </button>
                      )}

                      {matchedUser && canEdit && (
                        <button
                          onClick={() => openUserEditModal(matchedUser)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                          title="Ganti / Edit Data Guru (Nama, NIP, Jabatan, dll)"
                        >
                          <UserCog className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit Data GTK</span>
                        </button>
                      )}

                      {!canEdit && (
                        <span className="text-[11px] text-slate-500 italic">
                          Keahlian: {asset.keahlian_khusus}
                        </span>
                      )}
                    </div>

                    {(currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') && (
                      <button
                        id={`btn-confirm-teacher-${asset.id}`}
                        onClick={() => openConfirmModal(asset)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          {asset.status_konfirmasi ? 'Ubah Catatan Wawancara' : 'Konfirmasi & Wawancara 1-on-1'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: GANTI / EDIT DATA USER (KEPALA SEKOLAH ATAU GURU) */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-emerald-700" />
                  <span>
                    Ganti / Edit Data {selectedUserForEdit.role === 'kepala_sekolah' ? 'Kepala Sekolah' : 'Guru'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Perubahan nama dan NIP akan otomatis disinkronkan ke seluruh sistem SI-PASTI.
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUserUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap (Beserta Gelar) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editUserNama}
                  onChange={(e) => setEditUserNama(e.target.value)}
                  placeholder="Contoh: Drs. H. Sukardi, M.Pd / Nur Aini, S.Pd"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / NUPTK
                  </label>
                  <input
                    type="text"
                    value={editUserNip}
                    onChange={(e) => setEditUserNip(e.target.value)}
                    placeholder="Contoh: 196805121992031005"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan / Penugasan
                  </label>
                  <input
                    type="text"
                    value={editUserJabatan}
                    onChange={(e) => setEditUserJabatan(e.target.value)}
                    placeholder="Contoh: Kepala Sekolah / Guru Kelas 5"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / Kontak
                  </label>
                  <input
                    type="text"
                    value={editUserNomorWa}
                    onChange={(e) => setEditUserNomorWa(e.target.value)}
                    placeholder="081234567890"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Kedinasan
                  </label>
                  <input
                    type="email"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    placeholder="nama@gresik.sch.id"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Akun Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editUserUsername}
                    onChange={(e) => setEditUserUsername(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi Baru (Kosongkan jika tidak diganti)
                  </label>
                  <input
                    type="password"
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    placeholder="Masukkan sandi baru..."
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdatingUser ? 'Menyimpan...' : 'Simpan Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH GURU BARU */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-700" />
                  <span>Tambah Tenaga Pendidik / Guru Baru</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Guru yang ditambahkan akan terdaftar pada sistem dan otomatis masuk dalam pemetaan aset.
                </p>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Guru (Beserta Gelar) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTeacherNama}
                  onChange={(e) => setNewTeacherNama(e.target.value)}
                  placeholder="Contoh: Rina Wahyuni, S.Pd"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / NUPTK
                  </label>
                  <input
                    type="text"
                    value={newTeacherNip}
                    onChange={(e) => setNewTeacherNip(e.target.value)}
                    placeholder="Contoh: 199201152019022008"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan / Penugasan
                  </label>
                  <input
                    type="text"
                    value={newTeacherJabatan}
                    onChange={(e) => setNewTeacherJabatan(e.target.value)}
                    placeholder="Contoh: Guru Kelas 3 / Guru Bahasa Inggris"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / Telp
                  </label>
                  <input
                    type="text"
                    value={newTeacherNomorWa}
                    onChange={(e) => setNewTeacherNomorWa(e.target.value)}
                    placeholder="081234567895"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Kedinasan
                  </label>
                  <input
                    type="email"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    placeholder="rina.spd@gresik.sch.id"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Akun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTeacherUsername}
                    onChange={(e) => setNewTeacherUsername(e.target.value)}
                    placeholder="guru_rina"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi Akun
                  </label>
                  <input
                    type="password"
                    value={newTeacherPassword}
                    onChange={(e) => setNewTeacherPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTeacher}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isCreatingTeacher ? 'Mendaftarkan...' : 'Daftarkan Guru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT ASET TALENTA GURU */}
      {selectedAssetForEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-700" />
                  <span>Edit Data Pemetaan Aset Guru</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Guru: <strong>{selectedAssetForEdit.nama_guru}</strong> (NIP: {selectedAssetForEdit.nip || '-'})
                </p>
              </div>
              <button
                onClick={() => setSelectedAssetForEdit(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Latar Belakang Pendidikan Terakhir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editPendidikan}
                  onChange={(e) => setEditPendidikan(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keahlian Khusus & Portofolio <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={editKeahlian}
                  onChange={(e) => setEditKeahlian(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bidang Sertifikasi
                  </label>
                  <input
                    type="text"
                    value={editSertifikasi}
                    onChange={(e) => setEditSertifikasi(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rekomendasi Ekstrakurikuler
                  </label>
                  <input
                    type="text"
                    value={editUsulanEkstra}
                    onChange={(e) => setEditUsulanEkstra(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pernyataan Komitmen Empati Guru
                </label>
                <textarea
                  value={editKomitmen}
                  onChange={(e) => setEditKomitmen(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForEdit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Memperbarui...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: KONFIRMASI WAWANCARA 1-ON-1 KEPALA SEKOLAH */}
      {selectedAssetForConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  <span>Konfirmasi & Wawancara 1-on-1 Guru</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Guru: <strong>{selectedAssetForConfirm.nama_guru}</strong> ({selectedAssetForConfirm.latar_belakang_pendidikan})
                </p>
              </div>
              <button
                onClick={() => setSelectedAssetForConfirm(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Wawancara 1-on-1 & Evaluasi Kepala Sekolah <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={catatanKS}
                  onChange={(e) => setCatatanKS(e.target.value)}
                  rows={3}
                  required
                  placeholder="Tuliskan hasil diskusi 1-on-1, kesiapan sarana, dan penguatan komitmen guru..."
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penugasan Ekstrakurikuler yang Ditetapkan
                </label>
                <input
                  type="text"
                  value={rekomendasiKS}
                  onChange={(e) => setRekomendasiKS(e.target.value)}
                  placeholder="Contoh: Klub Sains & Inovasi Cilik"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Komitmen Empati Pembimbingan (Hasil Refleksi Bersama)
                </label>
                <textarea
                  value={komitmenKS}
                  onChange={(e) => setKomitmenKS(e.target.value)}
                  rows={2}
                  placeholder="Komitmen pendekatan tanpa paksaan dan menumbuhkan karakter murid..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusConfirm}
                    onChange={(e) => setStatusConfirm(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Sahkan status guru sebagai Pembina Ekstrakurikuler Aktif UPT SDN 275 Gresik
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForConfirm(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isConfirming}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isConfirming ? 'Menyimpan...' : 'Simpan Konfirmasi Wawancara'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
