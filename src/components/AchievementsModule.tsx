import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Sparkles,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Calendar,
  Building,
  User,
  Edit,
  Trash2,
  Save,
  X,
  Info,
} from 'lucide-react';
import { Achievement, Extracurricular, StudentInterest, User as UserType } from '../types';

interface AchievementsModuleProps {
  currentUser: UserType;
  achievements: Achievement[];
  extracurriculars: Extracurricular[];
  studentInterests: StudentInterest[];
  onCreateAchievement: (data: {
    ekstra_id: number;
    murid_id: number;
    nama_lomba: string;
    tingkat: 'sekolah' | 'kecamatan' | 'kabupaten';
    capaian: string;
    tanggal_kegiatan: string;
    penyelenggara?: string;
    keterangan?: string;
  }) => Promise<void>;
  onUpdateAchievement?: (
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
  ) => Promise<void>;
  onDeleteAchievement?: (id: number) => Promise<void>;
}

export const AchievementsModule: React.FC<AchievementsModuleProps> = ({
  currentUser,
  achievements,
  extracurriculars,
  studentInterests,
  onCreateAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'sekolah' | 'kecamatan' | 'kabupaten'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for creating achievement
  const [ekstraId, setEkstraId] = useState<number>(extracurriculars[0]?.id || 1);
  const [muridId, setMuridId] = useState<number>(6);
  const [namaLomba, setNamaLomba] = useState('');
  const [tingkat, setTingkat] = useState<'sekolah' | 'kecamatan' | 'kabupaten'>('kecamatan');
  const [capaian, setCapaian] = useState('Juara 1');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [penyelenggara, setPenyelenggara] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for editing achievement
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editNamaLomba, setEditNamaLomba] = useState('');
  const [editTingkat, setEditTingkat] = useState<'sekolah' | 'kecamatan' | 'kabupaten'>('kecamatan');
  const [editCapaian, setEditCapaian] = useState('');
  const [editEkstraId, setEditEkstraId] = useState<number>(1);
  const [editMuridId, setEditMuridId] = useState<number>(6);
  const [editTanggal, setEditTanggal] = useState('');
  const [editPenyelenggara, setEditPenyelenggara] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculations
  const kabCount = achievements.filter((a) => a.tingkat === 'kabupaten').length;
  const kecCount = achievements.filter((a) => a.tingkat === 'kecamatan').length;
  const sekCount = achievements.filter((a) => a.tingkat === 'sekolah').length;

  const filtered = achievements.filter((item) => {
    const matchesLevel = filterLevel === 'all' || item.tingkat === filterLevel;
    const matchesSearch =
      item.nama_lomba.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.murid_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ekstra_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.capaian.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLomba.trim() || !capaian.trim()) {
      alert('Nama lomba dan capaian kejuaraan wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateAchievement({
        ekstra_id: Number(ekstraId),
        murid_id: Number(muridId),
        nama_lomba: namaLomba,
        tingkat,
        capaian,
        tanggal_kegiatan: tanggal,
        penyelenggara,
        keterangan,
      });

      setSuccessMsg('Prestasi murid berhasil ditambahkan ke rekapitulasi sekolah!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowAddForm(false);
      setNamaLomba('');
      setPenyelenggara('');
      setKeterangan('');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan prestasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (ach: Achievement) => {
    setEditingAchievement(ach);
    setEditNamaLomba(ach.nama_lomba);
    setEditTingkat(ach.tingkat);
    setEditCapaian(ach.capaian);
    setEditEkstraId(ach.ekstra_id);
    setEditMuridId(ach.murid_id);
    setEditTanggal(ach.tanggal_kegiatan);
    setEditPenyelenggara(ach.penyelenggara || '');
    setEditKeterangan(ach.keterangan || '');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAchievement || !onUpdateAchievement) return;

    try {
      setIsUpdating(true);
      await onUpdateAchievement(editingAchievement.id, {
        ekstra_id: Number(editEkstraId),
        murid_id: Number(editMuridId),
        nama_lomba: editNamaLomba,
        tingkat: editTingkat,
        capaian: editCapaian,
        tanggal_kegiatan: editTanggal,
        penyelenggara: editPenyelenggara,
        keterangan: editKeterangan,
      });
      setSuccessMsg(`Data prestasi "${editNamaLomba}" berhasil diperbarui!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setEditingAchievement(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui data prestasi.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (ach: Achievement) => {
    if (!onDeleteAchievement) return;
    const confirm = window.confirm(`Hapus catatan prestasi "${ach.nama_lomba}" (${ach.capaian})?`);
    if (!confirm) return;

    try {
      await onDeleteAchievement(ach.id);
      setSuccessMsg(`Data prestasi berhasil dihapus.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus data prestasi.');
    }
  };

  const getTingkatBadge = (level: string) => {
    switch (level) {
      case 'kabupaten':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'kecamatan':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const canManageAchievements = currentUser.role === 'guru' || currentUser.role === 'kepala_sekolah';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>Etalase Raihan Prestasi Siswa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Rekapitulasi Prestasi Murid UPT SDN 275 Gresik
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Dokumentasi terverifikasi keberhasilan bimbingan aset guru internal pada berbagai ajang
              kejuaraan tingkat sekolah, kecamatan, hingga kabupaten.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManageAchievements && (
              <button
                id="btn-add-achievement"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Input Prestasi Baru</span>
              </button>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {currentUser.role === 'murid' && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50/95 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Mode Peninjau Siswa: Anda dapat melihat seluruh galeri pencapaian prestasi dan piagam kejuaraan murid UPT SDN 275 Gresik. Penginputan dan pengeditan prestasi dikelola oleh Guru dan Kepala Sekolah.
            </span>
          </div>
        )}
      </div>

      {/* Form Input Prestasi Baru */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Formulir Pencatatan Prestasi Murid</span>
              </h2>
              <p className="text-xs text-slate-500">
                Catat raihan kejuaraan yang diperoleh murid dari hasil pembimbingan ekstrakurikuler.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Perlombaan / Festival <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaLomba}
                  onChange={(e) => setNamaLomba(e.target.value)}
                  placeholder="Contoh: Olimpiade Sains Nasional (OSN) Jenjang SD"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capaian Kejuaraan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={capaian}
                  onChange={(e) => setCapaian(e.target.value)}
                  placeholder="Contoh: Juara 1, Juara Harapan 2, Medali Perunggu"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkat Kejuaraan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={tingkat}
                  onChange={(e) => setTingkat(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="sekolah">Tingkat Sekolah</option>
                  <option value="kecamatan">Tingkat Kecamatan</option>
                  <option value="kabupaten">Tingkat Kabupaten</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ekstrakurikuler Pembina <span className="text-rose-500">*</span>
                </label>
                <select
                  value={ekstraId}
                  onChange={(e) => setEkstraId(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {extracurriculars.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nama_ekstra} ({e.pembina_nama})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Murid Berprestasi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={muridId}
                  onChange={(e) => setMuridId(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {studentInterests.map((si) => (
                    <option key={si.id} value={si.murid_id}>
                      {si.murid_nama} ({si.kelas})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  value={penyelenggara}
                  onChange={(e) => setPenyelenggara(e.target.value)}
                  placeholder="Contoh: Dinas Pendidikan Kab. Gresik, KKG IPA"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keterangan Tambahan / Deskripsi Karya
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={2}
                placeholder="Catatan singkat jalannya perlombaan, skor nilai, atau poin apresiasi juri..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Raihan Prestasi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Edit Prestasi */}
      {editingAchievement && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit className="w-5 h-5 text-emerald-700" />
                  <span>Edit Data Raihan Prestasi</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui nama kejuaraan, tingkat, capaian, atau siswa peraih prestasi.
                </p>
              </div>
              <button
                onClick={() => setEditingAchievement(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Perlombaan / Festival <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editNamaLomba}
                  onChange={(e) => setEditNamaLomba(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Capaian Kejuaraan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editCapaian}
                    onChange={(e) => setEditCapaian(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat Kejuaraan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editTingkat}
                    onChange={(e) => setEditTingkat(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="sekolah">Tingkat Sekolah</option>
                    <option value="kecamatan">Tingkat Kecamatan</option>
                    <option value="kabupaten">Tingkat Kabupaten</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ekstrakurikuler Pembina <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editEkstraId}
                    onChange={(e) => setEditEkstraId(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {extracurriculars.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nama_ekstra} ({e.pembina_nama})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Murid Peraih Prestasi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editMuridId}
                    onChange={(e) => setEditMuridId(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {studentInterests.map((si) => (
                      <option key={si.id} value={si.murid_id}>
                        {si.murid_nama} ({si.kelas})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penyelenggara</label>
                  <input
                    type="text"
                    value={editPenyelenggara}
                    onChange={(e) => setEditPenyelenggara(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea
                  value={editKeterangan}
                  onChange={(e) => setEditKeterangan(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(editingAchievement);
                    setEditingAchievement(null);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Prestasi</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAchievement(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterLevel === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Tingkat ({achievements.length})
          </button>
          <button
            onClick={() => setFilterLevel('kabupaten')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterLevel === 'kabupaten'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Kabupaten ({kabCount})
          </button>
          <button
            onClick={() => setFilterLevel('kecamatan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterLevel === 'kecamatan'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Kecamatan ({kecCount})
          </button>
          <button
            onClick={() => setFilterLevel('sekolah')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterLevel === 'sekolah'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sekolah ({sekCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari lomba, capaian, murid..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tabel Rekapitulasi Prestasi */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                <th className="py-3 px-3">Tingkat</th>
                <th className="py-3 px-3">Capaian Kejuaraan</th>
                <th className="py-3 px-3">Nama Perlombaan</th>
                <th className="py-3 px-3">Murid Peraih</th>
                <th className="py-3 px-3">Ekstrakurikuler</th>
                <th className="py-3 px-3">Penyelenggara</th>
                <th className="py-3 px-3">Tanggal</th>
                {canManageAchievements && (
                  <th className="py-3 px-3 text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ach) => (
                <tr key={ach.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTingkatBadge(
                        ach.tingkat
                      )}`}
                    >
                      {ach.tingkat}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-emerald-800">
                    <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {ach.capaian}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 max-w-xs">
                    {ach.nama_lomba}
                    {ach.keterangan && (
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        {ach.keterangan}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-medium">
                    <div>{ach.murid_nama}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{ach.kelas}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {ach.ekstra_nama}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {ach.penyelenggara || '-'}
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {ach.tanggal_kegiatan}
                  </td>
                  {canManageAchievements && (
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(ach)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer flex items-center gap-1"
                          title="Edit Catatan Prestasi"
                        >
                          <Edit className="w-3 h-3 text-slate-600" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
