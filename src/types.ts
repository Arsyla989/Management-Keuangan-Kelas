export type UserRole = "admin" | "siswa";

export interface Student {
  id: string;
  nama: string;
  nis: string;
  kelas: string;
  username: string;
  password?: string;
  statusLunas?: boolean; // dynamic field or helper calculated
}

export interface KasMasuk {
  id: string;
  siswa_id: string; // references Student.id
  nominal: number;
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
}

export interface Pengeluaran {
  id: string;
  nama_pengeluaran: string;
  kategori: string;
  nominal: number;
  tanggal: string; // YYYY-MM-DD
  deskripsi: string;
}

export interface AppState {
  students: Student[];
  kasMasuk: KasMasuk[];
  expenses: Pengeluaran[];
}
