export type StatusTindakLanjut = 'Menunggu' | 'Proses' | 'Selesai';
export type KategoriPelapor = 'Pegawai' | 'Pihak';

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Checklist' | 'Maintenance' | 'Security' | 'ChecklistMaint' | 'Viewer';
  username: string;
}

export interface Keluhan {
  id?: string; // Opsional karena id baru dibuat oleh Firebase
  tanggal: string;
  kategori: 'Kebersihan' | 'Perbaikan';
  subKategori?: string;
  kategoriPelapor: KategoriPelapor;
  deskripsi: string;
  lokasi: string;
  status: StatusTindakLanjut;
  evidenceBefore?: string;
  evidenceAfter?: string;
  pelapor: string;
  isValidated?: boolean;
  createdAt?: any; // Untuk menangani serverTimestamp dari Firebase
}

export interface CleaningLog {
  id?: string;
  tanggal: string;
  ruangan: string;
  lantai: 1 | 2;
  picPetugas: string;
  petugasChecklist: string;
  isClean: boolean;
  catatan?: string;
  isValidated?: boolean;
  createdAt?: any;
}

export interface MaintenanceLog {
  id?: string;
  tanggal: string;
  item: 'Gedung' | 'Halaman' | 'Kendaraan' | 'PC' | 'Laptop' | 'Printer' | 'AC';
  merekArea: string;
  deskripsiKerusakan: string;
  detailPerbaikan: string;
  petugas: string;
  foto?: string; 
  isValidated?: boolean;
  createdAt?: any;
}

export interface SecurityLog {
  id?: string;
  tanggal: string;
  petugas: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  area: 'Pos Depan' | 'Tunggu Sidang' | 'PTSP' | 'Gedung';
  statusAman: boolean;
  keteranganTidakAman?: string;
  isValidated?: boolean;
  createdAt?: any;
  // Detail Checks
  isLampuMati?: boolean;
  isElektronikOff?: boolean;
  isPagarGembok?: boolean;
  isPintuKunci?: boolean;
  isLampuLuarHidup?: boolean;
  isSterilisasi?: boolean;
  isPengaturanPengunjung?: boolean;
  isAksesPihak?: boolean;
  isAreaTerbatas?: boolean;
  isIdentifikasiPengunjung?: boolean;
  isPeriksaBarang?: boolean;
  isPeriksaKendaraan?: boolean;
  isPeriksaPengunjungPTSP?: boolean;
  isAksesKeluarMasukPTSP?: boolean;
  isPengaturanPengunjungPTSP?: boolean;
}
