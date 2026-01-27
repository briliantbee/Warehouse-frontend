import axiosInstance from "@/lib/axios";

export interface UnitEselonII {
  id: number;
  satker_id: number;
  kode_unit: string;
  nama_unit: string;
  deskripsi?: string;
  status: string;
}

export interface PenanggungJawabAset {
  id: number;
  nama_pic: string;
  nip: string;
  jabatan: string;
  email: string;
  telepon: string;
  unit_eselon_ii_id: number;
  status: string;
  user_id?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  user?: any;
  unitEselonIi?: UnitEselonII;
  asets?: any[];
}

export interface PenanggungJawabAsetFormData {
  nama_pic: string;
  nip: string;
  jabatan: string;
  email: string;
  telepon: string;
  unit_eselon_ii_id: number;
  status: string;
  user_id?: number;
}

/**
 * Get all penanggung jawab aset
 */
export const getPenanggungJawabAset = async (params?: {
  unit_eselon_ii_id?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number | "all";
  page?: number;
}) => {
  const response = await axiosInstance.get("/api/v1/penanggung-jawab-aset", {
    params,
  });
  return response.data;
};

/**
 * Get single penanggung jawab aset by ID
 */
export const getPenanggungJawabAsetById = async (id: number) => {
  const response = await axiosInstance.get(
    `/api/v1/penanggung-jawab-aset/${id}`,
  );
  return response.data;
};

/**
 * Create new penanggung jawab aset
 */
export const createPenanggungJawabAset = async (
  data: PenanggungJawabAsetFormData,
) => {
  const response = await axiosInstance.post(
    "/api/v1/penanggung-jawab-aset",
    data,
  );
  return response.data;
};

/**
 * Update penanggung jawab aset
 */
export const updatePenanggungJawabAset = async (
  id: number,
  data: Partial<PenanggungJawabAsetFormData>,
) => {
  const response = await axiosInstance.put(
    `/api/v1/penanggung-jawab-aset/${id}`,
    data,
  );
  return response.data;
};

/**
 * Delete penanggung jawab aset (soft delete)
 */
export const deletePenanggungJawabAset = async (id: number) => {
  const response = await axiosInstance.delete(
    `/api/v1/penanggung-jawab-aset/${id}`,
  );
  return response.data;
};

/**
 * Get trashed penanggung jawab aset
 */
export const getTrashedPenanggungJawabAset = async (params?: {
  unit_eselon_ii_id?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number | "all";
  page?: number;
}) => {
  const response = await axiosInstance.get(
    "/api/v1/penanggung-jawab-aset/trashed",
    {
      params,
    },
  );
  return response.data;
};

/**
 * Restore soft deleted penanggung jawab aset
 */
export const restorePenanggungJawabAset = async (id: number) => {
  const response = await axiosInstance.patch(
    `/api/v1/penanggung-jawab-aset/${id}/restore`,
  );
  return response.data;
};

/**
 * Force delete penanggung jawab aset (permanent)
 */
export const forceDeletePenanggungJawabAset = async (id: number) => {
  const response = await axiosInstance.delete(
    `/api/v1/penanggung-jawab-aset/${id}/force`,
  );
  return response.data;
};
