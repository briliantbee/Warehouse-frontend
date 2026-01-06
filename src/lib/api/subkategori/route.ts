import axiosInstance from "@/lib/axios";

export interface SubkategoriAset {
  id: number;
  kategori_aset_id: number;
  nama_subkategori: string;
  deskripsi?: string;
  status: "aktif" | "tidak_aktif";
  created_at: string;
  updated_at: string;
  kategori_aset?: {
    id: number;
    nama_kategori: string;
    status: string;
  };
}

export interface CreateSubkategoriData {
  kategori_aset_id: number;
  nama_subkategori: string;
  deskripsi?: string;
  status: "aktif" | "tidak_aktif";
}

export interface UpdateSubkategoriData {
  kategori_aset_id?: number;
  nama_subkategori?: string;
  deskripsi?: string;
  status?: "aktif" | "tidak_aktif";
}

// Get all subkategori aset dengan filter berdasarkan kategori_aset_id
export const getSubkategoriByKategori = async (
  kategoriId: string
): Promise<SubkategoriAset[]> => {
  const response = await axiosInstance.get(
    `/api/v1/subkategori-aset?kategori_aset_id=${kategoriId}`
  );
  return response.data.data;
};

// Get specific subkategori aset
export const getSubkategoriById = async (
  id: number
): Promise<SubkategoriAset> => {
  const response = await axiosInstance.get(`/api/v1/subkategori-aset/${id}`);
  return response.data.data;
};

// Create new subkategori aset
export const createSubkategori = async (
  data: CreateSubkategoriData
): Promise<SubkategoriAset> => {
  const response = await axiosInstance.post("/api/v1/subkategori-aset", data);
  return response.data.data;
};

// Update subkategori aset
export const updateSubkategori = async (
  id: number,
  data: UpdateSubkategoriData
): Promise<SubkategoriAset> => {
  const response = await axiosInstance.put(
    `/api/v1/subkategori-aset/${id}`,
    data
  );
  return response.data.data;
};

// Delete subkategori aset
export const deleteSubkategori = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/subkategori-aset/${id}`);
};

// Get kategori info
export const getKategoriInfo = async (id: string) => {
  const response = await axiosInstance.get(`/api/v1/subkategori-aset`);
  return response.data.data || response.data;
};
