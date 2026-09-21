import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/data.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'SI-PASTI SDN 275 Gresik', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // 1. Authentication (/api/v1/auth)
  // ==========================================
  app.post('/api/v1/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username wajib diisi.' });
    }

    const user = db.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Pengguna tidak ditemukan. Silakan periksa username Anda.' });
    }

    // Simple demo password check (allows password123 or any password for seamless demo testing)
    if (password && user.password_hash && password !== user.password_hash && password !== 'password123') {
      return res.status(401).json({ error: 'Kata sandi tidak sesuai.' });
    }

    // Mock token representing user session
    const token = `sipasti_token_${user.id}_${user.role}_${Date.now()}`;
    const { password_hash, ...safeUser } = user;

    return res.json({
      message: 'Login berhasil',
      token,
      role: user.role,
      user: safeUser,
    });
  });

  app.get('/api/v1/auth/me', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const userIdFromQuery = req.query.user_id ? Number(req.query.user_id) : undefined;

    let user = userIdFromQuery ? db.findUserById(userIdFromQuery) : undefined;

    if (!user && authHeader.startsWith('Bearer sipasti_token_')) {
      const parts = authHeader.replace('Bearer ', '').split('_');
      const userId = parseInt(parts[2], 10);
      user = db.findUserById(userId);
    }

    // Default fallback to Kepala Sekolah if not found
    if (!user) {
      user = db.users[0];
    }

    const { password_hash, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  app.get('/api/v1/auth/users', (req, res) => {
    const role = req.query.role as string | undefined;
    let list = db.users;
    if (role) {
      list = list.filter((u) => u.role === role);
    }
    const safeUsers = list.map(({ password_hash, ...rest }) => rest);
    res.json(safeUsers);
  });

  app.put('/api/v1/auth/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Data pengguna tidak ditemukan.' });
    }

    const {
      nama,
      nip_nisn,
      username,
      nomor_wa,
      jabatan,
      email,
      password,
      kelas,
      jenis_kelamin,
      tanggal_lahir,
      tempat_lahir,
      alamat,
      nama_ortu,
      wa_ortu,
      minat_utama,
      catatan_bakat,
      tahun_masuk,
    } = req.body;
    const oldName = db.users[userIndex].nama;

    db.users[userIndex] = {
      ...db.users[userIndex],
      nama: nama !== undefined ? nama : db.users[userIndex].nama,
      nip_nisn: nip_nisn !== undefined ? nip_nisn : db.users[userIndex].nip_nisn,
      username: username !== undefined ? username : db.users[userIndex].username,
      nomor_wa: nomor_wa !== undefined ? nomor_wa : db.users[userIndex].nomor_wa,
      jabatan: jabatan !== undefined ? jabatan : db.users[userIndex].jabatan,
      email: email !== undefined ? email : db.users[userIndex].email,
      password_hash: password ? password : db.users[userIndex].password_hash,
      kelas: kelas !== undefined ? kelas : db.users[userIndex].kelas,
      jenis_kelamin: jenis_kelamin !== undefined ? jenis_kelamin : db.users[userIndex].jenis_kelamin,
      tanggal_lahir: tanggal_lahir !== undefined ? tanggal_lahir : db.users[userIndex].tanggal_lahir,
      tempat_lahir: tempat_lahir !== undefined ? tempat_lahir : db.users[userIndex].tempat_lahir,
      alamat: alamat !== undefined ? alamat : db.users[userIndex].alamat,
      nama_ortu: nama_ortu !== undefined ? nama_ortu : db.users[userIndex].nama_ortu,
      wa_ortu: wa_ortu !== undefined ? wa_ortu : db.users[userIndex].wa_ortu,
      minat_utama: minat_utama !== undefined ? minat_utama : db.users[userIndex].minat_utama,
      catatan_bakat: catatan_bakat !== undefined ? catatan_bakat : db.users[userIndex].catatan_bakat,
      tahun_masuk: tahun_masuk !== undefined ? Number(tahun_masuk) : db.users[userIndex].tahun_masuk,
    };

    const updatedUser = db.users[userIndex];

    // Cascade update to teacherAssets if guru
    db.teacherAssets = db.teacherAssets.map((asset) => {
      if (asset.user_id === id) {
        return {
          ...asset,
          nama_guru: updatedUser.nama,
          nip: updatedUser.nip_nisn || asset.nip,
        };
      }
      return asset;
    });

    // Cascade update to extracurriculars pembina_nama if guru
    db.extracurriculars = db.extracurriculars.map((ekstra) => {
      if (ekstra.pembina_id === id) {
        return {
          ...ekstra,
          pembina_nama: updatedUser.nama,
        };
      }
      return ekstra;
    });

    // Cascade update to studentInterests (pembina_nama if guru, or murid_nama & kelas if murid)
    db.studentInterests = db.studentInterests.map((si) => {
      if (si.pembina_nama === oldName && updatedUser.role === 'guru') {
        return {
          ...si,
          pembina_nama: updatedUser.nama,
        };
      }
      if (si.murid_id === id) {
        return {
          ...si,
          murid_nama: updatedUser.nama,
          kelas: updatedUser.kelas || si.kelas,
        };
      }
      return si;
    });

    // Cascade update to mentoringLogs
    db.mentoringLogs = db.mentoringLogs.map((log) => {
      if (log.pembina_id === id) {
        return {
          ...log,
          pembina_nama: updatedUser.nama,
        };
      }
      if (log.murid_id === id) {
        return {
          ...log,
          murid_nama: updatedUser.nama,
        };
      }
      return log;
    });

    // Cascade update to achievements
    db.achievements = db.achievements.map((ach) => {
      if (ach.murid_id === id) {
        return {
          ...ach,
          murid_nama: updatedUser.nama,
        };
      }
      return ach;
    });

    const { password_hash, ...safeUser } = updatedUser;
    const roleLabel =
      updatedUser.role === 'kepala_sekolah'
        ? 'Kepala Sekolah'
        : updatedUser.role === 'guru'
        ? 'Guru'
        : updatedUser.role === 'murid'
        ? 'Siswa'
        : 'Orang Tua';

    return res.json({
      message: `Data ${roleLabel} berhasil diperbarui.`,
      user: safeUser,
    });
  });

  app.post('/api/v1/auth/users', (req, res) => {
    const {
      nama,
      nip_nisn,
      username,
      nomor_wa,
      jabatan,
      email,
      role,
      password,
      kelas,
      jenis_kelamin,
      tanggal_lahir,
      tempat_lahir,
      alamat,
      nama_ortu,
      wa_ortu,
      minat_utama,
      catatan_bakat,
      tahun_masuk,
    } = req.body;
    if (!nama || !nama.trim()) {
      return res.status(400).json({ error: 'Nama lengkap wajib diisi.' });
    }

    const assignedRole = role || 'guru';
    const cleanUsername = username?.trim() || `user_${Date.now()}`;

    // Check duplicate username
    if (db.users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return res.status(400).json({ error: 'Username sudah digunakan oleh akun lain.' });
    }

    const newId = Math.max(...db.users.map((u) => u.id), 0) + 1;
    const newUser = {
      id: newId,
      nama: nama.trim(),
      username: cleanUsername,
      password_hash: password || 'password123',
      role: assignedRole,
      nip_nisn: nip_nisn || (assignedRole === 'murid' ? '0123456799' : '-'),
      nomor_wa: nomor_wa || '',
      jabatan:
        jabatan ||
        (assignedRole === 'kepala_sekolah'
          ? 'Kepala UPT SD Negeri 275 Gresik'
          : assignedRole === 'guru'
          ? 'Guru Pendidik'
          : `Peserta Didik ${kelas || 'SDN 275'}`),
      email: email || '',
      kelas: kelas || (assignedRole === 'murid' ? 'Kelas 5A' : undefined),
      jenis_kelamin: jenis_kelamin || 'L',
      tanggal_lahir: tanggal_lahir || '',
      tempat_lahir: tempat_lahir || 'Gresik',
      alamat: alamat || '',
      nama_ortu: nama_ortu || '',
      wa_ortu: wa_ortu || '',
      minat_utama: minat_utama || '',
      catatan_bakat: catatan_bakat || '',
      tahun_masuk: tahun_masuk ? Number(tahun_masuk) : (assignedRole === 'murid' ? 2026 : undefined),
    };

    db.users.push(newUser);

    // If role is guru, also initialize a teacherAsset entry
    if (assignedRole === 'guru') {
      db.teacherAssets.push({
        id: db.teacherAssets.length + 1,
        user_id: newId,
        latar_belakang_pendidikan: 'S1 Kependidikan',
        keahlian_khusus: 'Pembimbingan Minat & Bakat Murid SD',
        catatan_konfirmasi_ks: '',
        status_konfirmasi: false,
        nama_guru: newUser.nama,
        nip: newUser.nip_nisn,
        komitmen_empati: 'Siap mendampingi dan memfasilitasi minat bakat murid dengan empati.',
        rekomendasi_ekstra: '',
        bidang_sertifikasi: '',
        updated_at: new Date().toISOString().split('T')[0],
      });
    }

    const { password_hash, ...safeUser } = newUser;
    const roleLabel =
      assignedRole === 'kepala_sekolah'
        ? 'Kepala Sekolah'
        : assignedRole === 'guru'
        ? 'Guru'
        : assignedRole === 'murid'
        ? 'Siswa'
        : 'Orang Tua';

    return res.status(201).json({
      message: `Data ${roleLabel} baru berhasil ditambahkan.`,
      user: safeUser,
    });
  });

  app.delete('/api/v1/auth/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }

    const user = db.users[userIndex];
    if (user.role === 'kepala_sekolah' && db.users.filter((u) => u.role === 'kepala_sekolah').length <= 1) {
      return res.status(400).json({ error: 'Data Kepala Sekolah utama tidak dapat dihapus. Anda dapat mengubah/mengganti data profilnya.' });
    }

    db.users.splice(userIndex, 1);
    db.teacherAssets = db.teacherAssets.filter((a) => a.user_id !== id);
    db.studentInterests = db.studentInterests.filter((si) => si.murid_id !== id);
    db.mentoringLogs = db.mentoringLogs.filter((m) => m.murid_id !== id);

    return res.json({ message: `Data ${user.nama} berhasil dihapus.` });
  });

  // ==========================================
  // 2. Pemetaan Aset Guru (/api/v1/teacher-assets)
  // ==========================================
  app.get('/api/v1/teacher-assets', (req, res) => {
    const userId = req.query.user_id ? Number(req.query.user_id) : undefined;
    let list = db.teacherAssets;
    if (userId) {
      list = list.filter((item) => item.user_id === userId);
    }
    res.json(list);
  });

  app.post('/api/v1/teacher-assets', (req, res) => {
    const {
      user_id,
      latar_belakang_pendidikan,
      keahlian_khusus,
      komitmen_empati,
      bidang_sertifikasi,
      rekomendasi_ekstra,
    } = req.body;

    if (!user_id || !latar_belakang_pendidikan || !keahlian_khusus) {
      return res.status(400).json({ error: 'User ID, Latar Belakang Pendidikan, dan Keahlian Khusus wajib diisi.' });
    }

    const user = db.findUserById(Number(user_id));
    const existingIndex = db.teacherAssets.findIndex((t) => t.user_id === Number(user_id));

    const assetData = {
      id: existingIndex >= 0 ? db.teacherAssets[existingIndex].id : db.teacherAssets.length + 1,
      user_id: Number(user_id),
      latar_belakang_pendidikan,
      keahlian_khusus,
      catatan_konfirmasi_ks: existingIndex >= 0 ? db.teacherAssets[existingIndex].catatan_konfirmasi_ks : '',
      status_konfirmasi: existingIndex >= 0 ? db.teacherAssets[existingIndex].status_konfirmasi : false,
      nama_guru: user?.nama || 'Guru Internal SDN 275',
      nip: user?.nip_nisn || '-',
      komitmen_empati: komitmen_empati || (existingIndex >= 0 ? db.teacherAssets[existingIndex].komitmen_empati : ''),
      bidang_sertifikasi: bidang_sertifikasi || '',
      rekomendasi_ekstra: rekomendasi_ekstra || '',
      updated_at: new Date().toISOString().split('T')[0],
    };

    if (existingIndex >= 0) {
      db.teacherAssets[existingIndex] = assetData;
    } else {
      db.teacherAssets.push(assetData);
    }

    return res.status(201).json({
      message: 'Pemetaan talenta dan kualifikasi guru berhasil disimpan.',
      data: assetData,
    });
  });

  app.put('/api/v1/teacher-assets/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.teacherAssets.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data aset guru tidak ditemukan.' });
    }

    const {
      latar_belakang_pendidikan,
      keahlian_khusus,
      komitmen_empati,
      bidang_sertifikasi,
      rekomendasi_ekstra,
      catatan_konfirmasi_ks,
      status_konfirmasi,
    } = req.body;

    db.teacherAssets[index] = {
      ...db.teacherAssets[index],
      latar_belakang_pendidikan: latar_belakang_pendidikan ?? db.teacherAssets[index].latar_belakang_pendidikan,
      keahlian_khusus: keahlian_khusus ?? db.teacherAssets[index].keahlian_khusus,
      komitmen_empati: komitmen_empati ?? db.teacherAssets[index].komitmen_empati,
      bidang_sertifikasi: bidang_sertifikasi ?? db.teacherAssets[index].bidang_sertifikasi,
      rekomendasi_ekstra: rekomendasi_ekstra ?? db.teacherAssets[index].rekomendasi_ekstra,
      catatan_konfirmasi_ks: catatan_konfirmasi_ks ?? db.teacherAssets[index].catatan_konfirmasi_ks,
      status_konfirmasi: typeof status_konfirmasi === 'boolean' ? status_konfirmasi : db.teacherAssets[index].status_konfirmasi,
      updated_at: new Date().toISOString().split('T')[0],
    };

    return res.json({
      message: 'Data pemetaan aset guru berhasil diperbarui.',
      data: db.teacherAssets[index],
    });
  });

  app.put('/api/v1/teacher-assets/:id/confirm', (req, res) => {
    const id = Number(req.params.id);
    const { catatan_konfirmasi_ks, status_konfirmasi, komitmen_empati, rekomendasi_ekstra } = req.body;

    const index = db.teacherAssets.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data aset guru tidak ditemukan.' });
    }

    db.teacherAssets[index] = {
      ...db.teacherAssets[index],
      catatan_konfirmasi_ks: catatan_konfirmasi_ks ?? db.teacherAssets[index].catatan_konfirmasi_ks,
      status_konfirmasi: typeof status_konfirmasi === 'boolean' ? status_konfirmasi : true,
      komitmen_empati: komitmen_empati ?? db.teacherAssets[index].komitmen_empati,
      rekomendasi_ekstra: rekomendasi_ekstra ?? db.teacherAssets[index].rekomendasi_ekstra,
      updated_at: new Date().toISOString().split('T')[0],
    };

    return res.json({
      message: 'Konfirmasi wawancara 1-on-1 & verifikasi kepala sekolah berhasil disimpan.',
      data: db.teacherAssets[index],
    });
  });

  // ==========================================
  // 3. Ekstrakurikuler & Minat Murid
  // ==========================================
  app.get('/api/v1/extracurriculars', (req, res) => {
    const list = db.extracurriculars.map((ekstra) => {
      const pesertaCount = db.studentInterests.filter((si) => si.ekstra_id === ekstra.id).length;
      return {
        ...ekstra,
        jumlah_peserta: pesertaCount || ekstra.jumlah_peserta || 0,
      };
    });
    res.json(list);
  });

  app.post('/api/v1/extracurriculars', (req, res) => {
    const { nama_ekstra, pembina_id, kategori, deskripsi, jadwal, ruang, biaya_efisiensi, kuota } = req.body;
    if (!nama_ekstra || !pembina_id || !kategori) {
      return res.status(400).json({ error: 'Nama Ekstra, Pembina, dan Kategori wajib diisi.' });
    }

    const pembina = db.findUserById(Number(pembina_id));
    const newEkstra = {
      id: db.extracurriculars.length + 1,
      nama_ekstra,
      pembina_id: Number(pembina_id),
      kategori,
      deskripsi: deskripsi || '',
      pembina_nama: pembina?.nama || 'Guru Pembina',
      jadwal: jadwal || 'Sesuai kesepakatan',
      ruang: ruang || 'Lingkungan Sekolah',
      biaya_efisiensi: Number(biaya_efisiensi) || 2000000,
      kuota: Number(kuota) || 25,
      jumlah_peserta: 0,
    };

    db.extracurriculars.push(newEkstra);
    res.status(201).json({ message: 'Ekstrakurikuler berhasil ditambahkan.', data: newEkstra });
  });

  app.put('/api/v1/extracurriculars/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.extracurriculars.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ekstrakurikuler tidak ditemukan.' });
    }

    const { nama_ekstra, pembina_id, kategori, deskripsi, jadwal, ruang, biaya_efisiensi, kuota } = req.body;
    let pembina_nama = db.extracurriculars[index].pembina_nama;

    if (pembina_id) {
      const pembina = db.findUserById(Number(pembina_id));
      if (pembina) pembina_nama = pembina.nama;
    }

    db.extracurriculars[index] = {
      ...db.extracurriculars[index],
      nama_ekstra: nama_ekstra ?? db.extracurriculars[index].nama_ekstra,
      pembina_id: pembina_id ? Number(pembina_id) : db.extracurriculars[index].pembina_id,
      pembina_nama,
      kategori: kategori ?? db.extracurriculars[index].kategori,
      deskripsi: deskripsi ?? db.extracurriculars[index].deskripsi,
      jadwal: jadwal ?? db.extracurriculars[index].jadwal,
      ruang: ruang ?? db.extracurriculars[index].ruang,
      biaya_efisiensi: biaya_efisiensi !== undefined ? Number(biaya_efisiensi) : db.extracurriculars[index].biaya_efisiensi,
      kuota: kuota !== undefined ? Number(kuota) : db.extracurriculars[index].kuota,
    };

    // Update references in student interests and achievements
    const updatedEkstra = db.extracurriculars[index];
    db.studentInterests.forEach((si) => {
      if (si.ekstra_id === id) {
        si.ekstra_nama = updatedEkstra.nama_ekstra;
        si.pembina_nama = updatedEkstra.pembina_nama;
        si.kategori_ekstra = updatedEkstra.kategori;
      }
    });

    res.json({ message: 'Data ekstrakurikuler berhasil diperbarui.', data: updatedEkstra });
  });

  app.delete('/api/v1/extracurriculars/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.extracurriculars.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ekstrakurikuler tidak ditemukan.' });
    }
    db.extracurriculars.splice(index, 1);
    res.json({ message: 'Ekstrakurikuler berhasil dihapus.' });
  });

  app.get('/api/v1/student-interests', (req, res) => {
    const { murid_id, ekstra_id } = req.query;
    let list = db.studentInterests;

    if (murid_id) {
      list = list.filter((item) => item.murid_id === Number(murid_id));
    }
    if (ekstra_id) {
      list = list.filter((item) => item.ekstra_id === Number(ekstra_id));
    }

    res.json(list);
  });

  app.post('/api/v1/student-interests', (req, res) => {
    const { murid_id, ekstra_id, persetujuan_ortu, catatan_ortu } = req.body;

    if (!murid_id || !ekstra_id) {
      return res.status(400).json({ error: 'Murid ID dan Ekstra ID wajib disertakan.' });
    }

    // Check if already registered
    const exists = db.studentInterests.find(
      (item) => item.murid_id === Number(murid_id) && item.ekstra_id === Number(ekstra_id)
    );
    if (exists) {
      return res.status(400).json({ error: 'Murid sudah terdaftar pada ekstrakurikuler ini.' });
    }

    const murid = db.findUserById(Number(murid_id));
    const ekstra = db.extracurriculars.find((e) => e.id === Number(ekstra_id));

    const newInterest = {
      id: db.studentInterests.length + 1,
      murid_id: Number(murid_id),
      ekstra_id: Number(ekstra_id),
      persetujuan_ortu: Boolean(persetujuan_ortu),
      tanggal_daftar: new Date().toISOString().split('T')[0],
      murid_nama: murid?.nama || 'Murid SDN 275',
      kelas: murid?.kelas || 'Kelas 5',
      ekstra_nama: ekstra?.nama_ekstra || 'Ekstrakurikuler',
      kategori_ekstra: ekstra?.kategori || 'akademik',
      pembina_nama: ekstra?.pembina_nama || 'Guru Pembina',
      catatan_ortu: catatan_ortu || '',
      tanggal_persetujuan: persetujuan_ortu ? new Date().toISOString().split('T')[0] : undefined,
    };

    db.studentInterests.push(newInterest);
    res.status(201).json({ message: 'Pendaftaran minat ekstrakurikuler berhasil.', data: newInterest });
  });

  app.put('/api/v1/student-interests/:id/parent-consent', (req, res) => {
    const id = Number(req.params.id);
    const { persetujuan_ortu, catatan_ortu } = req.body;

    const index = db.studentInterests.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data pendaftaran minat tidak ditemukan.' });
    }

    db.studentInterests[index] = {
      ...db.studentInterests[index],
      persetujuan_ortu: typeof persetujuan_ortu === 'boolean' ? persetujuan_ortu : true,
      catatan_ortu: catatan_ortu !== undefined ? catatan_ortu : db.studentInterests[index].catatan_ortu,
      tanggal_persetujuan: new Date().toISOString().split('T')[0],
    };

    res.json({
      message: 'Status persetujuan orang tua berhasil diperbarui.',
      data: db.studentInterests[index],
    });
  });

  app.put('/api/v1/student-interests/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.studentInterests.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data pendaftaran minat tidak ditemukan.' });
    }

    const { ekstra_id, catatan_ortu, persetujuan_ortu } = req.body;
    let ekstra_nama = db.studentInterests[index].ekstra_nama;
    let pembina_nama = db.studentInterests[index].pembina_nama;
    let kategori_ekstra = db.studentInterests[index].kategori_ekstra;

    if (ekstra_id && Number(ekstra_id) !== db.studentInterests[index].ekstra_id) {
      const targetEkstra = db.extracurriculars.find((e) => e.id === Number(ekstra_id));
      if (targetEkstra) {
        ekstra_nama = targetEkstra.nama_ekstra;
        pembina_nama = targetEkstra.pembina_nama;
        kategori_ekstra = targetEkstra.kategori;
      }
    }

    db.studentInterests[index] = {
      ...db.studentInterests[index],
      ekstra_id: ekstra_id ? Number(ekstra_id) : db.studentInterests[index].ekstra_id,
      ekstra_nama,
      pembina_nama,
      kategori_ekstra,
      catatan_ortu: catatan_ortu !== undefined ? catatan_ortu : db.studentInterests[index].catatan_ortu,
      persetujuan_ortu: typeof persetujuan_ortu === 'boolean' ? persetujuan_ortu : db.studentInterests[index].persetujuan_ortu,
    };

    res.json({
      message: 'Data pendaftaran minat berhasil diperbarui.',
      data: db.studentInterests[index],
    });
  });

  app.delete('/api/v1/student-interests/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.studentInterests.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data pendaftaran minat tidak ditemukan.' });
    }
    db.studentInterests.splice(index, 1);
    res.json({ message: 'Pendaftaran minat berhasil dibatalkan/dihapus.' });
  });

  // ==========================================
  // 4. Jurnal Pembimbingan Deep Learning (/api/v1/mentoring-logs)
  // ==========================================
  app.get('/api/v1/mentoring-logs', (req, res) => {
    const { pembina_id, murid_id, ekstra_id } = req.query;
    let list = db.mentoringLogs;

    if (pembina_id) {
      list = list.filter((item) => item.pembina_id === Number(pembina_id));
    }
    if (murid_id) {
      list = list.filter((item) => item.murid_id === Number(murid_id));
    }
    if (ekstra_id) {
      list = list.filter((item) => item.ekstra_id === Number(ekstra_id));
    }

    res.json(list);
  });

  app.post('/api/v1/mentoring-logs', (req, res) => {
    const { ekstra_id, pembina_id, murid_id, tanggal, moda_pembelajaran, catatan_kegiatan, indikator_capaian } = req.body;

    if (!ekstra_id || !pembina_id || !murid_id || !moda_pembelajaran || !catatan_kegiatan) {
      return res.status(400).json({
        error: 'Ekstra ID, Pembina ID, Murid ID, Moda Pembelajaran, dan Catatan Kegiatan wajib diisi.',
      });
    }

    if (!['memahami', 'mengaplikasi', 'merefleksi'].includes(moda_pembelajaran)) {
      return res.status(400).json({ error: 'Moda pembelajaran harus salah satu dari: memahami, mengaplikasi, merefleksi.' });
    }

    const ekstra = db.extracurriculars.find((e) => e.id === Number(ekstra_id));
    const pembina = db.findUserById(Number(pembina_id));
    const murid = db.findUserById(Number(murid_id));

    const newLog = {
      id: db.mentoringLogs.length + 1,
      ekstra_id: Number(ekstra_id),
      pembina_id: Number(pembina_id),
      murid_id: Number(murid_id),
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      moda_pembelajaran,
      catatan_kegiatan,
      catatan_supervisi_ks: '',
      ekstra_nama: ekstra?.nama_ekstra || 'Ekstrakurikuler',
      pembina_nama: pembina?.nama || 'Guru Pembina',
      murid_nama: murid?.nama || 'Murid Binaan',
      indikator_capaian: indikator_capaian || '',
      status_supervisi: false,
    };

    db.mentoringLogs.unshift(newLog);
    res.status(201).json({ message: 'Logbook pembimbingan Deep Learning berhasil disimpan.', data: newLog });
  });

  app.put('/api/v1/mentoring-logs/:id/supervise', (req, res) => {
    const id = Number(req.params.id);
    const { catatan_supervisi_ks } = req.body;

    if (!catatan_supervisi_ks) {
      return res.status(400).json({ error: 'Catatan supervisi instruksional kepala sekolah wajib diisi.' });
    }

    const index = db.mentoringLogs.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Logbook pembimbingan tidak ditemukan.' });
    }

    db.mentoringLogs[index] = {
      ...db.mentoringLogs[index],
      catatan_supervisi_ks,
      status_supervisi: true,
    };

    res.json({
      message: 'Catatan supervisi instruksional kepala sekolah berhasil direkam.',
      data: db.mentoringLogs[index],
    });
  });

  // ==========================================
  // 5. Prestasi & Umpan Balik
  // ==========================================
  app.get('/api/v1/achievements', (req, res) => {
    res.json(db.achievements);
  });

  app.get('/api/v1/achievements/dashboard', (req, res) => {
    const stats = db.getAchievementStats();
    // Calculate estimated budget saved by using internal teacher assets
    const totalEfficiency = db.extracurriculars.reduce((acc, curr) => acc + (curr.biaya_efisiensi || 0), 0);
    res.json({
      ...stats,
      estimasi_efisiensi_anggaran_bulanan: totalEfficiency,
      total_guru_terpetakan: db.teacherAssets.length,
      total_murid_terbina: db.studentInterests.length,
    });
  });

  app.post('/api/v1/achievements', (req, res) => {
    const { ekstra_id, murid_id, nama_lomba, tingkat, capaian, tanggal_kegiatan, penyelenggara, keterangan } = req.body;

    if (!ekstra_id || !murid_id || !nama_lomba || !tingkat || !capaian) {
      return res.status(400).json({ error: 'Semua bidang data pokok prestasi wajib diisi.' });
    }

    const ekstra = db.extracurriculars.find((e) => e.id === Number(ekstra_id));
    const murid = db.findUserById(Number(murid_id));

    const newAchievement = {
      id: db.achievements.length + 1,
      ekstra_id: Number(ekstra_id),
      murid_id: Number(murid_id),
      nama_lomba,
      tingkat,
      capaian,
      tanggal_kegiatan: tanggal_kegiatan || new Date().toISOString().split('T')[0],
      ekstra_nama: ekstra?.nama_ekstra || 'Ekstrakurikuler',
      murid_nama: murid?.nama || 'Murid Berprestasi',
      kelas: murid?.kelas || 'Kelas 5',
      penyelenggara: penyelenggara || 'Dinas / Lembaga Terkait',
      keterangan: keterangan || '',
    };

    db.achievements.unshift(newAchievement);
    res.status(201).json({ message: 'Data raihan prestasi berhasil direkam.', data: newAchievement });
  });

  app.put('/api/v1/achievements/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.achievements.findIndex((a) => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data prestasi tidak ditemukan.' });
    }

    const { ekstra_id, murid_id, nama_lomba, tingkat, capaian, tanggal_kegiatan, penyelenggara, keterangan } = req.body;

    let ekstra_nama = db.achievements[index].ekstra_nama;
    let murid_nama = db.achievements[index].murid_nama;
    let kelas = db.achievements[index].kelas;

    if (ekstra_id && Number(ekstra_id) !== db.achievements[index].ekstra_id) {
      const ekstra = db.extracurriculars.find((e) => e.id === Number(ekstra_id));
      if (ekstra) ekstra_nama = ekstra.nama_ekstra;
    }

    if (murid_id && Number(murid_id) !== db.achievements[index].murid_id) {
      const murid = db.findUserById(Number(murid_id));
      if (murid) {
        murid_nama = murid.nama;
        kelas = murid.kelas || kelas;
      }
    }

    db.achievements[index] = {
      ...db.achievements[index],
      ekstra_id: ekstra_id ? Number(ekstra_id) : db.achievements[index].ekstra_id,
      murid_id: murid_id ? Number(murid_id) : db.achievements[index].murid_id,
      nama_lomba: nama_lomba ?? db.achievements[index].nama_lomba,
      tingkat: tingkat ?? db.achievements[index].tingkat,
      capaian: capaian ?? db.achievements[index].capaian,
      tanggal_kegiatan: tanggal_kegiatan ?? db.achievements[index].tanggal_kegiatan,
      penyelenggara: penyelenggara !== undefined ? penyelenggara : db.achievements[index].penyelenggara,
      keterangan: keterangan !== undefined ? keterangan : db.achievements[index].keterangan,
      ekstra_nama,
      murid_nama,
      kelas,
    };

    res.json({ message: 'Data raihan prestasi berhasil diperbarui.', data: db.achievements[index] });
  });

  app.delete('/api/v1/achievements/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.achievements.findIndex((a) => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data prestasi tidak ditemukan.' });
    }
    db.achievements.splice(index, 1);
    res.json({ message: 'Data prestasi berhasil dihapus.' });
  });

  app.get('/api/v1/feedback', (req, res) => {
    res.json(db.evaluationsFeedback);
  });

  app.get('/api/v1/feedback/summary', (req, res) => {
    const summary = db.getFeedbackSummary();
    res.json(summary);
  });

  app.post('/api/v1/feedback', (req, res) => {
    const { user_id, peran, isi_umpan_balik, rating, aspek_evaluasi } = req.body;

    if (!user_id || !peran || !isi_umpan_balik) {
      return res.status(400).json({ error: 'User ID, Peran, dan Isi Umpan Balik wajib diisi.' });
    }

    const user = db.findUserById(Number(user_id));
    const newFeedback = {
      id: db.evaluationsFeedback.length + 1,
      user_id: Number(user_id),
      peran,
      isi_umpan_balik,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user_nama: user ? `${user.nama} (${peran === 'kepala_sekolah' ? 'Kepala Sekolah' : peran})` : 'Responden',
      rating: rating ? Number(rating) : 5,
      aspek_evaluasi: aspek_evaluasi || 'Pelaksanaan Ekstrakurikuler & SI-PASTI',
    };

    db.evaluationsFeedback.unshift(newFeedback);
    res.status(201).json({ message: 'Survei umpan balik berhasil dikirim. Terima kasih atas partisipasi Anda.', data: newFeedback });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SI-PASTI SDN 275 Gresik running on http://localhost:${PORT}`);
  });
}

startServer();
