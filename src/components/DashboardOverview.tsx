import React from 'react';
import {
  Users,
  Award,
  BookOpen,
  TrendingUp,
  Wallet,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import {
  User,
  TeacherAsset,
  Extracurricular,
  StudentInterest,
  MentoringLog,
  Achievement,
  FeedbackSummary,
} from '../types';
import { SchoolLogo } from './SchoolLogo';

interface DashboardOverviewProps {
  currentUser: User;
  teacherAssets: TeacherAsset[];
  extracurriculars: Extracurricular[];
  studentInterests: StudentInterest[];
  mentoringLogs: MentoringLog[];
  achievements: Achievement[];
  feedbackSummary: FeedbackSummary;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  teacherAssets,
  extracurriculars,
  studentInterests,
  mentoringLogs,
  achievements,
  feedbackSummary,
  onNavigateTab,
}) => {
  // Budget efficiency calculation
  const totalEfficiency = extracurriculars.reduce(
    (acc, curr) => acc + (curr.biaya_efisiensi || 0),
    0
  );
  const formattedEfficiency = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalEfficiency);

  // Stats calculation
  const verifiedTeachers = teacherAssets.filter((t) => t.status_konfirmasi).length;
  const approvedInterests = studentInterests.filter((s) => s.persetujuan_ortu).length;
  const deepLearningCount = mentoringLogs.length;
  const supervisedLogs = mentoringLogs.filter((l) => l.status_supervisi).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Sistem Informasi SI-PASTI UPT SD Negeri 275 Gresik</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Selamat Datang, {currentUser.nama}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Optimalisasi talenta guru internal untuk mendongkrak minat bakat dan prestasi peserta didik
                berbasis model pembelajaran mendalam (<em>Deep Learning: Memahami, Mengaplikasi, Merefleksi</em>).
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 shadow-inner shrink-0 self-center">
              <SchoolLogo size="xl" glow />
              <span className="text-[10px] font-bold text-emerald-200 tracking-wider mt-1.5 uppercase">UPT SDN 275</span>
            </div>
          </div>

          {/* Quick Context Action */}
          <div className="mt-5 flex flex-wrap gap-3">
            {(currentUser.role === 'kepala_sekolah' || currentUser.role === 'guru') && (
              <>
                <button
                  id="action-manage-teacher"
                  onClick={() => onNavigateTab('teacher-assets')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Aset Guru & GTK</span>
                </button>
                <button
                  id="action-manage-students"
                  onClick={() => onNavigateTab('students')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-200" />
                  <span>Kelola Siswa</span>
                </button>
                <button
                  id="action-manage-logs"
                  onClick={() => onNavigateTab('mentoring-logs')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-emerald-200" />
                  <span>Jurnal & Supervisi</span>
                </button>
                <button
                  id="action-manage-achievements"
                  onClick={() => onNavigateTab('achievements')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Award className="w-4 h-4 text-emerald-200" />
                  <span>Input Prestasi</span>
                </button>
              </>
            )}

            {currentUser.role === 'murid' && (
              <>
                <button
                  id="action-murid-feedback"
                  onClick={() => onNavigateTab('feedback')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-extrabold transition shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-900" />
                  <span>Isi Survei Umpan Balik Murid</span>
                </button>
                <button
                  id="action-murid-ekstra"
                  onClick={() => onNavigateTab('extracurriculars')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-200" />
                  <span>Lihat Ekstrakurikuler</span>
                </button>
                <button
                  id="action-murid-prestasi"
                  onClick={() => onNavigateTab('achievements')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Award className="w-4 h-4 text-emerald-200" />
                  <span>Lihat Prestasi Siswa</span>
                </button>
              </>
            )}

            {currentUser.role === 'orang_tua' && (
              <button
                id="action-ortu-consent"
                onClick={() => onNavigateTab('extracurriculars')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verifikasi Persetujuan Ekstra Anak</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Guru Internal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aset Guru Terpetakan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {teacherAssets.length} <span className="text-sm font-normal text-slate-500">Guru</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{verifiedTeachers} Disahkan Kepala Sekolah</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Ekstra Aktif & Murid */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ekstrakurikuler Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {extracurriculars.length} <span className="text-sm font-normal text-slate-500">Klub Minat</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-700 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>{approvedInterests} Murid Terbina Aktif</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Prestasi Kejuaraan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Prestasi Diraih
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {achievements.length} <span className="text-sm font-normal text-slate-500">Kejuaraan</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tingkat Kecamatan & Kab. Gresik</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Efisiensi Anggaran BOS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Efisiensi Anggaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-800">
              {formattedEfficiency}
              <span className="text-xs font-normal text-slate-500">/bln</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600">
              <span>Substitusi pelatih luar via aset internal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Deep Learning Concept Card & Latest Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deep Learning 3 Modalities Pillar */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <span>Penerapan Moda Deep Learning Pembimbingan</span>
              </h2>
              <p className="text-xs text-slate-500">
                Tiga pilar pedagogik dalam setiap sesi pembimbingan ekstrakurikuler di SDN 275 Gresik
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('mentoring-logs')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Logbook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Moda 1: Memahami */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Moda 1
                  </span>
                  <span className="text-xs font-bold text-blue-900">Mindful</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Memahami</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Menanamkan konsep mendasar, filosofi, dan logika esensial sehingga murid mengerti esensi materi tanpa hafalan pasif.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200/60 text-[11px] text-blue-900 font-medium">
                {mentoringLogs.filter((l) => l.moda_pembelajaran === 'memahami').length} Sesi Terlaksana
              </div>
            </div>

            {/* Moda 2: Mengaplikasi */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Moda 2
                  </span>
                  <span className="text-xs font-bold text-emerald-900">Meaningful</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Mengaplikasi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Eksperimen langsung, uji coba karya, latihan gerak tari berulang, dan problem solving berbasis tantangan nyata.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
                {mentoringLogs.filter((l) => l.moda_pembelajaran === 'mengaplikasi').length} Sesi Terlaksana
              </div>
            </div>

            {/* Moda 3: Merefleksi */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                    Moda 3
                  </span>
                  <span className="text-xs font-bold text-purple-900">Joyful</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Merefleksi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mengevaluasi hasil karya, berdiskusi mengenai kekurangan, menanamkan growth mindset dan daya juang belajar.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-200/60 text-[11px] text-purple-900 font-medium">
                {mentoringLogs.filter((l) => l.moda_pembelajaran === 'merefleksi').length} Sesi Terlaksana
              </div>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-slate-700">
                Status Supervisi Instruksional Kepala Sekolah: <strong>{supervisedLogs} dari {deepLearningCount} Jurnal Telah Disupervisi</strong>
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('mentoring-logs')}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Buka Supervisi
            </button>
          </div>
        </div>

        {/* Stakeholder Satisfaction Summary Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Umpan Balik Pemangku Kepentingan</h2>
              <div className="flex items-center text-amber-500 font-bold text-sm gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{feedbackSummary.rerata_kepuasan.toFixed(1)} / 5.0</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Rekapitulasi kepuasan murid, orang tua siswa, dan guru pembina UPT SDN 275 Gresik
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Responden Murid</span>
                <span className="font-semibold text-slate-900">
                  {feedbackSummary.distribusi_peran.murid} tanggapan
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Responden Orang Tua / Wali</span>
                <span className="font-semibold text-slate-900">
                  {feedbackSummary.distribusi_peran.orang_tua} tanggapan
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Responden Guru Pembina</span>
                <span className="font-semibold text-slate-900">
                  {feedbackSummary.distribusi_peran.guru} tanggapan
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
              <div className="font-semibold text-emerald-950 mb-0.5">Aspek Terbaik Dinilai:</div>
              <div className="text-emerald-800">{feedbackSummary.aspek_tertinggi}</div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('feedback')}
            className="mt-4 w-full py-2.5 px-4 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Buka Seluruh Masukan & Survei</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 3: Prestasi Terkini Highlight & Daftar Ekstrakurikuler Pilihan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prestasi Terkini */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Raihan Prestasi Murid Terkini</span>
            </h2>
            <button
              onClick={() => onNavigateTab('achievements')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Lihat Semua ({achievements.length})
            </button>
          </div>

          <div className="space-y-3">
            {achievements.slice(0, 4).map((ach) => (
              <div
                key={ach.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition bg-slate-50/50 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ach.tingkat === 'kabupaten'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : ach.tingkat === 'kecamatan'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {ach.tingkat}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {ach.capaian}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{ach.nama_lomba}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ach.murid_nama} ({ach.kelas || 'Siswa'}) • {ach.ekstra_nama}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {ach.tanggal_kegiatan}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Katalog Ekstra Unggulan */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <span>Ekstrakurikuler Berbasis Aset Internal</span>
            </h2>
            <button
              onClick={() => onNavigateTab('extracurriculars')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Katalog Lengkap
            </button>
          </div>

          <div className="space-y-3">
            {extracurriculars.slice(0, 4).map((ekstra) => (
              <div
                key={ekstra.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ekstra.kategori === 'akademik'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ekstra.kategori}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {ekstra.jumlah_peserta} / {ekstra.kuota || 25} Murid
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mt-1">{ekstra.nama_ekstra}</h3>
                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                  Pembina: <span className="font-semibold text-emerald-800">{ekstra.pembina_nama}</span> • {ekstra.jadwal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
