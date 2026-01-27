"use client";

import { Search, SquarePen, Trash, Download, FolderInput } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import z from "zod";
import {
  getPenanggungJawabAset,
  createPenanggungJawabAset,
  updatePenanggungJawabAset,
  deletePenanggungJawabAset,
  PenanggungJawabAset,
  PenanggungJawabAsetFormData,
} from "@/lib/api/penanggungjawab/route";
import DeleteConfirmationModal from "@/components/core/Delete.Modal";
import CreateUserModal from "@/components/core/CreateUserModal";
import EditUserModal from "@/components/core/EditUserModal";

const penanggungJawabSchema = z.object({
  nama_pic: z
    .string()
    .min(1, "Nama wajib diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),

  nip: z
    .string()
    .min(1, "NIP wajib diisi")
    .regex(/^[0-9]+$/, "NIP hanya boleh berisi angka"),

  jabatan: z
    .string()
    .min(1, "Jabatan wajib diisi")
    .max(100, "Jabatan maksimal 100 karakter"),

  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(100, "Email maksimal 100 karakter"),

  telepon: z
    .string()
    .min(1, "Telepon wajib diisi")
    .regex(/^[0-9+\-\s()]+$/, "Format telepon tidak valid"),

  unit_eselon_ii_id: z.coerce
    .number()
    .int("Unit Eselon II ID harus berupa bilangan bulat")
    .positive("Unit Eselon II ID harus berupa angka positif"),

  status: z
    .string()
    .min(1, "Status wajib dipilih")
    .refine((val) => ["aktif", "tidak_aktif"].includes(val), {
      message: "Status tidak valid",
    }),

  user_id: z.coerce.number().optional(),
});

type PenanggungJawabFormSchema = z.infer<typeof penanggungJawabSchema>;

export default function UserPage() {
  const [datas, setData] = useState<PenanggungJawabAset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("-");
  const [unitEselonFilter, setUnitEselonFilter] = useState("-");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userIdToDelete, setUserIdToDelete] =
    useState<PenanggungJawabAset | null>(null);
  const [perPage] = useState(5);
  const [filteredData, setFilteredData] = useState<PenanggungJawabAset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<PenanggungJawabAset | null>(
    null,
  );
  const [selectedUser, setSelectedUser] = useState<PenanggungJawabAset | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Hitung statistik berdasarkan data yang sudah difilter
  const totalUsers = datas.length;
  const activeUsers = datas.filter((u) => u.status === "aktif").length;
  const inactiveUsers = datas.filter((u) => u.status === "tidak_aktif").length;
  const activePercentage = totalUsers
    ? ((activeUsers / totalUsers) * 100).toFixed(2)
    : 0;

  // Mendapatkan daftar unit eselon unik untuk dropdown filter
  const uniqueUnitEselon = Array.from(
    new Set(datas.map((user) => user.unitEselonIi?.nama_unit)),
  ).filter(Boolean);

  // Mendapatkan daftar status unik untuk dropdown filter
  const uniqueStatus = Array.from(
    new Set(datas.map((user) => user.status)),
  ).filter(Boolean);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getPenanggungJawabAset({ per_page: "all" });
      setData(response.data || []);
    } catch (error) {
      toast.error("Gagal memuat data penanggung jawab aset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (updatedData: PenanggungJawabAsetFormData) => {
    if (!userToEdit || !userToEdit.id) {
      toast.error("ID penanggung jawab tidak ditemukan");
      return;
    }

    try {
      await updatePenanggungJawabAset(userToEdit.id, updatedData);
      toast.success("Penanggung jawab berhasil diperbarui");
      setIsEditModalOpen(false);
      setUserToEdit(null);
      await fetchUsers();
    } catch (error) {
      toast.error("Gagal memperbarui penanggung jawab");
    }
  };

  const handleEditUserClick = (user: PenanggungJawabAset) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async (newUser: PenanggungJawabFormSchema) => {
    try {
      await createPenanggungJawabAset(newUser);
      toast.success("Berhasil menambahkan penanggung jawab");
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Gagal menambahkan penanggung jawab");
    }
  };

  const handleDeleteIdUser = async (user: PenanggungJawabAset) => {
    setUserIdToDelete(user);
    setDeleteModal(true);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deletePenanggungJawabAset(id);
      toast.success("Berhasil menghapus penanggung jawab");
      setDeleteModal(false);
      fetchUsers();
    } catch (error: any) {
      if (error.response?.data?.errors?.asets) {
        toast.error(error.response.data.errors.asets[0]);
      } else {
        toast.error("Gagal menghapus penanggung jawab");
      }
    }
  };

  const openDetailModal = (user: PenanggungJawabAset) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter dan search data
  useEffect(() => {
    let filtered = datas;

    // Filter berdasarkan status
    if (statusFilter !== "-") {
      filtered = filtered.filter((data) => data.status === statusFilter);
    }

    // Filter berdasarkan unit eselon
    if (unitEselonFilter !== "-") {
      filtered = filtered.filter(
        (data) => data.unitEselonIi?.nama_unit === unitEselonFilter,
      );
    }

    // Filter berdasarkan pencarian
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (data) =>
          data.nama_pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.telepon.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [statusFilter, unitEselonFilter, searchTerm, datas]);

  // Handle perubahan filter status
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // Handle perubahan filter unit eselon
  const handleUnitEselonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitEselonFilter(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle perubahan halaman
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Pagination
  const indexOfLastItem = currentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / perPage);

  // Generate page numbers untuk pagination
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

  // Format status display
  const formatStatus = (status: string) => {
    switch (status) {
      case "aktif":
        return "Aktif";
      case "tidak_aktif":
        return "Tidak Aktif";
      default:
        return status;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="mt-20 p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="">
            <h1 className="text-3xl font-bold text-primary">
              Manajemen Penanggung Jawab Aset
            </h1>
            <p className="mt-4 text-gray-800">
              Kelola data penanggung jawab aset sistem anda.
            </p>
          </div>

          <div className="">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
            >
              Tambah Penanggung Jawab +
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-background mx-2 sm:mx-6 mb-6 sm:mb-9 border border-secondary rounded-lg px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-4 sm:gap-6 shadow-md">
        <div className="lg:flex lg:items-center grid gap-3">
          <h1 className="text-sm font-medium text-text">Filter:</h1>

          {/* Filter Status */}
          <select
            name="status-filter"
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="border border-secondary px-3 sm:px-4 py-2 rounded-sm text-text font-medium text-sm"
          >
            <option value="-">Semua Status</option>
            {uniqueStatus.map((status, index) => (
              <option key={index} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          {/* Filter Unit Eselon */}
          <select
            name="unit-eselon-filter"
            id="unit-eselon-filter"
            value={unitEselonFilter}
            onChange={handleUnitEselonChange}
            className="border border-secondary px-3 sm:px-4 py-2 rounded-sm text-text font-medium text-sm"
          >
            <option value="-">Semua Unit Eselon</option>
            {uniqueUnitEselon.map((unit, index) => (
              <option key={index} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <input
            type="search"
            name="search"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari nama, NIP, email, jabatan, atau telepon..."
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
        <div className="flex justify-between items-center mx-4 sm:mx-6 py-6">
          <h2 className="font-medium text-text text-2xl">
            Data Penanggung Jawab
          </h2>
          <div className="flex items-center gap-3">
            <button className="bg-secondary text-white p-2 rounded-sm hover:bg-secondary/80 transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button className="bg-secondary text-white p-2 rounded-sm hover:bg-secondary/80 transition-colors">
              <FolderInput className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-text/15">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  NAMA PIC
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  NIP
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  JABATAN
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  EMAIL
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  TELEPON
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
                    className="bg-background border-y border-secondary animate-pulse"
                  >
                    {/* Nama Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-24 mx-auto"></div>
                    </td>
                    {/* NIP Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-28 mx-auto"></div>
                    </td>
                    {/* Jabatan Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-24 mx-auto"></div>
                    </td>
                    {/* Email Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-32 mx-auto"></div>
                    </td>
                    {/* Telepon Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-24 mx-auto"></div>
                    </td>
                    {/* Status Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-16 mx-auto"></div>
                    </td>
                    {/* Aksi Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-2.5 justify-center">
                        <div className="h-6 w-6 bg-gray-300 rounded"></div>
                        <div className="h-6 w-6 bg-gray-300 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 sm:px-6 py-8 text-center text-text"
                  >
                    {filteredData.length === 0 && datas.length > 0
                      ? "Tidak ada data yang sesuai dengan filter"
                      : "Tidak ada data penanggung jawab"}
                  </td>
                </tr>
              ) : (
                currentItems.map((data, idx) => (
                  <tr
                    key={data.id || idx}
                    className="bg-background text-sm font-medium text-text text-center border-y border-secondary hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold">
                      {data.nama_pic}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {data.nip}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {data.jabatan}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {data.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {data.telepon}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          data.status === "aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formatStatus(data.status)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-2.5 justify-center">
                        <button
                          onClick={() => handleEditUserClick(data)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Edit"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIdUser(data)}
                          className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash className="w-4 h-4" />
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
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 gap-3">
            <div>
              <h3 className="text-sm sm:text-base">
                Menampilkan {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
                {filteredData.length} penanggung jawab
              </h3>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 sm:px-4 py-2 border border-secondary rounded-sm font-medium text-sm transition-colors ${
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
                  className={`px-3 sm:px-4 py-2 rounded-sm font-medium text-sm transition-colors ${
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
                className={`px-3 sm:px-4 py-2 border border-secondary rounded-sm font-medium text-sm transition-colors ${
                  currentPage === totalPages || totalPages === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-secondary hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {deleteModal && userIdToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          itemName={userIdToDelete.nama_pic}
          onConfirm={() => handleDeleteUser(userIdToDelete.id)}
        />
      )}
      {isModalOpen && (
        <CreateUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateUser}
        />
      )}
      {isEditModalOpen && userToEdit && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setUserToEdit(null);
          }}
          onSubmit={handleUpdateUser}
          userData={userToEdit}
        />
      )}
    </>
  );
}
