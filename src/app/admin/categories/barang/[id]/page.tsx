"use client";

import {
  BoxesIcon,
  Archive,
  ChartPie,
  Search,
  SquarePen,
  Trash,
  Group,
  Download,
  FolderInput,
  Eye,
  ArrowLeft,
  Package,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SubkategoriAset } from "@/utils/types";
import axiosInstance from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import {
  createSubkategori,
  deleteSubkategori,
  updateSubkategori,
  getSubkategoriByKategori,
  getKategoriInfo,
  CreateSubkategoriData,
  UpdateSubkategoriData,
} from "@/lib/api/subkategori/route";
import DeleteConfirmationModal from "@/components/core/Delete.Modal";
import EditSubkategoriModal from "@/components/core/EditSubkategoriModal";
import { useUser } from "@/context/UserContext";
import { useParams, useRouter } from "next/navigation";
import CreateSubkategoriModal from "@/components/core/CreateSubkategoriModal";

interface CategoryInfo {
  id: number;
  nama_kategori: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export default function CategorySubkategoriPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [datas, setData] = useState<SubkategoriAset[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("-");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [subkategoriIdToDelete, setSubkategoriIdToDelete] =
    useState<SubkategoriAset | null>(null);
  const [perPage] = useState(5);
  const [filteredData, setFilteredData] = useState<SubkategoriAset[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [subkategoriToEdit, setSubkategoriToEdit] =
    useState<SubkategoriAset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useUser();

  // Hitung statistik berdasarkan data
  const totalSubkategori = datas.length;
  const activeSubkategori = datas.filter((s) => s.status === "aktif").length;
  const unActiveSubkategori = datas.filter(
    (s) => s.status === "tidak_aktif"
  ).length;
  const activePercentage = totalSubkategori
    ? ((activeSubkategori / totalSubkategori) * 100).toFixed(2)
    : 0;

  const fetchCategorySubkategori = async () => {
    try {
      setIsLoading(true);

      const subkategoriResponse = await getSubkategoriByKategori(categoryId);

      setData(subkategoriResponse || []);

      if (subkategoriResponse.length > 0) {
        const kategori = subkategoriResponse[0].kategori_aset;

        if (kategori) {
          setCategoryInfo({
            id: kategori.id,
            nama_kategori: kategori.nama_kategori,
            status: kategori.status,
            created_at: (kategori as any).created_at,
            updated_at: (kategori as any).updated_at,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data subkategori");
      setData([]);
      setCategoryInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubkategori = async (
    newSubkategori: CreateSubkategoriData
  ) => {
    try {
      await createSubkategori(newSubkategori);
      toast.success("Berhasil menambahkan subkategori");
      fetchCategorySubkategori();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating subkategori:", error);
      toast.error("Gagal menambahkan subkategori");
    }
  };

  const handleUpdateSubkategori = async (
    updatedData: UpdateSubkategoriData
  ) => {
    if (!subkategoriToEdit || !subkategoriToEdit.id) {
      toast.error("ID subkategori tidak ditemukan");
      return;
    }

    try {
      await updateSubkategori(subkategoriToEdit.id, updatedData);
      toast.success("Subkategori berhasil diperbarui");
      setIsEditModalOpen(false);
      setSubkategoriToEdit(null);
      await fetchCategorySubkategori();
    } catch (error) {
      console.error("Error updating subkategori:", error);
      toast.error("Gagal memperbarui subkategori");
    }
  };

  const handleEditSubkategoriClick = (subkategori: SubkategoriAset) => {
    setSubkategoriToEdit(subkategori);
    setIsEditModalOpen(true);
  };

  const handleDeleteIdSubkategori = async (subkategori: SubkategoriAset) => {
    setSubkategoriIdToDelete(subkategori);
    setDeleteModal(true);
  };

  const handleDeleteSubkategori = async (id: number) => {
    try {
      await deleteSubkategori(id);
      toast.success("Berhasil menghapus subkategori");
      setDeleteModal(false);
      fetchCategorySubkategori();
    } catch (error: any) {
      console.error("Error deleting subkategori:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus subkategori";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategorySubkategori();
    }
  }, [categoryId]);

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
          data.nama_subkategori
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
                onClick={() => router.back()}
                className="p-2 text-primary hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  Subkategori: {categoryInfo?.nama_kategori || "Loading..."}
                </h1>
                <p className="mt-2 text-gray-600">
                  Status Kategori:
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      categoryInfo?.status === "aktif"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {categoryInfo?.status}
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
              Tambah Subkategori +
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
                    Total Subkategori
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {totalSubkategori}
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
                    Subkategori Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {activeSubkategori}
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
                    Subkategori Non Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {unActiveSubkategori}
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
            placeholder="Cari nama subkategori, kode, atau deskripsi..."
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
            Data Subkategori - {categoryInfo?.nama_kategori}
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
                  NAMA SUBKATEGORI
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  DESKRIPSI
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  STATUS
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  TANGGAL DIBUAT
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
                    className="bg-background border-y border-secondary animate-pulse"
                  >
                    {Array.from({ length: 6 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-4 sm:px-6 py-4">
                        <div className="h-4 bg-gray-300 rounded-md w-20 mx-auto"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 sm:px-6 py-8 text-center text-text"
                  >
                    {filteredData.length === 0 && datas.length > 0 ? (
                      "Tidak ada data yang sesuai dengan filter"
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Belum ada subkategori pada kategori ini
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Data subkategori sesuai kategori akan tampil di sini
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                currentItems.map((data, idx) => (
                  <tr
                    key={data.id || idx}
                    className="bg-background text-sm font-medium text-text text-center border-y border-secondary"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-left">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/categories/barang/${categoryId}/detail/${data.id}`
                          )
                        }
                        className="text-primary hover:text-primary/80 underline font-semibold"
                      >
                        {data.nama_subkategori}
                      </button>
                    </td>
                    <td className="px-4 sm:px-6 py-4 max-w-xs truncate">
                      {data.deskripsi || "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          data.status === "aktif"
                            ? "bg-green-500 text-green-100 border border-green-800"
                            : data.status === "tidak_aktif"
                            ? "bg-red-700 text-red-100 border border-red-800"
                            : "bg-gray-800/50 text-gray-300 border border-gray-700"
                        }`}
                      >
                        {data.status === "aktif"
                          ? "Aktif"
                          : data.status === "tidak_aktif"
                          ? "Tidak Aktif"
                          : data.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {new Date(data.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-2.5 justify-center">
                        <button
                          onClick={() => handleEditSubkategoriClick(data)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit Subkategori"
                        >
                          <SquarePen />
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/categories/barang/${categoryId}/detail/${data.id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800"
                          title="Detail Kategori"
                        >
                          <Tag />
                        </button>
                        <button
                          onClick={() => handleDeleteIdSubkategori(data)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus Subkategori"
                        >
                          <Trash />
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
              {filteredData.length} subkategori
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
      {deleteModal && subkategoriIdToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          itemName={subkategoriIdToDelete.nama_subkategori}
          onConfirm={() => handleDeleteSubkategori(subkategoriIdToDelete.id)}
        />
      )}

      {isModalOpen && (
        <CreateSubkategoriModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateSubkategori}
          categoryId={categoryId}
          categoryName={categoryInfo?.nama_kategori}
        />
      )}

      {isEditModalOpen && subkategoriToEdit && (
        <EditSubkategoriModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSubkategoriToEdit(null);
          }}
          onSubmit={handleUpdateSubkategori}
          subkategori={subkategoriToEdit}
          categoryName={categoryInfo?.nama_kategori}
        />
      )}
    </>
  );
}
