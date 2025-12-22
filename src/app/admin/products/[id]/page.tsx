"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  Wrench,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Tag,
  Hash,
  Building2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast, Toaster } from "react-hot-toast";
import EditAssetModal from "@/components/core/EditAssetModal";
import DeleteConfirmationModal from "@/components/core/Delete.Modal";
import AddMaintenanceModal from "../../../../components/core/AddMaintenanceModal";
import { deleteAset, updateAset } from "../../../../lib/api/aset/route";

interface Aset {
  id: number;
  kode_barang: string;
  nup?: string;
  nama_aset: string;
  kategori_aset: {
    id: number;
    nama_kategori: string;
  };
  subkategori_aset?: {
    id: number;
    nama_subkategori: string;
  };
  detail_kategori_aset?: {
    id: number;
    nama_detail_kategori: string;
  };
  spesifikasi?: string;
  jumlah: number;
  satuan: string;
  tanggal_perolehan?: string;
  nilai_perolehan: string;
  mata_uang: string;
  sumber_perolehan: string;
  keterangan_sumber_perolehan?: string;
  entitas?: {
    id: number;
    nama_entitas: string;
  };
  satker?: {
    id: number;
    nama_satker: string;
  };
  unit_eselon_ii?: {
    id: number;
    nama_unit: string;
  };
  penanggung_jawab_aset?: {
    id: number;
    nama: string;
  };
  unit_pemakai?: string;
  kondisi_fisik: string;
  status: string;
  tanggal_mulai_digunakan?: string;
  umur_manfaat_bulan?: number;
  metode_penyusutan?: string;
  nilai_residu?: string;
  lokasi_fisik?: string;
  ruangan?: string;
  kode_qr?: string;
  tag_rfid?: string;
  created_at: string;
  updated_at: string;
  created_by: number;
}

interface MaintenanceRecord {
  id: number;
  tanggal_pemeliharaan: string;
  jenis_pemeliharaan: string;
  deskripsi_pemeliharaan: string;
  kondisi_sebelum: string;
  kondisi_sesudah: string;
  biaya: number;
  mata_uang: string;
  vendor: string;
  status: string;
  tanggal_selesai?: string;
  created_at: string;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Aset | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [maintenanceTotal, setMaintenanceTotal] = useState(0);
  const [maintenanceTotalCost, setMaintenanceTotalCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const fetchAssetDetail = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/api/v1/aset/${assetId}`);
      setAsset(response.data);
    } catch (error) {
      console.error("Error fetching asset detail:", error);
      toast.error("Gagal memuat detail aset");
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaintenanceRecords = async () => {
    try {
      // Endpoint yang benar: GET /api/v1/aset/{id}/maintenance
      const response = await axiosInstance.get(
        `/api/v1/aset/${assetId}/maintenance`
      );

      // Response structure: { aset: {...}, maintenance: [...], total: 3, total_biaya: 210200 }
      setMaintenanceRecords(response.data.maintenance || []);
      setMaintenanceTotal(response.data.total || 0);
      setMaintenanceTotalCost(response.data.total_biaya || 0);

      console.log(
        "Maintenance records loaded:",
        response.data.maintenance?.length || 0
      );
    } catch (error: any) {
      console.error("Error fetching maintenance records:", error);

      // Jika endpoint belum ada atau error 404, set empty array
      if (error.response?.status === 404) {
        setMaintenanceRecords([]);
      }
    }
  };

  useEffect(() => {
    if (assetId) {
      fetchAssetDetail();
      fetchMaintenanceRecords();
    }
  }, [assetId]);

  const handleUpdateAset = async (id: number, data: any) => {
    try {
      await updateAset(id, data);
      toast.success("Aset berhasil diperbarui");
      setIsEditModalOpen(false);
      fetchAssetDetail();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Gagal memperbarui aset";
      toast.error(errorMsg);
    }
  };

  const handleDeleteAset = async () => {
    try {
      await deleteAset(parseInt(assetId));
      toast.success("Aset berhasil dihapus");
      setIsDeleteModalOpen(false);
      router.push("/admin/products");
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Gagal menghapus aset");
    }
  };

  const handleAddMaintenance = async (data: any) => {
    try {
      await axiosInstance.post(`/api/v1/aset/${assetId}/pemeliharaan`, data);
      toast.success("Record maintenance berhasil ditambahkan");
      setIsMaintenanceModalOpen(false);
      fetchMaintenanceRecords();
      fetchAssetDetail(); // Refresh asset detail in case status changed
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Gagal menambahkan maintenance";
      toast.error(errorMsg);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numValue);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aktif: "bg-green-100 text-green-800",
      dalam_pemeliharaan: "bg-yellow-100 text-yellow-800",
      rusak: "bg-red-100 text-red-800",
      dipindahtangankan: "bg-blue-100 text-blue-800",
      dihapus: "bg-gray-100 text-gray-800",
    };

    const statusText = {
      aktif: "Aktif",
      dalam_pemeliharaan: "Dalam Pemeliharaan",
      rusak: "Rusak",
      dipindahtangankan: "Dipindahtangankan",
      dihapus: "Dihapus",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusConfig[status as keyof typeof statusConfig] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const getKondisiBadge = (kondisi: string) => {
    const kondisiConfig = {
      baik: "bg-green-100 text-green-800",
      rusak_ringan: "bg-yellow-100 text-yellow-800",
      rusak_berat: "bg-red-100 text-red-800",
    };

    const kondisiText = {
      baik: "Baik",
      rusak_ringan: "Rusak Ringan",
      rusak_berat: "Rusak Berat",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          kondisiConfig[kondisi as keyof typeof kondisiConfig] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {kondisiText[kondisi as keyof typeof kondisiText] || kondisi}
      </span>
    );
  };

  const getMaintenanceStatusBadge = (status: string) => {
    const statusConfig = {
      dijadwalkan: "bg-blue-100 text-blue-800",
      sedang_dikerjakan: "bg-yellow-100 text-yellow-800",
      selesai: "bg-green-100 text-green-800",
      dibatalkan: "bg-gray-100 text-gray-800",
    };

    const statusText = {
      dijadwalkan: "Dijadwalkan",
      sedang_dikerjakan: "Sedang Dikerjakan",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusConfig[status as keyof typeof statusConfig] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="mt-20 p-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="mt-20 p-4 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aset Tidak Ditemukan
          </h3>
          <p className="text-gray-500">
            Aset yang Anda cari tidak dapat ditemukan.
          </p>
          <button
            onClick={() => router.push("/admin/products")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Kembali ke Daftar Aset
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="mt-20 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {asset.nama_aset}
              </h1>
              <p className="text-gray-600 mt-1">
                {asset.kode_barang} {asset.nup && `• ${asset.nup}`}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Tambah Maintenance
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Aset
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Informasi Dasar
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">{getStatusBadge(asset.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Kondisi
                  </label>
                  <div className="mt-1">
                    {getKondisiBadge(asset.kondisi_fisik)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Jumlah
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asset.jumlah} {asset.satuan}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Kategori
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asset.kategori_aset?.nama_kategori}
                  </p>
                </div>
                {asset.subkategori_aset && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Subkategori
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.subkategori_aset.nama_subkategori}
                    </p>
                  </div>
                )}
                {asset.detail_kategori_aset && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Detail Kategori
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.detail_kategori_aset.nama_detail_kategori}
                    </p>
                  </div>
                )}
              </div>
              {asset.spesifikasi && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500">
                    Spesifikasi
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asset.spesifikasi}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Informasi Keuangan
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Nilai Perolehan
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatCurrency(asset.nilai_perolehan)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Tanggal Perolehan
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(asset.tanggal_perolehan)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Sumber Perolehan
                  </label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {asset.sumber_perolehan.replace("_", " ")}
                  </p>
                </div>
                {asset.keterangan_sumber_perolehan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Keterangan Sumber
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.keterangan_sumber_perolehan}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Organization */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Lokasi & Organisasi
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {asset.lokasi_fisik && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Lokasi Fisik
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.lokasi_fisik}
                    </p>
                  </div>
                )}
                {asset.ruangan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Ruangan
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.ruangan}
                    </p>
                  </div>
                )}
                {asset.entitas && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Entitas
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.entitas.nama_entitas}
                    </p>
                  </div>
                )}
                {asset.satker && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Satker
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.satker.nama_satker}
                    </p>
                  </div>
                )}
                {asset.unit_eselon_ii && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Unit Eselon II
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.unit_eselon_ii.nama_unit}
                    </p>
                  </div>
                )}
                {asset.penanggung_jawab_aset && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Penanggung Jawab
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.penanggung_jawab_aset.nama}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Informasi Penggunaan
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Tanggal Mulai Digunakan
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(asset.tanggal_mulai_digunakan)}
                  </p>
                </div>
                {asset.unit_pemakai && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Unit Pemakai
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.unit_pemakai}
                    </p>
                  </div>
                )}
                {asset.umur_manfaat_bulan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Umur Manfaat
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.umur_manfaat_bulan} bulan
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Identification */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Identifikasi
                </h3>
              </div>
              <div className="space-y-3">
                {asset.kode_qr && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Kode QR
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.kode_qr}
                    </p>
                  </div>
                )}
                {asset.tag_rfid && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Tag RFID
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {asset.tag_rfid}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Dibuat
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(asset.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Records */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Riwayat Maintenance
                </h3>
              </div>
              <button
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Record
              </button>
            </div>

            <div className="p-6">
              {maintenanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Belum Ada Maintenance
                  </h4>
                  <p className="text-gray-500">
                    Belum ada record maintenance untuk aset ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 capitalize">
                          {record.jenis_pemeliharaan}
                        </h5>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.status === "selesai"
                              ? "bg-green-100 text-green-800"
                              : record.status === "dalam_proses"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {record.deskripsi_pemeliharaan}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Tanggal:</span>
                          <p className="font-medium">
                            {formatDate(record.tanggal_pemeliharaan)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Biaya:</span>
                          <p className="font-medium">
                            {formatCurrency(record.biaya)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Vendor:</span>
                          <p className="font-medium">{record.vendor}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Kondisi:</span>
                          <p className="font-medium">
                            {record.kondisi_sebelum} → {record.kondisi_sesudah}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditAssetModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateAset}
          asetId={asset.id}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAset}
          itemName={asset.nama_aset}
        />
      )}

      {isMaintenanceModalOpen && (
        <AddMaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          onSubmit={handleAddMaintenance}
          assetName={asset.nama_aset}
          currentCondition={asset.kondisi_fisik}
        />
      )}
    </>
  );
}
