export type UserRole = 'kepala_sekolah' | 'guru' | 'murid' | 'orang_tua';

export interface User {
  id: number;
  nama: string;
  username: string;
  password_hash: string;
  role: UserRole;
  nip_nisn?: string;
  kelas?: string;
  anak_id?: number; // Relasi murid untuk orang tua
  foto_url?: string;
  nomor_wa?: string;
  jabatan?: string;
  email?: string;
  jenis_kelamin?: 'L' | 'P';
  tanggal_lahir?: string;
  tempat_lahir?: string;
  alamat?: string;
  nama_ortu?: string;
  wa_ortu?: string;
  minat_utama?: string;
  catatan_bakat?: string;
  tahun_masuk?: number; // 2024, 2025, 2026
}

export interface TeacherAsset {
  id: number;
  user_id: number;
  latar_belakang_pendidikan: string;
  keahlian_khusus: string;
  catatan_konfirmasi_ks: string;
  status_konfirmasi: boolean;
  nama_guru?: string;
  nip?: string;
  komitmen_empati?: string;
  rekomendasi_ekstra?: string;
  bidang_sertifikasi?: string;
  updated_at?: string;
}

export interface Extracurricular {
  id: number;
  nama_ekstra: string;
  pembina_id: number;
  kategori: 'akademik' | 'non_akademik';
  deskripsi: string;
  pembina_nama?: string;
  jadwal?: string;
  ruang?: string;
  biaya_efisiensi?: number; // Efisiensi biaya pembinaan internal vs pelatih eksternal
  kuota?: number;
  jumlah_peserta?: number;
}

export interface StudentInterest {
  id: number;
  murid_id: number;
  ekstra_id: number;
  persetujuan_ortu: boolean;
  tanggal_daftar: string;
  murid_nama?: string;
  kelas?: string;
  ekstra_nama?: string;
  kategori_ekstra?: 'akademik' | 'non_akademik';
  pembina_nama?: string;
  catatan_ortu?: string;
  tanggal_persetujuan?: string;
}

export type ModaPembelajaran = 'memahami' | 'mengaplikasi' | 'merefleksi';

export interface MentoringLog {
  id: number;
  ekstra_id: number;
  pembina_id: number;
  murid_id: number;
  tanggal: string;
  moda_pembelajaran: ModaPembelajaran;
  catatan_kegiatan: string;
  catatan_supervisi_ks?: string;
  ekstra_nama?: string;
  pembina_nama?: string;
  murid_nama?: string;
  indikator_capaian?: string;
  status_supervisi?: boolean;
}

export type TingkatPrestasi = 'sekolah' | 'kecamatan' | 'kabupaten';

export interface Achievement {
  id: number;
  ekstra_id: number;
  murid_id: number;
  nama_lomba: string;
  tingkat: TingkatPrestasi;
  capaian: string; // Misal: Juara 1, Juara 2, Harapan 1, Medali Emas
  tanggal_kegiatan: string;
  ekstra_nama?: string;
  murid_nama?: string;
  kelas?: string;
  penyelenggara?: string;
  keterangan?: string;
}

export interface EvaluationFeedback {
  id: number;
  user_id: number;
  peran: 'murid' | 'orang_tua' | 'guru';
  isi_umpan_balik: string;
  created_at: string;
  user_nama?: string;
  rating?: number; // 1-5 bintang
  aspek_evaluasi?: string; // Misal: Kualitas Pembimbingan, Sarana Prasarana, Kemajuan Minat
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AchievementStats {
  total_prestasi: number;
  tingkat_kabupaten: number;
  tingkat_kecamatan: number;
  tingkat_sekolah: number;
  prestasi_per_ekstra: { [key: string]: number };
  prestasi_terbaru: Achievement[];
}

export interface FeedbackSummary {
  total_responden: number;
  rerata_kepuasan: number;
  distribusi_peran: {
    murid: number;
    orang_tua: number;
    guru: number;
  };
  aspek_tertinggi: string;
  daftar_masukan: EvaluationFeedback[];
}
