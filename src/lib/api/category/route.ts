import axiosInstance from "@/lib/axios";

export interface CategoryFormData {
  kode_kategori: string;
  nama_kategori: string;
  deskripsi?: string;
  status: "aktif" | "tidak_aktif";
}

export const createCategory = async (data: CategoryFormData) => {
  const response = await axiosInstance.post("/api/v1/kategori-aset", data);
  return response.data;
};

export const updateCategory = async (id: number, data: CategoryFormData) => {
  const response = await axiosInstance.put(`/api/v1/kategori-aset/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await axiosInstance.delete(`/api/v1/kategori-aset/${id}`);
  return response.data;
};
