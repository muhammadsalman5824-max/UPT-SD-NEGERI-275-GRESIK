import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Send,
  PlusCircle,
  MessageSquare,
  Sparkles,
  Filter,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { User, MentoringLog, Extracurricular, StudentInterest, ModaPembelajaran } from '../types';

interface MentoringLogsModuleProps {
  currentUser: User;
  mentoringLogs: MentoringLog[];
  extracurriculars: Extracurricular[];
  studentInterests: StudentInterest[];
  onCreateLog: (data: {
    ekstra_id: number;
    pembina_id: number;
    murid_id: number;
    tanggal: string;
    moda_pembelajaran: ModaPembelajaran;
    catatan_kegiatan: string;
    indikator_capaian?: string;
  }) => Promise<void>;
  onSuperviseLog: (id: number, catatan_supervisi_ks: string) => Promise<void>;
}

export const MentoringLogsModule: React.FC<MentoringLogsModuleProps> = ({
  currentUser,
  mentoringLogs,
  extracurriculars,
  studentInterests,
  onCreateLog,
  onSuperviseLog,
}) => {
  const isManager = currentUser.role === 'guru' || currentUser.role === 'kepala_sekolah';
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedEkstraId, setSelectedEkstraId] = useState<number>(
    extracurriculars[0]?.id || 1
  );
  const [selectedMuridId, setSelectedMuridId] = useState<number>(6);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [moda, setModa] = useState<ModaPembelajaran>('mengaplikasi');
  const [catatanKegiatan, setCatatanKegiatan] = useState('');
  const [indikator, setIndikator] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Supervisi state for Kepala Sekolah
  const [supervisingLogId, setSupervisingLogId] = useState<number | null>(null);
  const [catatanSupervisiInput, setCatatanSupervisiInput] = useState('');
  const [isSupervising, setIsSupervising] = useState(false);

  // Filter state
  const [filterModa, setFilterModa] = useState<'all' | ModaPembelajaran>('all');
  const [filterEkstra, setFilterEkstra] = useState<number | 'all'>('all');

  const filteredLogs = mentoringLogs.filter((log) => {
    const matchesModa = filterModa === 'all' || log.moda_pembelajaran === filterModa;
    const matchesEkstra = filterEkstra === 'all' || log.ekstra_id === filterEkstra;
    return matchesModa && matchesEkstra;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatanKegiatan.trim()) {
      alert('Mohon tuliskan catatan kegiatan pembimbingan.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateLog({
        ekstra_id: Number(selectedEkstraId),
        pembina_id: currentUser.id,
        murid_id: Number(selectedMuridId),
        tanggal,
        moda_pembelajaran: moda,
        catatan_kegiatan: catatanKegiatan,
        indikator_capaian: indikator,
      });

      setSuccessMsg('Jurnal pembimbingan Deep Learning berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setCatatanKegiatan('');
      setIndikator('');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan jurnal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuperviseSubmit = async (id: number) => {
    if (!catatanSupervisiInput.trim()) {
      alert('Catatan supervisi instruksional wajib diisi.');
      return;
    }

    try {
      setIsSupervising(true);
      await onSuperviseLog(id, catatanSupervisiInput);
      setSupervisingLogId(null);
      setCatatanSupervisiInput('');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan supervisi.');
    } finally {
      setIsSupervising(false);
    }
  };

  const getModaStyle = (m: ModaPembelajaran) => {
    switch (m) {
      case 'memahami':
        return {
          label: 'Moda Memahami (Mindful)',
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          border: 'border-l-blue-600',
        };
      case 'mengaplikasi':
        return {
          label: 'Moda Mengaplikasi (Meaningful)',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          border: 'border-l-emerald-600',
        };
      case 'merefleksi':
        return {
          label: 'Moda Merefleksi (Joyful / Growth)',
          badge: 'bg-purple-100 text-purple-900 border-purple-300',
          border: 'border-l-purple-600',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pedagogi Modern • Deep Learning</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Jurnal Pembimbingan Deep Learning & Supervisi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Pencatatan aktivitas pembimbingan terstruktur berdasarkan moda: <strong>Memahami</strong>,{' '}
              <strong>Mengaplikasi</strong>, dan <strong>Merefleksi</strong>, lengkap dengan pengawasan instruksional Kepala Sekolah.
            </p>
          </div>

          {isManager && (
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showLogForm ? 'Sembunyikan Form Jurnal' : 'Tulis Jurnal Harian Baru'}</span>
            </button>
          )}
        </div>

        {currentUser.role === 'murid' && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50/95 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Mode Peninjau Siswa: Anda dapat membaca catatan kegiatan pembimbingan Deep Learning (Memahami, Mengaplikasi, Merefleksi) dan catatan supervisi pimpinan sekolah. Pembuatan jurnal dan supervisi dikelola oleh Guru dan Kepala Sekolah.
            </span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Form Isian Jurnal Pembimbingan Deep Learning (Untuk Guru) */}
      {showLogForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Form Input Jurnal Pembimbingan Harian</span>
              </h2>
              <p className="text-xs text-slate-500">
                Pembina: <strong>{currentUser.nama}</strong> ({currentUser.role})
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Ekstrakurikuler <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEkstraId}
                  onChange={(e) => setSelectedEkstraId(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {extracurriculars.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nama_ekstra}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Murid yang Dibina <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedMuridId}
                  onChange={(e) => setSelectedMuridId(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {studentInterests.map((si) => (
                    <option key={si.id} value={si.murid_id}>
                      {si.murid_nama} ({si.kelas}) - {si.ekstra_nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Pilihan Radio Moda Deep Learning */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilihan Moda Pembelajaran Deep Learning <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Memahami */}
                <label
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    moda === 'memahami'
                      ? 'border-blue-600 bg-blue-50/70'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="moda"
                      value="memahami"
                      checked={moda === 'memahami'}
                      onChange={() => setModa('memahami')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-bold text-xs text-blue-950">1. Memahami</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-5">
                    Fokus penanaman konsep kunci, prinsip mendasar, dan penalaran materi.
                  </p>
                </label>

                {/* Mengaplikasi */}
                <label
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    moda === 'mengaplikasi'
                      ? 'border-emerald-600 bg-emerald-50/70'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="moda"
                      value="mengaplikasi"
                      checked={moda === 'mengaplikasi'}
                      onChange={() => setModa('mengaplikasi')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-xs text-emerald-950">2. Mengaplikasi</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-5">
                    Praktik langsung, uji coba karya, peragaan gerak tari, atau eksperimen saintifik.
                  </p>
                </label>

                {/* Merefleksi */}
                <label
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    moda === 'merefleksi'
                      ? 'border-purple-600 bg-purple-50/70'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="moda"
                      value="merefleksi"
                      checked={moda === 'merefleksi'}
                      onChange={() => setModa('merefleksi')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-bold text-xs text-purple-950">3. Merefleksi</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-5">
                    Evaluasi hasil, identifikasi kelemahan karya, dan penguatan growth mindset.
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Indikator Capaian Belajar / Target Sesi
              </label>
              <input
                type="text"
                value={indikator}
                onChange={(e) => setIndikator(e.target.value)}
                placeholder="Contoh: Murid mampu membuktikan massa jenis cairan mempengaruhi gaya apung"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Narasi Kegiatan Pembimbingan Harian <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={catatanKegiatan}
                onChange={(e) => setCatatanKegiatan(e.target.value)}
                rows={4}
                required
                placeholder="Uraikan alur pembimbingan mendalam, respon murid saat diajak bereksperimen, dan kendala yang dihadapi..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Tutup Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Jurnal Deep Learning'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Filter Moda:</span>
          <button
            onClick={() => setFilterModa('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterModa === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({mentoringLogs.length})
          </button>
          <button
            onClick={() => setFilterModa('memahami')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterModa === 'memahami'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Memahami
          </button>
          <button
            onClick={() => setFilterModa('mengaplikasi')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterModa === 'mengaplikasi'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Mengaplikasi
          </button>
          <button
            onClick={() => setFilterModa('merefleksi')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterModa === 'merefleksi'
                ? 'bg-purple-700 text-white'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Merefleksi
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Menampilkan <strong>{filteredLogs.length}</strong> Catatan Jurnal
        </div>
      </div>

      {/* Timeline List of Mentoring Logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const style = getModaStyle(log.moda_pembelajaran);
          const isSupervisingThis = supervisingLogId === log.id;

          return (
            <div
              key={log.id}
              className={`bg-white rounded-2xl p-5 border border-slate-200 border-l-4 ${style.border} shadow-xs transition hover:shadow-sm`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{log.ekstra_nama}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">Tanggal: {log.tanggal}</span>
                </div>

                <div>
                  {log.status_supervisi ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Telah Disupervisi Kepala Sekolah</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Menunggu Supervisi KS</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Subheader info */}
              <div className="text-xs text-slate-600 mb-3 flex flex-wrap gap-x-4 gap-y-1">
                <div>
                  Guru Pembina: <strong>{log.pembina_nama}</strong>
                </div>
                <div>
                  Murid Binaan: <strong>{log.murid_nama}</strong>
                </div>
              </div>

              {log.indikator_capaian && (
                <div className="mb-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <strong>Indikator:</strong> {log.indikator_capaian}
                </div>
              )}

              {/* Catatan Kegiatan */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                {log.catatan_kegiatan}
              </p>

              {/* Catatan Supervisi Kepala Sekolah */}
              {log.catatan_supervisi_ks && (
                <div className="mt-3 p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-sky-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-sky-700" />
                    <span>Catatan Instruksional & Supervisi Kepala Sekolah:</span>
                  </div>
                  <p className="text-sky-950 italic">"{log.catatan_supervisi_ks}"</p>
                </div>
              )}

              {/* Action for Kepala Sekolah or Guru to supervise */}
              {isManager && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  {!isSupervisingThis ? (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSupervisingLogId(log.id);
                          setCatatanSupervisiInput(log.catatan_supervisi_ks || '');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-300 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-700" />
                        <span>
                          {log.catatan_supervisi_ks ? 'Perbarui Supervisi' : 'Beri Supervisi Instruksional'}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2">
                      <label className="block text-xs font-bold text-sky-900">
                        Masukkan Catatan Instruksional & Saran Pembinaan:
                      </label>
                      <textarea
                        value={catatanSupervisiInput}
                        onChange={(e) => setCatatanSupervisiInput(e.target.value)}
                        rows={2}
                        placeholder="Berikan umpan balik positif atau arahan pedagogik kepada guru..."
                        className="w-full text-xs p-2 rounded-lg border border-sky-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSupervisingLogId(null)}
                          className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSuperviseSubmit(log.id)}
                          disabled={isSupervising}
                          className="px-4 py-1 rounded-lg bg-sky-700 text-white text-xs font-bold hover:bg-sky-800"
                        >
                          {isSupervising ? 'Menyimpan...' : 'Simpan Supervisi'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
