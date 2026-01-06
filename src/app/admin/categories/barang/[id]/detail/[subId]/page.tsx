"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Download,
  FolderInput,
  Group,
  BoxesIcon,
  Archive,
  ChartPie,
  Edit,
  Trash2,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useUser } from "../../../../../../../context/UserContext";
import {
  DetailKategoriAset,
  getDetailKategoriBySubkategori,
  createDetailKategori,
  updateDetailKategori,
  deleteDetailKategori,
  CreateDetailKategoriData,
  UpdateDetailKategoriData,
} from "../../../../../../../lib/api/detailkategori";
import { getSubkategoriById } from "../../../../../../../lib/api/subkategori/route";
import CreateDetailKategoriModal from "../../../../../../../components/core/CreateDetailKategoriModal";
import EditDetailKategoriModal from "../../../../../../../components/core/EditDetailKategoriModal";
import DeleteConfirmationModal from "../../../../../../../components/core/Delete.Modal";

interface SubkategoriInfo {
  id: number;
  nama_subkategori: string;
  kategori_aset_id: number;
  status: string;
  kategori_aset?: {
    id: number;
    nama_kategori: string;
    status: string;
  };
}

export default function DetailKategoriPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subkategoriId = params.subId as string;
  const kategoriId = params.id as string;

  const [datas, setData] = useState<DetailKategoriAset[]>([]);
  const [subkategoriInfo, setSubkategoriInfo] =
    useState<SubkategoriInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("-");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailKategoriIdToDelete, setDetailKategoriIdToDelete] =
    useState<DetailKategoriAset | null>(null);
  const [perPage] = useState(5);
  const [filteredData, setFilteredData] = useState<DetailKategoriAset[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [detailKategoriToEdit, setDetailKategoriToEdit] =
    useState<DetailKategoriAset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useUser();

  // Hitung statistik berdasarkan data
  const totalDetailKategori = datas.length;
  const activeDetailKategori = datas.filter((d) => d.status === "aktif").length;
  const unActiveDetailKategori = datas.filter(
    (d) => d.status === "tidak_aktif"
  ).length;
  const activePercentage = totalDetailKategori
    ? ((activeDetailKategori / totalDetailKategori) * 100).toFixed(2)
    : 0;

  const fetchDetailKategori = async () => {
    try {
      setIsLoading(true);

      // Fetch detail kategori
      const detailKategoriResponse = await getDetailKategoriBySubkategori(
        subkategoriId
      );
      setData(detailKategoriResponse || []);

      // Fetch subkategori info
      const subkategoriResponse = await getSubkategoriById(
        parseInt(subkategoriId)
      );
      setSubkategoriInfo(subkategoriResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data detail kategori");
      setData([]);
      setSubkategoriInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDetailKategori = async (
    newDetailKategori: CreateDetailKategoriData
  ) => {
    try {
      await createDetailKategori(newDetailKategori);
      toast.success("Berhasil menambahkan detail kategori");
      fetchDetailKategori();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating detail kategori:", error);
      toast.error("Gagal menambahkan detail kategori");
    }
  };

  const handleUpdateDetailKategori = async (
    updatedData: UpdateDetailKategoriData
  ) => {
    if (!detailKategoriToEdit || !detailKategoriToEdit.id) {
      toast.error("ID detail kategori tidak ditemukan");
      return;
    }

    try {
      await updateDetailKategori(detailKategoriToEdit.id, updatedData);
      toast.success("Detail kategori berhasil diperbarui");
      setIsEditModalOpen(false);
      setDetailKategoriToEdit(null);
      await fetchDetailKategori();
    } catch (error) {
      console.error("Error updating detail kategori:", error);
      toast.error("Gagal memperbarui detail kategori");
    }
  };

  const handleEditDetailKategoriClick = (
    detailKategori: DetailKategoriAset
  ) => {
    setDetailKategoriToEdit(detailKategori);
    setIsEditModalOpen(true);
  };

  const handleDeleteIdDetailKategori = async (
    detailKategori: DetailKategoriAset
  ) => {
    setDetailKategoriIdToDelete(detailKategori);
    setDeleteModal(true);
  };

  const handleDeleteDetailKategori = async (id: number) => {
    try {
      await deleteDetailKategori(id);
      toast.success("Berhasil menghapus detail kategori");
      setDeleteModal(false);
      fetchDetailKategori();
    } catch (error: any) {
      console.error("Error deleting detail kategori:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus detail kategori";
      toast.error(errorMessage);
    }
  };

  const handleViewProducts = (detailKategoriId: number) => {
    const params = new URLSearchParams();
    params.set("kategori_id", kategoriId);
    params.set("subkategori_id", subkategoriId);
    params.set("detail_kategori_id", detailKategoriId.toString());

    router.push(`/admin/products?${params.toString()}`);
  };

  useEffect(() => {
    if (kategoriId && subkategoriId) {
      fetchDetailKategori();
    }
  }, [kategoriId, subkategoriId]);

  // Filter dan search data
  useEffect(() => {
    let filtered = datas;

    // Filter berdasarkan status
    if (statusFilter !== "-") {
      filtered = filtered.filter((data) => data.status === statusFilter);
    }

    // Filter berdasarkan pencarian
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (data) =>
          data.nama_detail_kategori
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          data.kode_detail_kategori
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          data.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [statusFilter, searchTerm, datas]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Pagination
  const indexOfLastItem = currentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / perPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

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

  return (
    <>
      <Toaster position="top-right" />
      <div className="mt-20 p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() =>
                  router.push(`/admin/categories/barang/${kategoriId}`)
                }
                className="p-2 text-primary hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  Detail Kategori: {subkategoriInfo?.nama_subkategori}
                </h1>
                <p className="mt-2 text-gray-600">
                  Kategori: {subkategoriInfo?.kategori_aset?.nama_kategori} |
                  Status Subkategori:
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      subkategoriInfo?.status === "aktif"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {subkategoriInfo?.status === "aktif"
                      ? "Aktif"
                      : "Tidak Aktif"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer"
            >
              Tambah Detail Kategori +
            </button>
          </div>
        </div>
      </div>

      {/* Card Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`card-skeleton-${index}`}
              className="bg-white rounded-lg shadow-md border p-5 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                  <div className="h-6 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="bg-gray-300 p-4 rounded-sm w-16 h-16"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-text font-medium text-sm">
                    Total Detail Kategori
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {totalDetailKategori}
                  </p>
                </div>
                <div className="bg-primary p-4 rounded-sm text-background">
                  <Group className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-text font-medium text-sm">
                    Detail Kategori Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {activeDetailKategori}
                  </p>
                </div>
                <div className="bg-primary p-4 rounded-sm text-background">
                  <BoxesIcon className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-text font-medium text-sm">
                    Detail Kategori Non Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {unActiveDetailKategori}
                  </p>
                </div>
                <div className="bg-primary p-4 rounded-sm text-background">
                  <Archive className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-text font-medium text-sm">
                    Persentase Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {activePercentage}%
                  </p>
                </div>
                <div className="bg-primary p-4 rounded-sm text-background">
                  <ChartPie className="w-8 h-8" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white mx-2 sm:mx-6 my-6 sm:my-9 border border-secondary rounded-lg px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-4 sm:gap-6 shadow-md">
        <div className="lg:flex lg:items-center grid gap-3">
          <h1 className="text-sm font-medium text-text">Filter:</h1>

          <select
            name="status-filter"
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="border border-secondary px-3 sm:px-4 py-2 rounded-sm text-text font-medium text-sm"
          >
            <option value="-">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="tidak_aktif">Tidak Aktif</option>
          </select>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <input
            type="search"
            name="search"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari nama detail kategori, kode, atau deskripsi..."
            className="border border-secondary px-3 sm:px-4 py-2 rounded-sm font-medium text-sm flex-1"
          />
          <button
            type="button"
            className="bg-primary/90 hover:bg-primary transition-colors duration-200 cursor-pointer ease-in-out p-2 rounded-sm text-white"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-secondary rounded-lg mx-2 sm:mx-6 mb-6">
        <div className="flex justify-between items-center mx-4 sm:mx-6 py-6">
          <h2 className="font-medium text-text text-2xl">
            Data Detail Kategori - {subkategoriInfo?.nama_subkategori}
          </h2>
          <div className="flex items-center gap-3">
            <button className="bg-secondary text-white p-2 rounded-sm hover:bg-secondary/90">
              <Download />
            </button>
            <button className="bg-secondary text-white p-2 rounded-sm hover:bg-secondary/90">
              <FolderInput />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-text/15">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  KODE DETAIL KATEGORI
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  NAMA DETAIL KATEGORI
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  DESKRIPSI
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  STATUS
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: perPage }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className="bg-white border-y border-secondary animate-pulse"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 sm:px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Group className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tidak ada detail kategori
                      </h3>
                      <p className="text-gray-500">
                        Belum ada detail kategori yang ditambahkan untuk
                        subkategori ini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((data, idx) => (
                  <tr
                    key={data.id || idx}
                    className="bg-white text-sm font-medium text-text text-center border-y border-secondary hover:bg-gray-50"
                  >
                    <td className="px-4 sm:px-6 py-4 text-left">
                      {data.kode_detail_kategori}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-left font-semibold">
                      <button
                        onClick={() => handleViewProducts(data.id)}
                        className="text-primary hover:text-primary/80 underline"
                      >
                        {data.nama_detail_kategori}
                      </button>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-left">
                      {data.deskripsi || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          data.status === "aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {data.status === "aktif" ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditDetailKategoriClick(data)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Edit Detail Kategori"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIdDetailKategori(data)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Hapus Detail Kategori"
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
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 gap-3">
          <div>
            <h3 className="text-sm sm:text-base">
              Menampilkan {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
              {filteredData.length} detail kategori
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 sm:px-4 py-2 border border-secondary rounded-sm font-medium text-sm ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-secondary hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 sm:px-4 py-2 rounded-sm font-medium text-sm ${
                  currentPage === pageNum
                    ? "bg-primary text-background glow-box"
                    : "border border-secondary text-text hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 sm:px-4 py-2 border border-secondary rounded-sm font-medium text-sm ${
                currentPage === totalPages || totalPages === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-secondary hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {deleteModal && detailKategoriIdToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          itemName={detailKategoriIdToDelete.nama_detail_kategori}
          onConfirm={() =>
            handleDeleteDetailKategori(detailKategoriIdToDelete.id)
          }
        />
      )}

      {isModalOpen && (
        <CreateDetailKategoriModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateDetailKategori}
          subkategoriId={subkategoriId}
          subkategoriName={subkategoriInfo?.nama_subkategori}
          kategoriName={subkategoriInfo?.kategori_aset?.nama_kategori}
        />
      )}

      {isEditModalOpen && detailKategoriToEdit && (
        <EditDetailKategoriModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setDetailKategoriToEdit(null);
          }}
          onSubmit={handleUpdateDetailKategori}
          detailKategori={detailKategoriToEdit}
          subkategoriName={subkategoriInfo?.nama_subkategori}
          kategoriName={subkategoriInfo?.kategori_aset?.nama_kategori}
        />
      )}
    </>
  );
}
