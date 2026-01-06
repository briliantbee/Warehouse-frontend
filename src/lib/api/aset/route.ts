import axiosInstance from "@/lib/axios";

export interface Aset {
  id: number;
  kode_barang: string;
  nup?: string;
  nama_aset: string;
  kategori_aset_id: number;
  subkategori_aset_id?: number;
  detail_kategori_aset_id?: number;
  merk?: string;
  tipe?: string;
  nomor_seri?: string;
  bahan?: string;
  ukuran?: string;
  spesifikasi_teknis?: string;
  tahun_perolehan: number;
  tanggal_perolehan: string;
  nilai_perolehan: number;
  mata_uang_id: number;
  kondisi_fisik: string;
  status: string;
  lokasi_fisik?: string;
  entitas_id?: number;
  satker_id?: number;
  unit_eselon_ii_id?: number;
  penanggung_jawab_aset_id?: number;
  metode_penyusutan_id?: number;
  masa_manfaat?: number;
  nilai_residu?: number;
  satuan_id?: number;
  jumlah?: number;
  keterangan?: string;
  kategori_aset?: {
    id: number;
    nama_kategori: string;
  };
  subkategori_aset?: {
    id: number;
    nama_subkategori: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AsetPagination {
  data: Aset[];
  current_page: number;
  from: number;
  to: number;
  total: number;
  per_page: number;
  last_page: number;
}

export interface AsetStatistics {
  total_aset: number;
  total_nilai_perolehan: number;
  by_status: Array<{ status: string; total: number }>;
  by_kondisi: Array<{ kondisi_fisik: string; total: number }>;
  by_kategori: Array<{ kategori: string; total: number }>;
  perlu_pemeliharaan: number;
}

export const createAset = async (data: any) => {
  // Convert string IDs to numbers where needed
  const payload = {
    ...data,
    kategori_aset_id: data.kategori_aset_id
      ? parseInt(data.kategori_aset_id)
      : null,
    subkategori_aset_id: data.subkategori_aset_id
      ? parseInt(data.subkategori_aset_id)
      : null,
    detail_kategori_aset_id: data.detail_kategori_aset_id
      ? parseInt(data.detail_kategori_aset_id)
      : null,
    mata_uang_id: data.mata_uang_id ? parseInt(data.mata_uang_id) : null,
    entitas_id: data.entitas_id ? parseInt(data.entitas_id) : null,
    satker_id: data.satker_id ? parseInt(data.satker_id) : null,
    unit_eselon_ii_id: data.unit_eselon_ii_id
      ? parseInt(data.unit_eselon_ii_id)
      : null,
    penanggung_jawab_aset_id: data.penanggung_jawab_aset_id
      ? parseInt(data.penanggung_jawab_aset_id)
      : null,
    metode_penyusutan_id: data.metode_penyusutan_id
      ? parseInt(data.metode_penyusutan_id)
      : null,
    satuan_id: data.satuan_id ? parseInt(data.satuan_id) : null,
    tahun_perolehan: parseInt(data.tahun_perolehan),
    nilai_perolehan: parseFloat(data.nilai_perolehan),
    masa_manfaat: data.masa_manfaat ? parseInt(data.masa_manfaat) : null,
    nilai_residu: data.nilai_residu ? parseFloat(data.nilai_residu) : null,
    jumlah: data.jumlah ? parseInt(data.jumlah) : null,
  };

  const response = await axiosInstance.post("/api/v1/aset", payload);
  return response.data;
};

export const getAsets = async (params?: any): Promise<AsetPagination> => {
  const response = await axiosInstance.get("/api/v1/aset", { params });
  return response.data;
};

export const getAsetById = async (id: number): Promise<Aset> => {
  const response = await axiosInstance.get(`/api/v1/aset/${id}`);
  return response.data.data;
};

export const updateAset = async (id: number, data: any) => {
  const payload = {
    ...data,
    kategori_aset_id: data.kategori_aset_id
      ? parseInt(data.kategori_aset_id)
      : null,
    subkategori_aset_id: data.subkategori_aset_id
      ? parseInt(data.subkategori_aset_id)
      : null,
    detail_kategori_aset_id: data.detail_kategori_aset_id
      ? parseInt(data.detail_kategori_aset_id)
      : null,
    mata_uang_id: data.mata_uang_id ? parseInt(data.mata_uang_id) : null,
    entitas_id: data.entitas_id ? parseInt(data.entitas_id) : null,
    satker_id: data.satker_id ? parseInt(data.satker_id) : null,
    unit_eselon_ii_id: data.unit_eselon_ii_id
      ? parseInt(data.unit_eselon_ii_id)
      : null,
    penanggung_jawab_aset_id: data.penanggung_jawab_aset_id
      ? parseInt(data.penanggung_jawab_aset_id)
      : null,
    metode_penyusutan_id: data.metode_penyusutan_id
      ? parseInt(data.metode_penyusutan_id)
      : null,
    satuan_id: data.satuan_id ? parseInt(data.satuan_id) : null,
    tahun_perolehan: parseInt(data.tahun_perolehan),
    nilai_perolehan: parseFloat(data.nilai_perolehan),
    masa_manfaat: data.masa_manfaat ? parseInt(data.masa_manfaat) : null,
    nilai_residu: data.nilai_residu ? parseFloat(data.nilai_residu) : null,
    jumlah: data.jumlah ? parseInt(data.jumlah) : null,
  };

  const response = await axiosInstance.put(`/api/v1/aset/${id}`, payload);
  return response.data;
};

export const deleteAset = async (id: number) => {
  const response = await axiosInstance.delete(`/api/v1/aset/${id}`);
  return response.data;
};

export const getAsetStatistics = async (): Promise<AsetStatistics> => {
  const response = await axiosInstance.get("/api/v1/aset/statistics/summary");
  return response.data.data;
};
