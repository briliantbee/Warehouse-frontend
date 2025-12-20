"use client";
import axiosInstance from "@/lib/axios";
import { useState, useEffect } from "react"; // Tambahkan useEffect
import {
  Group,
  BoxesIcon,
  ChartPie,
  Archive,
  FileInput,
  FileOutput,
} from "lucide-react";
import { Barang } from "@/utils/types";
import { useUser } from "@/context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import { Search } from "lucide-react";
import StockInModal from "@/components/core/StockInModal";
import StockOutModal from "@/components/core/StockOutModal";

export default function In() {
  const [datas, setData] = useState<Barang[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("-");
  const [categoryFilter, setCategoryFilter] = useState("-");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5); // Menampilkan 5 data per halaman
  const [filteredData, setFilteredData] = useState<Barang[]>([]);

  // State untuk StockIn Modal
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [selectedBarangForStockIn, setSelectedBarangForStockIn] =
    useState<Barang | null>(null);

  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [selectedBarangForStockOut, setSelectedBarangForStockOut] =
    useState<Barang | null>(null);

  const { user } = useUser();

  // Mendapatkan daftar kategori unik untuk dropdown filter
  const uniqueCategories = Array.from(
    new Set(datas.map((barang) => barang.kategori.nama_kategori))
  ).filter(Boolean);

  const fetchBarang = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/v1/barang");
      setData(response.data.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect untuk fetch data saat component mount
  useEffect(() => {
    fetchBarang();
  }, []);

  // useEffect untuk filtering data
  useEffect(() => {
    let filtered = [...datas];

    // Filter berdasarkan status
    if (statusFilter !== "-") {
      filtered = filtered.filter((barang) => barang.status === statusFilter);
    }

    // Filter berdasarkan kategori
    if (categoryFilter !== "-") {
      filtered = filtered.filter(
        (barang) => barang.kategori.nama_kategori === categoryFilter
      );
    }

    // Filter berdasarkan search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (barang) =>
          barang.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
          barang.kategori.nama_kategori
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  }, [datas, statusFilter, categoryFilter, searchTerm]);

  // Handle perubahan filter status
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // Handle perubahan filter kategori
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle perubahan halaman
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle Stock In - Perbaikan fungsi ini
  const handleStockIn = (barang: Barang) => {
    setSelectedBarangForStockIn(barang);
    setIsStockInModalOpen(true);
  };

  // Handle Stock In Submit
  const handleStockInSubmit = async (data: any) => {
    await fetchBarang();
    toast.success("Stock berhasil ditambahkan!");
  };

  // Handle Stock Out Submit
  const handleStockOutSubmit = async (data: any) => {
    try {
      // Refresh data setelah stock in berhasil
      await fetchBarang();
      toast.success("berhasil stock in barang");
    } catch (error) {
      toast.error("Gagal Menambah Stock");
    }
  };
  // Handle Stock Out (fungsi ini belum ada implementasinya, tambahkan jika diperlukan)
  const handleStockOut = (barang: Barang) => {
    setSelectedBarangForStockOut(barang);
    setIsStockOutModalOpen(true);
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

  return (
    <>
      <Toaster position="top-right" />
      <div className="mt-20 p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="">
            <h1 className="text-3xl font-bold text-primary">
              Stock Data Barang
            </h1>
            <p className="mt-4 text-gray-800">
              Kelola stock data barang gudang anda.
            </p>
          </div>
        </div>
      </div>

      {/* Card Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-5">
        {isLoading ? (
          // Skeleton Cards
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
            {/* Card 1 - Total Barang */}
            <div className="bg-white rounded-lg shadow-md border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-text font-medium text-sm">
                    Total Barang
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {datas.length}
                  </p>
                </div>
                <div className="bg-primary p-4 rounded-sm text-background">
                  <Group className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 2 - Barang Aktif */}
            <div className="bg-white rounded-lg shadow-md border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-text font-medium text-sm">
                    Barang Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {
                      datas.filter((barang) => barang.status === "active")
                        .length
                    }
                  </p>
                </div>
                <div className="bg-primary p-4 rounded-sm text-background">
                  <BoxesIcon className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 3 - Barang Non Aktif */}
            <div className="bg-white rounded-lg shadow-md border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-text font-medium text-sm">
                    Barang Non Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {
                      datas.filter((barang) => barang.status === "un-active")
                        .length
                    }
                  </p>
                </div>
                <div className="bg-primary p-4 rounded-sm text-background">
                  <Archive className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 4 - Persentase Aktif */}
            <div className="bg-white rounded-lg shadow-md border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-text font-medium text-sm">
                    Persentase Aktif
                  </h3>
                  <p className="text-text font-medium text-xl pt-2.5">
                    {datas.length > 0
                      ? Math.round(
                          (datas.filter((barang) => barang.status === "active")
                            .length /
                            datas.length) *
                            100
                        )
                      : 0}
                    %
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

          {/* Filter Status */}
          <select
            name="status-filter"
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="border border-secondary px-3 sm:px-4 py-2 rounded-sm text-text font-medium text-sm"
          >
            <option value="-">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="un-active">Non-aktif</option>
          </select>

          {/* Filter Kategori */}
          <select
            name="category-filter"
            id="category-filter"
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="border border-secondary px-3 sm:px-4 py-2 rounded-sm text-text font-medium text-sm"
          >
            <option value="-">Semua Kategori</option>
            {uniqueCategories.map((category, index) => (
              <option key={index} value={category}>
                {category}
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
            placeholder="Cari nama barang, kategori..."
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
          <h2 className="font-medium text-text text-2xl">Data Barang</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-text/15">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  NAMA BARANG
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  KATEGORI
                </th>

                <th className="px-4 sm:px-6 py-4 font-bold text-xs text-secondary whitespace-nowrap">
                  STOK SEKARANG
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
                    {/* Nama barang Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-20 mx-auto"></div>
                    </td>
                    {/* Kategori Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-24 mx-auto"></div>
                    </td>
                    {/* Stock sekarang Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-6 bg-gray-300 rounded-full w-16 mx-auto"></div>
                    </td>
                    {/* Status Skeleton */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded-md w-20 mx-auto"></div>
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
                      : "Tidak ada data barang"}
                  </td>
                </tr>
              ) : (
                currentItems.map((data, idx) => (
                  <tr
                    key={data.id || idx}
                    className="bg-background text-sm font-medium text-text text-center border-y border-secondary"
                  >
                    <td className="px-4 sm:px-6 py-4 uppercase whitespace-nowrap">
                      {data.namaBarang}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {data.kategori.nama_kategori}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {data.totalStock}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                              ${
                                data.status === "active"
                                  ? "bg-green-500 text-green-100 border border-green-800"
                                  : data.status === "un-active"
                                  ? "bg-red-700 text-red-100 border border-red-800"
                                  : "bg-gray-800/50 text-gray-300 border border-gray-700"
                              }`}
                      >
                        {data.status === "active"
                          ? "Aktif"
                          : data.status === "un-active"
                          ? "Non-aktif"
                          : data.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-2.5 justify-center">
                        <button
                          onClick={() => handleStockIn(data)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Stock In"
                        >
                          <FileInput className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStockOut(data)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Stock Out"
                        >
                          <FileOutput className="w-5 h-5" />
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
              {filteredData.length} barang
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
    </>
  );
}
