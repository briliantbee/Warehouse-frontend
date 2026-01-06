import axiosInstance from "../../axios";

export interface DetailKategoriAset {
  id: number;
  kode_detail_kategori: string;
  nama_detail_kategori: string;
  deskripsi?: string;
  status: "aktif" | "tidak_aktif";
  subkategori_aset_id: number;
  created_at: string;
  updated_at: string;
  subkategori_aset?: {
    id: number;
    nama_subkategori: string;
    kategori_aset_id: number;
    kategori_aset?: {
      id: number;
      nama_kategori: string;
    };
  };
}

export interface CreateDetailKategoriData {
  subkategori_aset_id: number;
  kode_detail_kategori: string;
  nama_detail_kategori: string;
  deskripsi?: string;
  status: "aktif" | "tidak_aktif";
}

export interface UpdateDetailKategoriData {
  subkategori_aset_id: number;
  kode_detail_kategori: string;
  nama_detail_kategori: string;
  deskripsi?: string;
  status: "aktif" | "tidak_aktif";
}

// Get detail kategori list with filters
export const getDetailKategori = async (params?: {
  kategori_aset_id?: string;
  subkategori_aset_id?: string;
  status?: string;
  search?: string;
  per_page?: number;
  page?: number;
}) => {
  const response = await axiosInstance.get("/api/v1/detail-kategori-aset", {
    params,
  });
  return response.data.data;
};

// Get detail kategori by subkategori
export const getDetailKategoriBySubkategori = async (subkategoriId: string) => {
  const response = await axiosInstance.get("/api/v1/detail-kategori-aset", {
    params: {
      subkategori_aset_id: subkategoriId,
    },
  });
  return response.data.data.data; // Pagination response
};

// Get detail kategori dropdown
export const getDetailKategoriDropdown = async (params?: {
  kategori_aset_id?: string;
  subkategori_aset_id?: string;
  search?: string;
}) => {
  const response = await axiosInstance.get(
    "/api/v1/detail-kategori-aset/dropdown",
    {
      params,
    }
  );
  return response.data.data;
};

// Create detail kategori
export const createDetailKategori = async (data: CreateDetailKategoriData) => {
  const response = await axiosInstance.post(
    "/api/v1/detail-kategori-aset",
    data
  );
  return response.data;
};

// Update detail kategori
export const updateDetailKategori = async (
  id: number,
  data: UpdateDetailKategoriData
) => {
  const response = await axiosInstance.put(
    `/api/v1/detail-kategori-aset/${id}`,
    data
  );
  return response.data;
};

// Delete detail kategori
export const deleteDetailKategori = async (id: number) => {
  const response = await axiosInstance.delete(
    `/api/v1/detail-kategori-aset/${id}`
  );
  return response.data;
};

// Get detail kategori by ID
export const getDetailKategoriById = async (id: number) => {
  const response = await axiosInstance.get(
    `/api/v1/detail-kategori-aset/${id}`
  );
  return response.data.data;
};
