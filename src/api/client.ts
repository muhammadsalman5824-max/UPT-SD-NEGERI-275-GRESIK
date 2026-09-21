import {
  User,
  TeacherAsset,
  Extracurricular,
  StudentInterest,
  MentoringLog,
  Achievement,
  EvaluationFeedback,
  AchievementStats,
  FeedbackSummary,
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Auth
  async login(username: string, password?: string): Promise<{ token: string; role: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal masuk.');
    }
    return res.json();
  },

  async getMe(userId?: number, token?: string): Promise<User> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const url = userId ? `${API_BASE}/auth/me?user_id=${userId}` : `${API_BASE}/auth/me`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Gagal mengambil data profil');
    const data = await res.json();
    return data.user;
  },

  async getUsers(role?: string): Promise<User[]> {
    const url = role ? `${API_BASE}/auth/users?role=${role}` : `${API_BASE}/auth/users`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mengambil daftar pengguna');
    return res.json();
  },

  async updateUser(id: number, data: Partial<User> & { password?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memperbarui data pengguna');
    }
    const result = await res.json();
    return result.user;
  },

  async createUser(data: {
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
  }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menambahkan pengguna baru');
    }
    const result = await res.json();
    return result.user;
  },

  async deleteUser(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus pengguna');
    }
  },

  // Teacher Assets
  async getTeacherAssets(userId?: number): Promise<TeacherAsset[]> {
    const url = userId ? `${API_BASE}/teacher-assets?user_id=${userId}` : `${API_BASE}/teacher-assets`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mengambil data aset guru');
    return res.json();
  },

  async saveTeacherAsset(data: {
    user_id: number;
    latar_belakang_pendidikan: string;
    keahlian_khusus: string;
    komitmen_empati?: string;
    bidang_sertifikasi?: string;
    rekomendasi_ekstra?: string;
  }): Promise<TeacherAsset> {
    const res = await fetch(`${API_BASE}/teacher-assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan data aset guru');
    }
    const result = await res.json();
    return result.data;
  },

  async updateTeacherAsset(
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
  ): Promise<TeacherAsset> {
    const res = await fetch(`${API_BASE}/teacher-assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memperbarui data aset guru');
    }
    const result = await res.json();
    return result.data;
  },

  async confirmTeacherAsset(
    id: number,
    data: {
      catatan_konfirmasi_ks: string;
      status_konfirmasi: boolean;
      komitmen_empati?: string;
      rekomendasi_ekstra?: string;
    }
  ): Promise<TeacherAsset> {
    const res = await fetch(`${API_BASE}/teacher-assets/${id}/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan konfirmasi');
    }
    const result = await res.json();
    return result.data;
  },

  // Extracurriculars & Student Interests
  async getExtracurriculars(): Promise<Extracurricular[]> {
    const res = await fetch(`${API_BASE}/extracurriculars`);
    if (!res.ok) throw new Error('Gagal mengambil data ekstrakurikuler');
    return res.json();
  },

  async updateExtracurricular(
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
  ): Promise<Extracurricular> {
    const res = await fetch(`${API_BASE}/extracurriculars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memperbarui data ekstrakurikuler');
    }
    const result = await res.json();
    return result.data;
  },

  async deleteExtracurricular(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/extracurriculars/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus ekstrakurikuler');
    }
  },

  async getStudentInterests(muridId?: number, ekstraId?: number): Promise<StudentInterest[]> {
    const params = new URLSearchParams();
    if (muridId) params.append('murid_id', String(muridId));
    if (ekstraId) params.append('ekstra_id', String(ekstraId));
    const res = await fetch(`${API_BASE}/student-interests?${params.toString()}`);
    if (!res.ok) throw new Error('Gagal mengambil pendaftaran minat');
    return res.json();
  },

  async registerStudentInterest(data: {
    murid_id: number;
    ekstra_id: number;
    persetujuan_ortu?: boolean;
    catatan_ortu?: string;
  }): Promise<StudentInterest> {
    const res = await fetch(`${API_BASE}/student-interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mendaftarkan minat');
    }
    const result = await res.json();
    return result.data;
  },

  async updateParentConsent(
    id: number,
    data: { persetujuan_ortu: boolean; catatan_ortu?: string }
  ): Promise<StudentInterest> {
    const res = await fetch(`${API_BASE}/student-interests/${id}/parent-consent`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memperbarui persetujuan orang tua');
    }
    const result = await res.json();
    return result.data;
  },

  async updateStudentInterest(
    id: number,
    data: { ekstra_id?: number; catatan_ortu?: string; persetujuan_ortu?: boolean }
  ): Promise<StudentInterest> {
    const res = await fetch(`${API_BASE}/student-interests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memperbarui pendaftaran minat');
    }
    const result = await res.json();
    return result.data;
  },

  async deleteStudentInterest(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/student-interests/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal membatalkan pendaftaran minat');
    }
  },

  // Mentoring Logs (Deep Learning)
  async getMentoringLogs(filters?: { pembina_id?: number; murid_id?: number; ekstra_id?: number }): Promise<MentoringLog[]> {
    const params = new URLSearchParams();
    if (filters?.pembina_id) params.append('pembina_id', String(filters.pembina_id));
    if (filters?.murid_id) params.append('murid_id', String(filters.murid_id));
    if (filters?.ekstra_id) params.append('ekstra_id', String(filters.ekstra_id));

    const res = await fetch(`${API_BASE}/mentoring-logs?${params.toString()}`);
    if (!res.ok) throw new Error('Gagal mengambil data jurnal pembimbingan');
    return res.json();
  },

  async createMentoringLog(data: {
    ekstra_id: number;
    pembina_id: number;
    murid_id: number;
    tanggal: string;
    moda_pembelajaran: 'memahami' | 'mengaplikasi' | 'merefleksi';
    catatan_kegiatan: string;
    indikator_capaian?: string;
  }): Promise<MentoringLog> {
    const res = await fetch(`${API_BASE}/mentoring-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan logbook');
    }
    const result = await res.json();
    return result.data;
  },

  async superviseMentoringLog(id: number, catatan_supervisi_ks: string): Promise<MentoringLog> {
    const res = await fetch(`${API_BASE}/mentoring-logs/${id}/supervise`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catatan_supervisi_ks }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan supervisi');
    }
    const result = await res.json();
    return result.data;
  },

  // Achievements & Feedback
  async getAchievements(): Promise<Achievement[]> {
    const res = await fetch(`${API_BASE}/achievements`);
    if (!res.ok) throw new Error('Gagal mengambil data prestasi');
    return res.json();
  },

  async getAchievementDashboard(): Promise<AchievementStats & {
    estimasi_efisiensi_anggaran_bulanan: number;
    total_guru_terpetakan: number;
    total_murid_terbina: number;
  }> {
    const res = await fetch(`${API_BASE}/achievements/dashboard`);
    if (!res.ok) throw new Error('Gagal mengambil statistik prestasi');
    return res.json();
  },

  async createAchievement(data: {
    ekstra_id: number;
    murid_id: number;
    nama_lomba: string;
    tingkat: 'sekolah' | 'kecamatan' | 'kabupaten';
    capaian: string;
    tanggal_kegiatan: string;
    penyelenggara?: string;
    keterangan?: string;
  }): Promise<Achievement> {
    const res = await fetch(`${API_BASE}/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan data prestasi');
    }
    const result = await res.json();
    return result.data;
  },

  async updateAchievement(
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
  ): Promise<Achievement> {
    const res = await fetch(`${API_BASE}/achievements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memperbarui data prestasi');
    }
    const result = await res.json();
    return result.data;
  },

  async deleteAchievement(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/achievements/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus data prestasi');
    }
  },

  async getFeedback(): Promise<EvaluationFeedback[]> {
    const res = await fetch(`${API_BASE}/feedback`);
    if (!res.ok) throw new Error('Gagal mengambil data umpan balik');
    return res.json();
  },

  async getFeedbackSummary(): Promise<FeedbackSummary> {
    const res = await fetch(`${API_BASE}/feedback/summary`);
    if (!res.ok) throw new Error('Gagal mengambil ringkasan umpan balik');
    return res.json();
  },

  async submitFeedback(data: {
    user_id: number;
    peran: 'murid' | 'orang_tua' | 'guru';
    isi_umpan_balik: string;
    rating?: number;
    aspek_evaluasi?: string;
  }): Promise<EvaluationFeedback> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengirim umpan balik');
    }
    const result = await res.json();
    return result.data;
  },
};
