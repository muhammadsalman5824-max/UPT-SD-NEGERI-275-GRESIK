import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Star,
  Users,
  Send,
  Sparkles,
  CheckCircle2,
  Heart,
  ThumbsUp,
  Filter,
} from 'lucide-react';
import { User, EvaluationFeedback, FeedbackSummary } from '../types';

interface FeedbackModuleProps {
  currentUser: User;
  feedbackList: EvaluationFeedback[];
  feedbackSummary: FeedbackSummary;
  onSubmitFeedback: (data: {
    user_id: number;
    peran: 'murid' | 'orang_tua' | 'guru';
    isi_umpan_balik: string;
    rating?: number;
    aspek_evaluasi?: string;
  }) => Promise<void>;
}

export const FeedbackModule: React.FC<FeedbackModuleProps> = ({
  currentUser,
  feedbackList,
  feedbackSummary,
  onSubmitFeedback,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [aspek, setAspek] = useState<string>('Kualitas Pembimbingan & Kesabaran Guru');
  const [isi, setIsi] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [filterRole, setFilterRole] = useState<'all' | 'murid' | 'orang_tua' | 'guru'>('all');

  const roleForFeedback: 'murid' | 'orang_tua' | 'guru' =
    currentUser.role === 'kepala_sekolah' ? 'guru' : (currentUser.role as any);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isi.trim()) {
      alert('Mohon tuliskan isi umpan balik atau refleksi Anda.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitFeedback({
        user_id: currentUser.id,
        peran: roleForFeedback,
        isi_umpan_balik: isi,
        rating,
        aspek_evaluasi: aspek,
      });

      setSuccessMsg('Terima kasih! Umpan balik Anda sangat berharga untuk peningkatan mutu SI-PASTI.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsi('');
      setRating(5);
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim umpan balik.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = feedbackList.filter(
    (item) => filterRole === 'all' || item.peran === filterRole
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
              <span>Survei Refleksi & Evaluasi Pemangku Kepentingan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Umpan Balik & Evaluasi Berkelanjutan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Suara murid, wali murid, dan dewan guru untuk memastikan efektivitas optimalisasi aset internal
              sekolah berjalan transparan, membahagiakan, dan berdampak nyata.
            </p>
          </div>
        </div>

        {currentUser.role === 'murid' && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Akses Khusus Murid: Suara dan pengalamanmu sangat berarti bagi kemajuan sekolah! Silakan isi penilaian dan ceritakan pengalamanmu selama mengikuti ekstrakurikuler bersama bapak/ibu guru pada formulir di bawah ini.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Indeks Kepuasan</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {feedbackSummary.rerata_kepuasan.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-500">/ 5.0 Bintang</span>
            </div>
            <div className="text-[11px] text-amber-700 font-medium">Sangat Memuaskan</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Total Tanggapan</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {feedbackSummary.total_responden}{' '}
              <span className="text-xs font-normal text-slate-500">Aspirasi</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">Murid, Ortu & Guru</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Apresiasi Terbanyak</div>
            <div className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
              {feedbackSummary.aspek_tertinggi}
            </div>
            <div className="text-[11px] text-purple-700 font-medium">Efisiensi & Kualitas Guru</div>
          </div>
        </div>
      </div>

      {/* Form Survei Umpan Balik Sederhana untuk Murid & Orang Tua */}
      <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-sm">
        <div className="pb-4 border-b border-slate-100 mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Formulir Survei Refleksi & Umpan Balik Kegiatan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identitas Pengisi: <strong>{currentUser.nama}</strong> ({currentUser.role.replace('_', ' ')})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tingkat Kepuasan (Rating Bintang) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 rounded-lg hover:bg-amber-50 transition cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating === 5
                    ? 'Sangat Puas (5/5)'
                    : rating === 4
                    ? 'Puas (4/5)'
                    : rating === 3
                    ? 'Cukup (3/5)'
                    : 'Kurang (≤2/5)'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fokus Aspek Evaluasi <span className="text-rose-500">*</span>
              </label>
              <select
                value={aspek}
                onChange={(e) => setAspek(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Kualitas Pembimbingan & Kesabaran Guru">
                  Kualitas Pembimbingan & Kesabaran Guru
                </option>
                <option value="Efisiensi Anggaran & Penghematan Biaya Les">
                  Efisiensi Anggaran & Penghematan Biaya Les
                </option>
                <option value="Metode Pembelajaran Praktik (Deep Learning)">
                  Metode Pembelajaran Praktik (Deep Learning)
                </option>
                <option value="Kenyamanan Fasilitas & Jadwal Sekolah">
                  Kenyamanan Fasilitas & Jadwal Sekolah
                </option>
                <option value="Dampak Positif Percaya Diri Anak">
                  Dampak Positif Percaya Diri Anak
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Umpan Balik, Refleksi, atau Saran Konstruktif <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={3}
              required
              placeholder="Ceritakan pengalaman belajar anak, kemudahan bimbingan oleh guru internal, atau saran perbaikan fasilitas..."
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Umpan Balik'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Rekapitulasi Testimoni & Masukan Stakeholder */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>Aspirasi & Masukan Pemangku Kepentingan</span>
            </h2>
            <p className="text-xs text-slate-500">
              Daftar testimoni dan refleksi yang telah dihimpun melalui aplikasi SI-PASTI
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterRole === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({feedbackList.length})
            </button>
            <button
              onClick={() => setFilterRole('murid')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterRole === 'murid'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              Murid
            </button>
            <button
              onClick={() => setFilterRole('orang_tua')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterRole === 'orang_tua'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              Orang Tua
            </button>
            <button
              onClick={() => setFilterRole('guru')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterRole === 'guru'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Guru
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.peran === 'murid'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : item.peran === 'orang_tua'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {item.peran === 'orang_tua' ? 'Orang Tua' : item.peran}
                  </span>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (item.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed italic mb-3">
                  "{item.isi_umpan_balik}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">{item.user_nama}</span>
                <span>{item.created_at}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
