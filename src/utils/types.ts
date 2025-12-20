type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  jabatan: {
    id: number;
    name: string;
  };
  divisi: {
    id: number;
    kodedivisi: string;
    divisi: string;
    short: number;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type { User };

type Product = {
  id: number;
  namaBarang: string;
  kodeQr: string;
  lineDivisi?: string;
  productionDate?: string;
  stockAwal: number;
  stockSekarang?: number;
};

export type { Product };

type CreatedBy = {
  id: number;
  name: string;
  email: string;
  jabatan: {
    id: number;
    name: string;
  };
  divisi: {
    id: number;
    kodedivisi: string;
    divisi: string;
    short: number;
    status: string;
  };
};

type Category = {
  value: number;
  nama_kategori: string;
  status: string;
  created_at: string;
  createdBy?: CreatedBy;
};

export type { Category, CreatedBy };

type Divisi = {
  id: number;
  kodedivisi: string;
  divisi: string;
  short: number;
  status: string;
  created_at: string;
};

export type { Divisi };

type Barang = {
  id: number;
  kategori: Category;
  divisi: Divisi;
  createdBy: User;
  updatedBy: User;
  namaBarang: string;
  deskripsi: string;
  kodeQr: string;
  lineDivisi: LineDivisi;
  productionDate: string;
  totalStock: number;
  status: string;
  kodeGrp?: string;
};

export type { Barang };

type LineDivisi = {
  id: number;
  divisi: string;
};

type BarangResponse = {
  data: Barang[];
};

type Jabatan = {
  id: number;
  jabatan: string;
  created_at: string;
};

export type { Jabatan };

export type { BarangResponse };

type NotifikasiItem = {
  id: number;
  produk: string;
  kodegrp: string;
  stockSekarang: number;
  kategori: Category;
  divisi: Divisi;
};

type NotifikasiResponse = {
  data: NotifikasiItem[];
};

export type { NotifikasiResponse };

type SubkategoriAset = {
  id: number;
  kategori_aset_id: number;
  kode_subkategori: string;
  nama_subkategori: string;
  deskripsi?: string;
  status: "aktif" | "tidak_aktif";
  created_at: string;
  updated_at: string;
  kategoriAset?: {
    id: number;
    kategori: string;
    status: string;
  };
};

export type { SubkategoriAset };

type Aset = {
  id: number;
  kode_barang: string;
  nup?: string;
  kategori_aset_id: number;
  subkategori_aset_id?: number;
  detail_kategori_aset_id?: number;
  nama_aset: string;
  spesifikasi?: string;
  jumlah: number;
  satuan: string;
  tanggal_perolehan?: string;
  nilai_perolehan: number;
  mata_uang: string;
  sumber_perolehan:
    | "pembelian"
    | "hibah"
    | "tukar_menukar"
    | "penyertaan_modal"
    | "hasil_pembangunan"
    | "lainnya";
  keterangan_sumber_perolehan?: string;
  entitas_id?: number;
  satker_id?: number;
  unit_eselon_ii_id?: number;
  penanggung_jawab_aset_id?: number;
  unit_pemakai?: string;
  kondisi_fisik: "baik" | "rusak_ringan" | "rusak_berat";
  tanggal_mulai_digunakan?: string;
  umur_manfaat_bulan?: number;
  metode_penyusutan?: "garis_lurus" | "saldo_menurun" | "tidak_disusutkan";
  nilai_residu?: number;
  lokasi_fisik?: string;
  ruangan?: string;
  kode_qr?: string;
  tag_rfid?: string;
  status:
    | "aktif"
    | "dalam_pemeliharaan"
    | "rusak"
    | "dipindahtangankan"
    | "dihapus";
  nilai_buku: number;
  akumulasi_penyusutan: number;
  created_at: string;
  updated_at: string;
  kategori_aset?: {
    id: number;
    nama_kategori: string;
    status: string;
  };
  subkategori_aset?: {
    id: number;
    nama_subkategori: string;
    kategori_aset_id: number;
    status: string;
  };
  detail_kategori_aset?: {
    id: number;
    nama_detail_kategori: string;
  };
  entitas?: {
    id: number;
    nama: string;
  };
  satker?: {
    id: number;
    nama: string;
  };
  unit_eselon_ii?: {
    id: number;
    nama: string;
  };
  penanggung_jawab_aset?: {
    id: number;
    nama: string;
  };
  penyusutan_asets?: Array<{
    id: number;
    tahun: number;
    bulan: number;
    nilai_penyusutan: number;
    nilai_buku_akhir: number;
  }>;
  riwayat_pemeliharaans?: Array<{
    id: number;
    tanggal_pemeliharaan: string;
    jenis_pemeliharaan: string;
    deskripsi_pemeliharaan: string;
    kondisi_sebelum?: string;
    kondisi_sesudah?: string;
    biaya: number;
    vendor?: string;
    status: string;
    created_at: string;
  }>;
  penghapusan_pemindahtanganan_asets?: Array<{
    id: number;
    jenis_tindakan: string;
    tanggal_pengajuan: string;
    alasan: string;
    status: string;
    created_at: string;
  }>;
};

export type { Aset };
