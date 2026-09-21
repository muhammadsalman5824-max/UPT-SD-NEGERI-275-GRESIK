import React, { useState, useMemo } from 'react';
import {
  User,
  Extracurricular,
  StudentInterest,
} from '../types';
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Users,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  Layers,
  FileSpreadsheet,
  ChevronRight,
  AlertCircle,
  X,
  BookOpen,
  Heart,
  PlusCircle,
  Check,
  RotateCw,
  ArrowLeftRight,
  ChevronLeft,
  CalendarDays,
  History,
  Info,
} from 'lucide-react';

interface StudentEntryModuleProps {
  currentUser: User;
  availableUsers: User[];
  extracurriculars: Extracurricular[];
  studentInterests: StudentInterest[];
  onCreateUser: (data: {
    nama: string;
    username: string;
    nip_nisn?: string;
    role?: 'murid';
    nomor_wa?: string;
    kelas?: string;
    password?: string;
    jenis_kelamin?: 'L' | 'P';
    tanggal_lahir?: string;
    tempat_lahir?: string;
    alamat?: string;
    nama_ortu?: string;
    wa_ortu?: string;
    minat_utama?: string;
    catatan_bakat?: string;
    tahun_masuk?: number;
  }) => Promise<any>;
  onUpdateUser: (
    id: number,
    data: Partial<User> & { password?: string }
  ) => Promise<any>;
  onDeleteUser: (id: number) => Promise<void>;
  onRegisterInterest: (data: {
    murid_id: number;
    ekstra_id: number;
    persetujuan_ortu?: boolean;
    catatan_ortu?: string;
  }) => Promise<void>;
  onNavigateToEkstra?: () => void;
}

export const TAHUN_LIST = [2024, 2025, 2026] as const;

export interface YearCohortInfo {
  year: number;
  label: string;
  ta: string;
  desc: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  pillActiveBg: string;
}

export const YEAR_DETAILS: Record<number, YearCohortInfo> = {
  2024: {
    year: 2024,
    label: 'Tahun 2024',
    ta: 'T.A. 2024/2025',
    desc: 'Angkatan Masuk 2024 • Pembinaan Lanjut Prestasi & Persiapan Kompetisi Kabupaten',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    pillActiveBg: 'bg-blue-700 text-white',
  },
  2025: {
    year: 2025,
    label: 'Tahun 2025',
    ta: 'T.A. 2025/2026',
    desc: 'Angkatan Masuk 2025 • Pemantapan Talenta & Portofolio Minat Bakat Siswa',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    pillActiveBg: 'bg-emerald-700 text-white',
  },
  2026: {
    year: 2026,
    label: 'Tahun 2026',
    ta: 'T.A. 2026/2027',
    desc: 'Angkatan Masuk 2026 • Penjaringan Siswa Baru & Pemetaan Potensi Bakat Awal',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    pillActiveBg: 'bg-amber-600 text-white',
  },
};

const KELAS_OPTIONS = [
  'Kelas 1A',
  'Kelas 1B',
  'Kelas 2A',
  'Kelas 2B',
  'Kelas 3A',
  'Kelas 3B',
  'Kelas 4A',
  'Kelas 4B',
  'Kelas 5A',
  'Kelas 5B',
  'Kelas 6A',
  'Kelas 6B',
];

const PRESET_MINAT = [
  'Robotika STEM & Eksperimen Sains',
  'Seni Tari Tradisional Pesisir',
  'Olahraga Catur Taktis & Logika',
  'Tilawatil Qur\'an & Vokal Hadrah',
  'Olimpiade Matematika & Sains (OSN)',
  'Pramuka Penggalang & Kepanduan',
  'Seni Musik & Ansambel',
  'Atletik Lari & Senam Kebugaran',
  'Literasi Kreatif & Menulis Cerita',
  'Kriya Seni Rupa & Melukis',
];

export const StudentEntryModule: React.FC<StudentEntryModuleProps> = ({
  currentUser,
  availableUsers,
  extracurriculars,
  studentInterests,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onRegisterInterest,
  onNavigateToEkstra,
}) => {
  // State for filtering & searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterStatusEkstra, setFilterStatusEkstra] = useState<'all' | 'terdaftar' | 'belum'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [enrollingStudent, setEnrollingStudent] = useState<User | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<User | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form state: Add Student
  const [addNama, setAddNama] = useState('');
  const [addNisn, setAddNisn] = useState('');
  const [addKelas, setAddKelas] = useState('Kelas 5A');
  const [addGender, setAddGender] = useState<'L' | 'P'>('L');
  const [addTempatLahir, setAddTempatLahir] = useState('Gresik');
  const [addTanggalLahir, setAddTanggalLahir] = useState('2014-05-15');
  const [addNamaOrtu, setAddNamaOrtu] = useState('');
  const [addWaOrtu, setAddWaOrtu] = useState('');
  const [addAlamat, setAddAlamat] = useState('');
  const [addMinatUtama, setAddMinatUtama] = useState('Robotika STEM & Eksperimen Sains');
  const [addCatatanBakat, setAddCatatanBakat] = useState('');
  const [addTahunMasuk, setAddTahunMasuk] = useState<number>(2026);
  const [addAutoRegisterEkstra, setAddAutoRegisterEkstra] = useState(false);
  const [addSelectedEkstraId, setAddSelectedEkstraId] = useState<number>(extracurriculars[0]?.id || 1);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Form state: Edit Student
  const [editNama, setEditNama] = useState('');
  const [editNisn, setEditNisn] = useState('');
  const [editKelas, setEditKelas] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editTempatLahir, setEditTempatLahir] = useState('');
  const [editTanggalLahir, setEditTanggalLahir] = useState('');
  const [editNamaOrtu, setEditNamaOrtu] = useState('');
  const [editWaOrtu, setEditWaOrtu] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editMinatUtama, setEditMinatUtama] = useState('');
  const [editCatatanBakat, setEditCatatanBakat] = useState('');
  const [editTahunMasuk, setEditTahunMasuk] = useState<number>(2024);
  const [editPassword, setEditPassword] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Form state: Quick Enroll Student into Ekstrakurikuler
  const [enrollEkstraId, setEnrollEkstraId] = useState<number>(extracurriculars[0]?.id || 1);
  const [enrollConsent, setEnrollConsent] = useState(true);
  const [enrollCatatan, setEnrollCatatan] = useState('');
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);

  // Filter students (users with role === 'murid')
  const allStudents = useMemo(() => {
    return availableUsers.filter((u) => u.role === 'murid');
  }, [availableUsers]);

  // Calculate counts per year (2024, 2025, 2026)
  const studentsByYear = useMemo(() => {
    const counts: Record<number, number> = { 2024: 0, 2025: 0, 2026: 0 };
    allStudents.forEach((s) => {
      const yr = s.tahun_masuk || 2024;
      if (counts[yr] !== undefined) {
        counts[yr]++;
      } else {
        counts[2024]++;
      }
    });
    return counts;
  }, [allStudents]);

  // Rotasi/Ganti Tahun Secara Bergantian: 2024 -> 2025 -> 2026 -> 2024
  const handleCycleYear = () => {
    let next: number;
    if (selectedYear === 'all' || selectedYear === 2026) {
      next = 2024;
    } else if (selectedYear === 2024) {
      next = 2025;
    } else {
      next = 2026;
    }
    setSelectedYear(next);
    triggerToast(`Beralih ke data siswa Tahun ${next} (${YEAR_DETAILS[next].ta})`);
  };

  const handlePrevYear = () => {
    let prev: number;
    if (selectedYear === 'all' || selectedYear === 2024) {
      prev = 2026;
    } else if (selectedYear === 2025) {
      prev = 2024;
    } else {
      prev = 2025;
    }
    setSelectedYear(prev);
    triggerToast(`Beralih ke data siswa Tahun ${prev} (${YEAR_DETAILS[prev].ta})`);
  };

  const handleNextYear = () => {
    let next: number;
    if (selectedYear === 'all' || selectedYear === 2026) {
      next = 2024;
    } else if (selectedYear === 2024) {
      next = 2025;
    } else {
      next = 2026;
    }
    setSelectedYear(next);
    triggerToast(`Beralih ke data siswa Tahun ${next} (${YEAR_DETAILS[next].ta})`);
  };

  // Rotasi tahun masuk pada form entry siswa baru
  const handleCycleAddYear = () => {
    setAddTahunMasuk((prev) => (prev === 2024 ? 2025 : prev === 2025 ? 2026 : 2024));
  };

  // Calculate student enrollment map
  const studentEnrollmentsMap = useMemo(() => {
    const map = new Map<number, StudentInterest[]>();
    studentInterests.forEach((si) => {
      const current = map.get(si.murid_id) || [];
      current.push(si);
      map.set(si.murid_id, current);
    });
    return map;
  }, [studentInterests]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      // Tahun Masuk Filter (2024, 2025, 2026)
      const studentYear = student.tahun_masuk || 2024;
      const matchYear = selectedYear === 'all' || studentYear === selectedYear;

      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        student.nama.toLowerCase().includes(search) ||
        (student.nip_nisn && student.nip_nisn.toLowerCase().includes(search)) ||
        (student.kelas && student.kelas.toLowerCase().includes(search)) ||
        (student.nama_ortu && student.nama_ortu.toLowerCase().includes(search)) ||
        (student.minat_utama && student.minat_utama.toLowerCase().includes(search)) ||
        studentYear.toString().includes(search);

      // Kelas filter
      const matchKelas = filterKelas === 'all' || student.kelas === filterKelas;

      // Gender filter
      const matchGender = filterGender === 'all' || student.jenis_kelamin === filterGender;

      // Status Ekstra filter
      const enrolled = (studentEnrollmentsMap.get(student.id) || []).length > 0;
      const matchStatus =
        filterStatusEkstra === 'all'
          ? true
          : filterStatusEkstra === 'terdaftar'
          ? enrolled
          : !enrolled;

      return matchYear && matchSearch && matchKelas && matchGender && matchStatus;
    });
  }, [allStudents, selectedYear, searchTerm, filterKelas, filterGender, filterStatusEkstra, studentEnrollmentsMap]);

  // Statistics
  const totalStudents = allStudents.length;
  const isManager = currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru';
  const isStudent = currentUser.role === 'murid';
  const enrolledStudentsCount = allStudents.filter(
    (s) => (studentEnrollmentsMap.get(s.id) || []).length > 0
  ).length;
  const unenrolledStudentsCount = totalStudents - enrolledStudentsCount;
  const enrollmentRate = totalStudents > 0 ? Math.round((enrolledStudentsCount / totalStudents) * 100) : 0;

  // Show temporary feedback toast
  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  // Open Edit Modal
  const openEditModal = (student: User) => {
    setEditingStudent(student);
    setEditNama(student.nama);
    setEditNisn(student.nip_nisn || '');
    setEditKelas(student.kelas || 'Kelas 5A');
    setEditGender(student.jenis_kelamin || 'L');
    setEditTempatLahir(student.tempat_lahir || 'Gresik');
    setEditTanggalLahir(student.tanggal_lahir || '');
    setEditNamaOrtu(student.nama_ortu || '');
    setEditWaOrtu(student.wa_ortu || student.nomor_wa || '');
    setEditAlamat(student.alamat || '');
    setEditMinatUtama(student.minat_utama || '');
    setEditCatatanBakat(student.catatan_bakat || '');
    setEditTahunMasuk(student.tahun_masuk || 2024);
    setEditPassword('');
  };

  // Open Direct Enroll Modal
  const openEnrollModal = (student: User) => {
    setEnrollingStudent(student);
    // Default to the first ekstra the student hasn't joined yet
    const currentEnrolledEkstraIds = (studentEnrollmentsMap.get(student.id) || []).map(
      (si) => si.ekstra_id
    );
    const availableEkstra = extracurriculars.find(
      (e) => !currentEnrolledEkstraIds.includes(e.id)
    );
    setEnrollEkstraId(availableEkstra ? availableEkstra.id : extracurriculars[0]?.id || 1);
    setEnrollConsent(true);
    setEnrollCatatan(
      student.catatan_bakat ? `Rekomendasi minat bakat: ${student.catatan_bakat}` : ''
    );
  };

  // Handle Create Student Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNama.trim()) {
      triggerToast('Nama murid tidak boleh kosong.', 'error');
      return;
    }
    if (!addNisn.trim()) {
      triggerToast('NISN murid tidak boleh kosong.', 'error');
      return;
    }

    try {
      setIsSubmittingAdd(true);
      const cleanUsername = `murid_${addNama
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 10)}_${Math.floor(100 + Math.random() * 900)}`;

      const createdUser = await onCreateUser({
        nama: addNama.trim(),
        username: cleanUsername,
        nip_nisn: addNisn.trim(),
        role: 'murid',
        kelas: addKelas,
        jenis_kelamin: addGender,
        tempat_lahir: addTempatLahir,
        tanggal_lahir: addTanggalLahir,
        nama_ortu: addNamaOrtu.trim(),
        wa_ortu: addWaOrtu.trim(),
        nomor_wa: addWaOrtu.trim(),
        alamat: addAlamat.trim(),
        minat_utama: addMinatUtama,
        catatan_bakat: addCatatanBakat.trim(),
        tahun_masuk: addTahunMasuk,
        password: 'password123',
      });

      // If auto register ekstra is checked
      if (addAutoRegisterEkstra && addSelectedEkstraId && (createdUser as any)?.id) {
        await onRegisterInterest({
          murid_id: (createdUser as any).id,
          ekstra_id: addSelectedEkstraId,
          persetujuan_ortu: true,
          catatan_ortu: 'Pendaftaran otomatis saat entry data siswa baru SI-PASTI.',
        });
      }

      triggerToast(
        `Data siswa ${addNama} (Angkatan ${addTahunMasuk}) berhasil disimpan ke pangkalan data sekolah!${
          addAutoRegisterEkstra ? ' Dan berhasil ditarik ke ekstrakurikuler terpilih.' : ''
        }`
      );

      // Reset form
      setShowAddModal(false);
      setAddNama('');
      setAddNisn('');
      setAddNamaOrtu('');
      setAddWaOrtu('');
      setAddAlamat('');
      setAddCatatanBakat('');
      setAddAutoRegisterEkstra(false);
    } catch (err: any) {
      triggerToast(err.message || 'Gagal menambahkan data siswa.', 'error');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Edit Student Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editNama.trim()) {
      triggerToast('Nama murid tidak boleh kosong.', 'error');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await onUpdateUser(editingStudent.id, {
        nama: editNama.trim(),
        nip_nisn: editNisn.trim(),
        kelas: editKelas,
        jenis_kelamin: editGender,
        tempat_lahir: editTempatLahir,
        tanggal_lahir: editTanggalLahir,
        nama_ortu: editNamaOrtu.trim(),
        wa_ortu: editWaOrtu.trim(),
        nomor_wa: editWaOrtu.trim(),
        alamat: editAlamat.trim(),
        minat_utama: editMinatUtama,
        catatan_bakat: editCatatanBakat.trim(),
        tahun_masuk: editTahunMasuk,
        ...(editPassword ? { password: editPassword } : {}),
      });

      triggerToast(`Data siswa ${editNama} (Angkatan ${editTahunMasuk}) berhasil diperbarui.`);
      setEditingStudent(null);
    } catch (err: any) {
      triggerToast(err.message || 'Gagal memperbarui data siswa.', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Student
  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;
    try {
      await onDeleteUser(deletingStudent.id);
      triggerToast(`Data siswa ${deletingStudent.nama} berhasil dihapus dari pangkalan data.`);
      setDeletingStudent(null);
    } catch (err: any) {
      triggerToast(err.message || 'Gagal menghapus data siswa.', 'error');
    }
  };

  // Handle Direct Enroll Submit
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingStudent) return;

    try {
      setIsSubmittingEnroll(true);
      await onRegisterInterest({
        murid_id: enrollingStudent.id,
        ekstra_id: enrollEkstraId,
        persetujuan_ortu: enrollConsent,
        catatan_ortu: enrollCatatan.trim(),
      });

      const selectedEkstra = extracurriculars.find((e) => e.id === enrollEkstraId);
      triggerToast(
        `Siswa ${enrollingStudent.nama} berhasil ditarik dan didaftarkan ke ekstrakurikuler ${
          selectedEkstra?.nama_ekstra || ''
        }!`
      );
      setEnrollingStudent(null);
    } catch (err: any) {
      triggerToast(err.message || 'Gagal mendaftarkan siswa ke ekstrakurikuler.', 'error');
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

  // Export to simple CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Tahun Masuk / Angkatan',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Nama Wali',
      'No WA Wali',
      'Alamat',
      'Minat Utama',
      'Ekstrakurikuler Diikuti',
    ];

    const rows = filteredStudents.map((s) => {
      const interests = (studentEnrollmentsMap.get(s.id) || [])
        .map((i) => i.ekstra_nama)
        .join('; ');

      return [
        s.id,
        `"${s.tahun_masuk || 2024}"`,
        `"${s.nip_nisn || '-'}"`,
        `"${s.nama}"`,
        `"${s.kelas || '-'}"`,
        `"${s.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'}"`,
        `"${s.tempat_lahir || '-'}"`,
        `"${s.tanggal_lahir || '-'}"`,
        `"${s.nama_ortu || '-'}"`,
        `"${s.wa_ortu || s.nomor_wa || '-'}"`,
        `"${(s.alamat || '-').replace(/"/g, '""')}"`,
        `"${(s.minat_utama || '-').replace(/"/g, '""')}"`,
        `"${interests || 'Belum Terdaftar'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Data_Siswa_SDN_275_Gresik_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('File rekap data siswa (CSV) berhasil diunduh.');
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pangkalan Data Siswa & Pemetaan Minat Bakat Awal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Entry & Manajemen Data Siswa Terpadu
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Kelola data pokok siswa UPT SD Negeri 275 Gresik (NISN, kelas, kontak wali, profil bakat). Data siswa yang di-entry di sini dapat <strong>ditarik secara langsung</strong> untuk mendaftar ke ekstrakurikuler dan program pembinaan prestasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Entry Siswa Baru</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition cursor-pointer"
              title="Unduh data siswa ke format CSV/Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Unduh Rekap</span>
            </button>
          </div>
        </div>

        {isStudent && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50/95 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Mode Peninjau Siswa: Anda dapat melihat seluruh direktori siswa, sebaran kelas, dan pemetaan bakat ekstrakurikuler. Hak akses penambahan dan pengeditan data siswa dikelola oleh Kepala Sekolah dan Guru.
            </span>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Murid Terdata</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Siswa aktif SDN 275</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Ikut Ekstrakurikuler</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{enrolledStudentsCount}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {enrollmentRate}% terfasilitasi bakat
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Belum Ikut Ekstra</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{unenrolledStudentsCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">
              Siap ditarik & diarahkan
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Program Ekstra</div>
            <div className="text-2xl font-black text-sky-700 mt-1">{extracurriculars.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pilihan klub aktif</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Panel Angkatan & Rotasi Tahun Siswa (2024 - 2026) Secara Bergantian */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <CalendarDays className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-800">
                Data Angkatan & Tahun Masuk Siswa (2024 - 2026)
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pilih tab tahun di bawah atau klik <strong>"Ganti Tahun Bergantian"</strong> untuk rotasi siklus 2024 ➔ 2025 ➔ 2026.
            </p>
          </div>

          {/* Quick Alternating Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCycleYear}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
              title="Putar tahun bergantian (2024 ➔ 2025 ➔ 2026 ➔ 2024)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Ganti Tahun Bergantian</span>
            </button>

            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={handlePrevYear}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                title="Tahun Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold px-2 text-slate-700">
                {selectedYear === 'all' ? 'Semua Tahun' : `Thn ${selectedYear}`}
              </span>
              <button
                type="button"
                onClick={handleNextYear}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                title="Tahun Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Year Cohort Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setSelectedYear('all');
              triggerToast('Menampilkan data seluruh angkatan siswa (2024 - 2026).');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              selectedYear === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>Semua Tahun (2024-2026)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedYear === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalStudents}
            </span>
          </button>

          {TAHUN_LIST.map((year) => {
            const info = YEAR_DETAILS[year];
            const isSelected = selectedYear === year;
            const count = studentsByYear[year] || 0;

            return (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setSelectedYear(year);
                  triggerToast(`Menampilkan data siswa ${info.label} (${info.ta})`);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  isSelected
                    ? `${info.pillActiveBg} border-transparent shadow-xs`
                    : `${info.badgeBg} hover:opacity-90 ${info.badgeText} ${info.badgeBorder}`
                }`}
              >
                <span>{info.label}</span>
                <span className="text-[10px] opacity-80">({info.ta})</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-800 shadow-xs'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cohort Highlight Card when specific year is active */}
        {selectedYear !== 'all' && (
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${YEAR_DETAILS[selectedYear].badgeBg} ${YEAR_DETAILS[selectedYear].badgeBorder}`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs text-slate-900">
                  {YEAR_DETAILS[selectedYear].label} ({YEAR_DETAILS[selectedYear].ta})
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {studentsByYear[selectedYear] || 0} Siswa Terdata
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {YEAR_DETAILS[selectedYear].desc}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isManager && (
                <button
                  type="button"
                  onClick={() => {
                    setAddTahunMasuk(selectedYear);
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Entry Siswa Th. {selectedYear}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedYear('all')}
                className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-xs font-medium cursor-pointer"
              >
                Tampilkan Semua
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama murid, NISN, wali, atau minat..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kelas */}
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kelas</option>
              {KELAS_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            {/* Filter Status Ekstra */}
            <select
              value={filterStatusEkstra}
              onChange={(e) => setFilterStatusEkstra(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status Ekstra</option>
              <option value="terdaftar">Sudah Ikut Ekstra</option>
              <option value="belum">Belum Ikut Ekstra</option>
            </select>

            {/* Filter Gender */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Gender</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>

            {/* Toggle Table/Card View */}
            <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                Tabel
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Kartu"
              >
                Kartu
              </button>
            </div>
          </div>
        </div>

        {/* Active filter tags */}
        {(filterKelas !== 'all' || filterStatusEkstra !== 'all' || filterGender !== 'all' || searchTerm) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
            <span>Filter aktif:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px]">
                Cari: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}>×</button>
              </span>
            )}
            {filterKelas !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                {filterKelas}
                <button onClick={() => setFilterKelas('all')}>×</button>
              </span>
            )}
            {filterStatusEkstra !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px]">
                {filterStatusEkstra === 'terdaftar' ? 'Sudah Ikut Ekstra' : 'Belum Ikut Ekstra'}
                <button onClick={() => setFilterStatusEkstra('all')}>×</button>
              </span>
            )}
            {filterGender !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px]">
                {filterGender === 'L' ? 'Laki-laki' : 'Perempuan'}
                <button onClick={() => setFilterGender('all')}>×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterKelas('all');
                setFilterStatusEkstra('all');
                setFilterGender('all');
              }}
              className="text-xs text-rose-600 hover:underline ml-1 font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Student Data Section */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Tidak Ada Data Siswa yang Cocok</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto mt-1 mb-4">
            Tidak ditemukan siswa dengan kriteria filter saat ini. Coba sesuaikan kata kunci pencarian atau filter tahun masuk.
          </p>
          {isManager && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Entry Siswa Baru</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="text-xs font-bold text-slate-700">
              Menampilkan <span className="text-emerald-700 font-extrabold">{filteredStudents.length}</span> dari {totalStudents} data murid
            </div>
            <div className="text-[11px] text-slate-500">
              *Klik tombol <strong>"Daftarkan Ekstra"</strong> untuk menarik data siswa langsung ke minat
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Murid & NISN</th>
                  <th className="py-3 px-3">Kelas & Gender</th>
                  <th className="py-3 px-3">Wali Murid / Kontak</th>
                  <th className="py-3 px-4">Minat / Potensi Bakat</th>
                  <th className="py-3 px-4">Status Ekstrakurikuler</th>
                  <th className="py-3 px-4 text-center">Aksi / Tarik Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const enrollments = studentEnrollmentsMap.get(student.id) || [];
                  const isEnrolled = enrollments.length > 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition group">
                      {/* Murid & NISN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              student.jenis_kelamin === 'P'
                                ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {student.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{student.nama}</span>
                              {(() => {
                                const yr = student.tahun_masuk || 2024;
                                const yrInfo = YEAR_DETAILS[yr] || YEAR_DETAILS[2024];
                                return (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedYear(yr);
                                      triggerToast(`Filter aktif: Data Siswa ${yrInfo.label}`);
                                    }}
                                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] border cursor-pointer ${yrInfo.badgeBg} ${yrInfo.badgeText} ${yrInfo.badgeBorder} hover:opacity-80 transition`}
                                    title={`Tahun Masuk ${yr} (${yrInfo.ta}). Klik untuk filter tahun ini.`}
                                  >
                                    Thn {yr}
                                  </button>
                                );
                              })()}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>NISN: <strong className="text-slate-700">{student.nip_nisn || '-'}</strong></span>
                              <span>•</span>
                              <span className="text-slate-400">@{student.username}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kelas & Gender */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-block text-[11px]">
                          {student.kelas || 'Belum diatur'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {student.jenis_kelamin === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}
                        </div>
                      </td>

                      {/* Wali Murid */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">
                          {student.nama_ortu || 'Wali Murid'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{student.wa_ortu || student.nomor_wa || '-'}</span>
                        </div>
                      </td>

                      {/* Minat Utama & Bakat */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 text-xs">
                          {student.minat_utama || 'Belum dipetakan'}
                        </div>
                        {student.catatan_bakat && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={student.catatan_bakat}>
                            {student.catatan_bakat}
                          </p>
                        )}
                      </td>

                      {/* Status Ekstrakurikuler */}
                      <td className="py-3.5 px-4">
                        {isEnrolled ? (
                          <div className="space-y-1">
                            {enrollments.map((interest) => (
                              <div
                                key={interest.id}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg"
                              >
                                <CheckCircle2 className="w-3 h-3 text-sky-600 shrink-0" />
                                <span className="truncate">{interest.ekstra_nama}</span>
                                {interest.persetujuan_ortu ? (
                                  <span className="text-[10px] text-emerald-700 ml-auto font-normal">
                                    ✓ Izin Ortu
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-600 ml-auto font-normal">
                                    Menunggu
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                            <Clock className="w-3 h-3" />
                            <span>Belum Terdaftar</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        {isManager ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEnrollModal(student)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                              title="Tarik data siswa ini untuk mendaftar ke ekstrakurikuler"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Daftarkan Ekstra</span>
                            </button>

                            <button
                              onClick={() => openEditModal(student)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Edit Data Siswa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeletingStudent(student)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus Data Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Siswa Aktif
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const enrollments = studentEnrollmentsMap.get(student.id) || [];
            const isEnrolled = enrollments.length > 0;

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                          student.jenis_kelamin === 'P'
                            ? 'bg-pink-100 text-pink-700 border border-pink-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {student.nama.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">
                          {student.nama}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          NISN: <strong>{student.nip_nisn || '-'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-xs">
                        {student.kelas || 'SDN 275'}
                      </span>
                      {(() => {
                        const yr = student.tahun_masuk || 2024;
                        const yrInfo = YEAR_DETAILS[yr] || YEAR_DETAILS[2024];
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedYear(yr);
                              triggerToast(`Filter aktif: Data Siswa ${yrInfo.label}`);
                            }}
                            className={`font-bold text-[10px] px-2 py-0.5 rounded-md border cursor-pointer ${yrInfo.badgeBg} ${yrInfo.badgeText} ${yrInfo.badgeBorder} hover:opacity-80 transition`}
                            title={`Tahun Masuk ${yr} (${yrInfo.ta}). Klik untuk filter.`}
                          >
                            Thn {yr}
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Biodata Mini */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Gender:</span>
                      <span className="font-medium">
                        {student.jenis_kelamin === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Wali Murid:</span>
                      <span className="font-medium truncate max-w-[150px]">
                        {student.nama_ortu || 'Wali Siswa'}
                      </span>
                    </div>
                    {student.wa_ortu && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">WhatsApp Wali:</span>
                        <span className="font-mono text-[11px] text-emerald-700">
                          {student.wa_ortu}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Minat & Potensi */}
                  <div className="mb-3">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Minat & Potensi Bakat Awal:</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1.5 rounded-xl">
                      {student.minat_utama || 'Belum ditentukan'}
                    </p>
                    {student.catatan_bakat && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        "{student.catatan_bakat}"
                      </p>
                    )}
                  </div>

                  {/* Ekstrakurikuler Status */}
                  <div className="mb-4">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Ekstrakurikuler Diikuti:
                    </div>
                    {isEnrolled ? (
                      <div className="space-y-1">
                        {enrollments.map((interest) => (
                          <div
                            key={interest.id}
                            className="flex items-center justify-between text-xs px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-medium"
                          >
                            <span className="truncate">{interest.ekstra_nama}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                interest.persetujuan_ortu
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {interest.persetujuan_ortu ? 'Disetujui' : 'Menunggu'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Belum terdaftar di ekstrakurikuler manapun</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isManager ? (
                    <>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Profil Murid"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Murid"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => openEnrollModal(student)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Daftarkan Ekstra</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-[11px] text-slate-500">
                      <span>Tahun Masuk: <strong>{student.tahun_masuk || 2024}</strong></span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Terverifikasi
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Tambah Siswa Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Entry Data Siswa Baru</h3>
                  <p className="text-xs text-slate-500">
                    Pangkalan Data Pokok Siswa UPT SD Negeri 275 Gresik
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Pilihan Tahun Masuk / Angkatan Siswa (2024 - 2026) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Tahun Masuk / Angkatan Siswa <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCycleAddYear}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition cursor-pointer"
                    title="Ganti tahun masuk secara bergantian (2024 ➔ 2025 ➔ 2026 ➔ 2024)"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Ganti Tahun Bergantian</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {TAHUN_LIST.map((year) => {
                    const info = YEAR_DETAILS[year];
                    const isSelected = addTahunMasuk === year;

                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setAddTahunMasuk(year)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white border-emerald-500 ring-2 ring-emerald-400/40 shadow-xs'
                            : 'bg-white/70 hover:bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black ${
                              isSelected ? 'text-emerald-700' : 'text-slate-800'
                            }`}
                          >
                            {year}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-1">
                          {info.ta}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  *Terpilih: <strong>Tahun {addTahunMasuk} ({YEAR_DETAILS[addTahunMasuk].ta})</strong> — {YEAR_DETAILS[addTahunMasuk].desc}
                </p>
              </div>

              {/* Row 1: Nama Lengkap & NISN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addNama}
                    onChange={(e) => setAddNama(e.target.value)}
                    placeholder="Contoh: Bima Aditya Saputra"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NISN (Nomor Induk Siswa Nasional) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addNisn}
                    onChange={(e) => setAddNisn(e.target.value)}
                    placeholder="10 digit angka, contoh: 0123456795"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Rombel Kelas & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rombongan Belajar (Kelas) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addKelas}
                    onChange={(e) => setAddKelas(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {KELAS_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-3 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="addGender"
                        value="L"
                        checked={addGender === 'L'}
                        onChange={() => setAddGender('L')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Laki-laki (L)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="addGender"
                        value="P"
                        checked={addGender === 'P'}
                        onChange={() => setAddGender('P')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Perempuan (P)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 3: Tempat & Tanggal Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={addTempatLahir}
                    onChange={(e) => setAddTempatLahir(e.target.value)}
                    placeholder="Contoh: Gresik"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={addTanggalLahir}
                    onChange={(e) => setAddTanggalLahir(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 4: Nama Orang Tua & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={addNamaOrtu}
                    onChange={(e) => setAddNamaOrtu(e.target.value)}
                    placeholder="Contoh: Bpk. Joko Santoso"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp Wali Murid (Untuk Izin Ekstra)
                  </label>
                  <input
                    type="tel"
                    value={addWaOrtu}
                    onChange={(e) => setAddWaOrtu(e.target.value)}
                    placeholder="Contoh: 085712345678"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Alamat Domisili */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat / Domisili
                </label>
                <input
                  type="text"
                  value={addAlamat}
                  onChange={(e) => setAddAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Panglima Sudirman No. 18, Gresik"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Row 6: Minat & Potensi Bakat Awal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minat / Potensi Bakat Utama Awal
                </label>
                <select
                  value={addMinatUtama}
                  onChange={(e) => setAddMinatUtama(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white mb-2"
                >
                  {PRESET_MINAT.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Observasi Bakat Guru (Opsional)
                </label>
                <textarea
                  value={addCatatanBakat}
                  onChange={(e) => setAddCatatanBakat(e.target.value)}
                  rows={2}
                  placeholder="Catatan kelebihan, kegemaran, atau portofolio awal anak..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Fitur Quick Pull: Langsung Daftarkan ke Ekstrakurikuler */}
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addAutoRegisterEkstra}
                    onChange={(e) => setAddAutoRegisterEkstra(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-900">
                    Tarik langsung data siswa ini untuk mendaftar Ekstrakurikuler
                  </span>
                </label>

                {addAutoRegisterEkstra && (
                  <div className="pl-6 pt-1 space-y-1">
                    <label className="block text-[11px] font-semibold text-emerald-800">
                      Pilih Program Ekstrakurikuler SDN 275:
                    </label>
                    <select
                      value={addSelectedEkstraId}
                      onChange={(e) => setAddSelectedEkstraId(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-emerald-300 bg-white font-medium"
                    >
                      {extracurriculars.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nama_ekstra} ({e.kategori === 'akademik' ? 'Akademik' : 'Non-Akademik'}) - Pembina: {e.pembina_nama}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? 'Menyimpan...' : 'Simpan Siswa Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Data Siswa */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Data Siswa</h3>
                  <p className="text-xs text-slate-500">
                    Memperbarui data siswa: <strong>{editingStudent.nama}</strong> (@{editingStudent.username})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Pilihan Tahun Masuk / Angkatan Siswa (2024 - 2026) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Tahun Masuk / Angkatan Siswa <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditTahunMasuk((prev) => (prev === 2024 ? 2025 : prev === 2025 ? 2026 : 2024))
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition cursor-pointer"
                    title="Ganti tahun masuk secara bergantian (2024 ➔ 2025 ➔ 2026 ➔ 2024)"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Ganti Tahun Bergantian</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {TAHUN_LIST.map((year) => {
                    const info = YEAR_DETAILS[year];
                    const isSelected = editTahunMasuk === year;

                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setEditTahunMasuk(year)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white border-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                            : 'bg-white/70 hover:bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black ${
                              isSelected ? 'text-amber-700' : 'text-slate-800'
                            }`}
                          >
                            {year}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-1">
                          {info.ta}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  *Terpilih: <strong>Tahun {editTahunMasuk} ({YEAR_DETAILS[editTahunMasuk].ta})</strong> — {YEAR_DETAILS[editTahunMasuk].desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NISN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNisn}
                    onChange={(e) => setEditNisn(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas / Rombel
                  </label>
                  <select
                    value={editKelas}
                    onChange={(e) => setEditKelas(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {KELAS_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="editGender"
                        value="L"
                        checked={editGender === 'L'}
                        onChange={() => setEditGender('L')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Laki-laki (L)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="editGender"
                        value="P"
                        checked={editGender === 'P'}
                        onChange={() => setEditGender('P')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Perempuan (P)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={editNamaOrtu}
                    onChange={(e) => setEditNamaOrtu(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Wali Murid
                  </label>
                  <input
                    type="tel"
                    value={editWaOrtu}
                    onChange={(e) => setEditWaOrtu(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minat / Potensi Bakat Utama
                </label>
                <input
                  type="text"
                  value={editMinatUtama}
                  onChange={(e) => setEditMinatUtama(e.target.value)}
                  placeholder="Contoh: Robotika STEM & Eksperimen Sains"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Observasi Bakat Guru
                </label>
                <textarea
                  value={editCatatanBakat}
                  onChange={(e) => setEditCatatanBakat(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ganti Password Akun (Kosongkan jika tidak diubah)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Password baru..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit ? 'Memperbarui...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tarik & Daftarkan Siswa ke Ekstrakurikuler */}
      {enrollingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Tarik Siswa ke Ekstrakurikuler
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pendaftaran minat & talenta murid SDN 275
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEnrollingStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student preview card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  enrollingStudent.jenis_kelamin === 'P'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {enrollingStudent.nama.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">
                  {enrollingStudent.nama} ({enrollingStudent.kelas || 'Siswa SDN 275'})
                </div>
                <div className="text-[11px] text-slate-500">
                  NISN: <span className="font-mono text-slate-700">{enrollingStudent.nip_nisn}</span> • Minat: {enrollingStudent.minat_utama || 'Umum'}
                </div>
              </div>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Ekstrakurikuler yang Akan Didaftarkan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={enrollEkstraId}
                  onChange={(e) => setEnrollEkstraId(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  {extracurriculars.map((ekstra) => {
                    const isAlreadyIn = (studentEnrollmentsMap.get(enrollingStudent.id) || []).some(
                      (si) => si.ekstra_id === ekstra.id
                    );
                    return (
                      <option key={ekstra.id} value={ekstra.id} disabled={isAlreadyIn}>
                        {ekstra.nama_ekstra} ({ekstra.kategori === 'akademik' ? 'Akademik' : 'Non-Akademik'})
                        {isAlreadyIn ? ' - [SUDAH TERDAFTAR]' : ` - Pembina: ${ekstra.pembina_nama}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Ekstra selected details */}
              {(() => {
                const selected = extracurriculars.find((e) => e.id === enrollEkstraId);
                if (!selected) return null;
                return (
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pembina:</span>
                      <strong className="text-slate-900">{selected.pembina_nama}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jadwal & Ruang:</span>
                      <span>{selected.jadwal} ({selected.ruang})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Efisiensi Biaya Mandiri:</span>
                      <span className="font-semibold text-emerald-800">
                        Hemat Rp {(selected.biaya_efisiensi || 0).toLocaleString('id-ID')}/bln (Pelatih Internal Guru)
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Motivasi / Bimbingan Guru (Opsional)
                </label>
                <textarea
                  value={enrollCatatan}
                  onChange={(e) => setEnrollCatatan(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Siswa memiliki ketertarikan tinggi pada eksperimen sains dan diarahkan untuk OSN..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enrollConsent}
                    onChange={(e) => setEnrollConsent(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">Status Izin Orang Tua / Wali</span>
                    <p className="text-[11px] text-slate-500">
                      Tandai jika wali murid sudah memberikan persetujuan lisan/tulisan.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEnrollingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEnroll}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEnroll ? 'Mendaftarkan...' : 'Konfirmasi Pendaftaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Siswa */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Hapus Data Siswa?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Apakah Anda yakin ingin menghapus data murid <strong>"{deletingStudent.nama}"</strong> (NISN: {deletingStudent.nip_nisn})? Riwayat pendaftaran ekstrakurikuler terkait siswa ini juga akan dibersihkan.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
