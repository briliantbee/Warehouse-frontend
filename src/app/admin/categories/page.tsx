"use client";

import {
  BoxesIcon,
  Archive,
  ChartPie,
  Search,
  SquarePen,
  Trash,
  Group,
  Eye,
  Package,
} from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import CreateCategoryModal from "@/components/core/CreateCategoryModal";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/api/category/route";
import toast, { Toaster } from "react-hot-toast";
import z from "zod";
import DeleteConfirmationModal from "@/components/core/Delete.Modal";
import EditCategoryModal from "@/components/core/EditCategoryModal";
import Link from "next/link";

const categoryFormSchema = z.object({
  nama_kategori: z.string(),
  status: z.string(),
  deskripsi: z.string().optional(),
  kode_kategori: z.string(),
});

type CategoryFormSchema = z.infer<typeof categoryFormSchema>;

interface KategoriAset {
  id: number;
  kode_kategori: string;
  nama_kategori: string;
  deskripsi: string | null;
  status: "aktif" | "tidak_aktif";
  created_at: string;
  updated_at: string;
}

export default function CategoryPage() {
  const [datas, setData] = useState<KategoriAset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("-");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryIdToDelete, setCategoryIdToDelete] =
    useState<KategoriAset | null>(null);
  const [perPage] = useState(5);
  const [filteredData, setFilteredData] = useState<KategoriAset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<KategoriAset | null>(
    null
  );

  const totalCategories = datas.length;
  const activeCategories = datas.filter((c) => c.status === "aktif").length;
  const unActiveCategories = datas.filter(
    (c) => c.status === "tidak_aktif"
  ).length;
  const activePercentage = totalCategories
    ? ((activeCategories / totalCategories) * 100).toFixed(2)
    : 0;

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/v1/kategori-aset");
      setData(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat data kategori");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategoryClick = (category: KategoriAset) => {
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (updatedData: any) => {
    if (!categoryToEdit) return;
    try {
      await updateCategory(categoryToEdit.id, updatedData);
      toast.success("Kategori berhasil diperbarui");
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Gagal memperbarui kategori";
      toast.error(errorMsg);
    }
  };

  const handleCreateCategory = async (newCategory: any) => {
    try {
      await createCategory(newCategory);
      toast.success("Berhasil menambahkan kategori");
      fetchCategories();
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Gagal menambahkan kategori";
      toast.error(errorMsg);
    }
  };

  const handleDeleteIdCategory = async (category: KategoriAset) => {
    setCategoryIdToDelete(category);
    setDeleteModal(true);
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      toast.success("Berhasil menghapus kategori");
      setDeleteModal(false);
      fetchCategories();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Gagal menghapus kategori";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = datas;

    if (statusFilter !== "-") {
      filtered = filtered.filter((data) => data.status === statusFilter);
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (data) =>
          data.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.kode_kategori.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="">
            <h1 className="text-3xl font-bold text-primary">Data Kategori</h1>
            <p className="mt-4 text-gray-800">
              Kelola kategori data barang gudang anda.
            </p>
          </div>

          <div className="">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer"
            >
              Tambah Kategori +
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
                    Total Kategori
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {totalCategories}
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
                    Kategori Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {activeCategories}
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
                    Kategori Non Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {unActiveCategories}
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
      <div className="bg-background mx-2 sm:mx-6 my-6 sm:my-9 border border-secondary rounded-lg px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-4 sm:gap-6 shadow-md">
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
            <option value="tidak_aktif">Non-aktif</option>
          </select>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <input
            type="search"
            name="search"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari kategori atau status..."
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
      <div className="bg-background border border-secondary rounded-lg mx-2 sm:mx-6 mb-6">
        <h2 className="font-medium text-text text-2xl px-4 sm:px-6 py-6">
          Data Kategori
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-text/15">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  NAMA KATEGORI
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
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-24 mx-auto"></div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-32 mx-auto"></div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-6 bg-gray-300 rounded-full w-16 mx-auto"></div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-24 mx-auto"></div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-20 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 sm:px-6 py-8 text-center text-text"
                  >
                    {filteredData.length === 0 && datas.length > 0
                      ? "Tidak ada data yang sesuai dengan filter"
                      : "Tidak ada data kategori"}
                  </td>
                </tr>
              ) : (
                currentItems.map((data, idx) => (
                  <tr
                    key={data.id || idx}
                    className="bg-background text-sm font-medium text-text text-center border-y border-secondary"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {data.nama_kategori}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          data.status === "aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {data.status === "aktif" ? "Aktif" : "Non-aktif"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {data.created_at
                        ? new Date(data.created_at).toLocaleDateString("id-ID")
                        : "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-2.5 justify-center">
                        <button
                          onClick={() => handleEditCategoryClick(data)}
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                          title="Edit"
                        >
                          <SquarePen />
                        </button>
                        <Link href={`/admin/categories/barang/${data.id}`}>
                          <button
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Lihat Subkategori"
                          >
                            <Eye />
                          </button>
                        </Link>
                        {/* <Link href={`/admin/products?kategori_id=${data.id}`}>
                          <button
                            className="text-green-600 hover:text-green-800 cursor-pointer"
                            title="Lihat Aset"
                          >
                            <Package />
                          </button>
                        </Link> */}
                        <button
                          onClick={() => handleDeleteIdCategory(data)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Hapus"
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
              {filteredData.length} kategori
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
      {isModalOpen && (
        <CreateCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateCategory}
        />
      )}
      {deleteModal && categoryIdToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          itemName={categoryIdToDelete.nama_kategori}
          onConfirm={() => handleDeleteCategory(categoryIdToDelete.id)}
        />
      )}
      {isEditModalOpen && categoryToEdit && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateCategory}
          initialData={{
            kode_kategori: categoryToEdit.kode_kategori,
            nama_kategori: categoryToEdit.nama_kategori,
            deskripsi: categoryToEdit.deskripsi || "",
            status: categoryToEdit.status,
          }}
        />
      )}
    </>
  );
}
