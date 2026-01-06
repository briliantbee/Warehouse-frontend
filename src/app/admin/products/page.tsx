"use client";

import {
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  ArrowLeft,
  Building2,
  Calendar,
  Tag,
  ArrowRightLeft,
} from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import axiosInstance from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getAsets,
  deleteAset,
  getAsetStatistics,
  createAset,
  updateAset,
  type Aset,
  type AsetPagination,
  type AsetStatistics,
} from "@/lib/api/aset/route";
import CreateAssetModal from "@/components/core/CreateAssetModal";
import EditAssetModal from "@/components/core/EditAssetModal";
import DeleteConfirmationModal from "@/components/core/Delete.Modal";
import DisposalAssetModal from "@/components/core/DisposalAssetModal";

interface KategoriAset {
  id: number;
  nama_kategori: string;
  status: string;
}

interface SubkategoriAset {
  id: number;
  nama_subkategori: string;
  kategori_aset_id: number;
  status: string;
}

// Pisahkan komponen yang menggunakan useSearchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filter params from URL
  const kategoriIdParam = searchParams.get("kategori_id");
  const subkategoriIdParam = searchParams.get("subkategori_id");
  const detailKategoriIdParam = searchParams.get("detail_kategori_id");

  const [datas, setData] = useState<Aset[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAsetId, setSelectedAsetId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [asetToDelete, setAsetToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);
  const [asetToDisposal, setAsetToDisposal] = useState<{
    id: number;
    kode_barang: string;
    nama_aset: string;
  } | null>(null);
  const [pagination, setPagination] = useState<AsetPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("-");
  const [kondisiFilter, setKondisiFilter] = useState<string>("-");
  const [kategoriFilter, setKategoriFilter] = useState<string>(
    kategoriIdParam || "-"
  );
  const [subkategoriFilter, setSubkategoriFilter] = useState<string>(
    subkategoriIdParam || "-"
  );
  const [detailKategoriFilter, setDetailKategoriFilter] = useState<string>(
    detailKategoriIdParam || "-"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  // Dropdown data
  const [kategoriList, setKategoriList] = useState<KategoriAset[]>([]);
  const [subkategoriList, setSubkategoriList] = useState<SubkategoriAset[]>([]);
  const [filteredSubkategori, setFilteredSubkategori] = useState<
    SubkategoriAset[]
  >([]);

  // Statistics
  const [stats, setStats] = useState<AsetStatistics>({
    total_aset: 0,
    total_nilai_perolehan: 0,
    by_status: [],
    by_kondisi: [],
    by_kategori: [],
    perlu_pemeliharaan: 0,
  });

  const handleCreateAset = async (data: any, fotoFiles?: File[]) => {
    try {
      // If there are photo files, use FormData
      if (fotoFiles && fotoFiles.length > 0) {
        const formData = new FormData();

        // Append all form fields
        Object.keys(data).forEach((key) => {
          if (
            data[key] !== undefined &&
            data[key] !== null &&
            data[key] !== ""
          ) {
            formData.append(key, data[key]);
          }
        });

        // Append photo files
        fotoFiles.forEach((file) => {
          formData.append("foto_aset[]", file);
        });

        await axiosInstance.post("/api/v1/aset", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // No photos, send as regular JSON
        await createAset(data);
      }

      toast.success("Aset berhasil ditambahkan");
      setIsCreateModalOpen(false);
      fetchAssets();
      fetchStatistics();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Gagal menambahkan aset";
      toast.error(errorMsg);
    }
  };

  const handleUpdateAset = async (
    id: number,
    data: any,
    fotoFiles?: File[]
  ) => {
    try {
      // If there are photo files, use FormData
      if (fotoFiles && fotoFiles.length > 0) {
        const formData = new FormData();

        // Append all form fields
        Object.keys(data).forEach((key) => {
          if (
            data[key] !== undefined &&
            data[key] !== null &&
            data[key] !== ""
          ) {
            formData.append(key, data[key]);
          }
        });

        // Append photo files
        fotoFiles.forEach((file) => {
          formData.append("foto_aset[]", file);
        });

        // Use POST with _method for Laravel
        formData.append("_method", "PUT");

        await axiosInstance.post(`/api/v1/aset/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // No photos, send as regular JSON
        await updateAset(id, data);
      }

      toast.success("Aset berhasil diperbarui");
      setIsEditModalOpen(false);
      setSelectedAsetId(null);
      fetchAssets();
      fetchStatistics();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Gagal memperbarui aset";
      toast.error(errorMsg);
    }
  };

  const handleEditClick = (asetId: number) => {
    setSelectedAsetId(asetId);
    setIsEditModalOpen(true);
  };

  const handleDisposalClick = (aset: Aset) => {
    setAsetToDisposal({
      id: aset.id,
      kode_barang: aset.kode_barang,
      nama_aset: aset.nama_aset,
    });
    setIsDisposalModalOpen(true);
  };

  const handleSubmitDisposal = async (id: number, data: any) => {
    try {
      const config =
        data instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};

      await axiosInstance.post(`/api/v1/aset/${id}/disposal`, data, config);
      toast.success("Pengajuan disposal berhasil disubmit");
      setIsDisposalModalOpen(false);
      setAsetToDisposal(null);
      fetchAssets();
      fetchStatistics();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Gagal submit disposal";
      toast.error(errorMsg);
    }
  };

  const fetchAssets = async () => {
    try {
      setIsLoading(true);

      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (statusFilter !== "-") params.status = statusFilter;
      if (kondisiFilter !== "-") params.kondisi_fisik = kondisiFilter;
      if (kategoriFilter !== "-") params.kategori_aset_id = kategoriFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await getAsets(params);
      setData(data.data || []);
      setPagination(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Gagal memuat data aset");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await getAsetStatistics();
      setStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchKategoriList = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/kategori-aset");
      setKategoriList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching kategori:", error);
    }
  };

  const fetchSubkategoriList = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/subkategori-aset");
      setSubkategoriList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subkategori:", error);
    }
  };

  useEffect(() => {
    if (kategoriFilter !== "-") {
      const filtered = subkategoriList.filter(
        (sub) => sub.kategori_aset_id.toString() === kategoriFilter
      );
      setFilteredSubkategori(filtered);

      if (
        subkategoriFilter !== "-" &&
        !filtered.some((sub) => sub.id.toString() === subkategoriFilter)
      ) {
        setSubkategoriFilter("-");
      }
    } else {
      setFilteredSubkategori(subkategoriList);
    }
  }, [kategoriFilter, subkategoriList, subkategoriFilter]);

  useEffect(() => {
    fetchAssets();
  }, [currentPage, statusFilter, kondisiFilter, kategoriFilter, searchTerm]);

  useEffect(() => {
    fetchStatistics();
    fetchKategoriList();
    fetchSubkategoriList();
  }, []);

  useEffect(() => {
    if (kategoriIdParam) {
      setKategoriFilter(kategoriIdParam);
    }
    if (subkategoriIdParam) {
      setSubkategoriFilter(subkategoriIdParam);
    }
  }, [kategoriIdParam, subkategoriIdParam]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAssets();
  };

  const handleDeleteClick = (aset: Aset) => {
    setAsetToDelete({ id: aset.id, name: aset.nama_aset });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!asetToDelete) return;

    try {
      await deleteAset(asetToDelete.id);
      toast.success("Aset berhasil dihapus");
      setIsDeleteModalOpen(false);
      setAsetToDelete(null);
      fetchAssets();
      fetchStatistics();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Gagal menghapus aset");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aktif: "bg-green-100 text-green-800",
      dalam_pemeliharaan: "bg-yellow-100 text-yellow-800",
      rusak: "bg-red-100 text-red-800",
      dipindahtangankan: "bg-blue-100 text-blue-800",
      dihapus: "bg-gray-100 text-gray-800",
    };

    return (
      statusConfig[status as keyof typeof statusConfig] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getKondisiBadge = (kondisi: string) => {
    const kondisiConfig = {
      baik: "bg-green-100 text-green-800",
      rusak_ringan: "bg-yellow-100 text-yellow-800",
      rusak_berat: "bg-red-100 text-red-800",
    };

    return (
      kondisiConfig[kondisi as keyof typeof kondisiConfig] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getPageNumbers = () => {
    if (!pagination) return [];

    const pageNumbers = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.last_page;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const selectedKategoriName =
    kategoriFilter !== "-"
      ? kategoriList.find((k) => k.id.toString() === kategoriFilter)
          ?.nama_kategori
      : null;

  const selectedSubkategoriName =
    subkategoriFilter !== "-"
      ? subkategoriList.find((s) => s.id.toString() === subkategoriFilter)
          ?.nama_subkategori
      : null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="mt-20 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Aset
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola semua aset dan inventaris
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {(kategoriIdParam || subkategoriIdParam) && (
              <button
                onClick={() => router.push("/admin/categories")}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Kategori
              </button>
            )}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Aset
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md border p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 font-medium text-sm">
                  Total Aset
                </h3>
                <p className="text-gray-900 font-semibold text-xl mt-2">
                  {stats?.total_aset || 0}
                </p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg text-white">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 font-medium text-sm">
                  Total Nilai
                </h3>
                <p className="text-gray-900 font-semibold text-xl mt-2">
                  {formatCurrency(stats?.total_nilai_perolehan || 0)}
                </p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg text-white">
                <Tag className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 font-medium text-sm">
                  Aset Aktif
                </h3>
                <p className="text-gray-900 font-semibold text-xl mt-2">
                  {stats?.by_status?.find((s) => s.status === "aktif")?.total ||
                    0}
                </p>
              </div>
              <div className="bg-emerald-600 p-3 rounded-lg text-white">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 font-medium text-sm">
                  Perlu Pemeliharaan
                </h3>
                <p className="text-gray-900 font-semibold text-xl mt-2">
                  {stats?.perlu_pemeliharaan || 0}
                </p>
              </div>
              <div className="bg-orange-600 p-3 rounded-lg text-white">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-medium text-gray-700">Filter:</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="-">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="dalam_pemeliharaan">Dalam Pemeliharaan</option>
                <option value="rusak">Rusak</option>
                <option value="dipindahtangankan">Dipindahtangankan</option>
                <option value="dihapus">Dihapus</option>
              </select>

              <select
                value={kondisiFilter}
                onChange={(e) => setKondisiFilter(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="-">Semua Kondisi</option>
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Cari kode barang, nama aset, atau NUP..."
            className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-64"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Daftar Aset -{" "}
              {selectedKategoriName && (
                <span className="text-lg text-gray-600 font-normal">
                  {selectedKategoriName}
                  {selectedSubkategoriName && ` / ${selectedSubkategoriName}`}
                </span>
              )}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nilai Perolehan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kondisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: perPage }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                        <div className="h-3 bg-gray-300 rounded w-24 mt-1"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-300 rounded w-28"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 bg-gray-300 rounded w-20 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : datas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Tidak ada aset ditemukan
                        </p>
                        <p className="text-gray-600">
                          Coba ubah filter atau tambah aset baru
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  datas.map((aset) => (
                    <tr key={aset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {aset.nama_aset}
                          </div>
                          {aset.nup && (
                            <div className="text-xs text-gray-400">
                              NUP: {aset.nup}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">
                            {aset.kategori_aset?.nama_kategori}
                          </div>
                          {aset.subkategori_aset && (
                            <div className="text-xs text-gray-500">
                              {aset.subkategori_aset.nama_subkategori}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(aset.nilai_perolehan)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKondisiBadge(
                            aset.kondisi_fisik
                          )}`}
                        >
                          {aset.kondisi_fisik === "baik"
                            ? "Baik"
                            : aset.kondisi_fisik === "rusak_ringan"
                            ? "Rusak Ringan"
                            : "Rusak Berat"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            aset.status
                          )}`}
                        >
                          {aset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {aset.lokasi_fisik || "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${aset.id}`}>
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              title="Lihat Detail"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleEditClick(aset.id)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDisposalClick(aset)}
                            className="text-orange-600 hover:text-orange-800"
                            title="Disposal"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(aset)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {pagination.from}-{pagination.to} dari{" "}
                {pagination.total} aset
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.last_page, currentPage + 1)
                    )
                  }
                  disabled={currentPage === pagination.last_page}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isCreateModalOpen && (
        <CreateAssetModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAset}
          defaultKategoriId={kategoriIdParam}
          defaultSubkategoriId={subkategoriIdParam}
          defaultDetailKategoriId={detailKategoriIdParam}
        />
      )}
      {isEditModalOpen && selectedAsetId && (
        <EditAssetModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAsetId(null);
          }}
          onSubmit={handleUpdateAset}
          asetId={selectedAsetId}
        />
      )}
      {isDeleteModalOpen && asetToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setAsetToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          itemName={asetToDelete.name}
        />
      )}
      {isDisposalModalOpen && asetToDisposal && (
        <DisposalAssetModal
          isOpen={isDisposalModalOpen}
          onClose={() => {
            setIsDisposalModalOpen(false);
            setAsetToDisposal(null);
          }}
          onSubmit={handleSubmitDisposal}
          asset={asetToDisposal}
        />
      )}
    </>
  );
}

// Komponen utama dengan Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mt-20 p-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
