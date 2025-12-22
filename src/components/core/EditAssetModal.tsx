"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  Send,
  X,
  Hash,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Wrench,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useUser } from "../../context/UserContext";

const asetFormSchema = z.object({
  kode_barang: z.string().min(1, "Kode barang wajib diisi"),
  nup: z.string().optional(),
  nama_aset: z.string().min(1, "Nama aset wajib diisi"),
  kategori_aset_id: z.string().min(1, "Kategori wajib dipilih"),
  subkategori_aset_id: z.string().optional(),
  detail_kategori_aset_id: z.string().optional(),
  spesifikasi: z.string().optional(),
  jumlah: z.number().min(1, "Jumlah wajib diisi"),
  satuan: z.string().min(1, "Satuan wajib diisi"),
  tanggal_perolehan: z.string().optional(),
  nilai_perolehan: z.string().min(1, "Nilai perolehan wajib diisi"),
  mata_uang: z.string().min(1, "Mata uang wajib diisi"),
  sumber_perolehan: z.enum([
    "pembelian",
    "hibah",
    "tukar_menukar",
    "penyertaan_modal",
    "hasil_pembangunan",
    "lainnya",
  ]),
  keterangan_sumber_perolehan: z.string().optional(),
  entitas_id: z.string().optional(),
  satker_id: z.string().optional(),
  unit_eselon_ii_id: z.string().optional(),
  penanggung_jawab_aset_id: z.string().optional(),
  unit_pemakai: z.string().optional(),
  kondisi_fisik: z.enum(["baik", "rusak_ringan", "rusak_berat"]),
  status: z.enum([
    "aktif",
    "dalam_pemeliharaan",
    "rusak",
    "dipindahtangankan",
    "dihapus",
  ]),
  tanggal_mulai_digunakan: z.string().optional(),
  umur_manfaat_bulan: z.string().optional(),
  metode_penyusutan: z
    .enum(["garis_lurus", "saldo_menurun", "tidak_disusutkan"])
    .optional(),
  nilai_residu: z.string().optional(),
  lokasi_fisik: z.string().optional(),
  ruangan: z.string().optional(),
  kode_qr: z.string().optional(),
  tag_rfid: z.string().optional(),
  created_by: z.number().min(1, "Created by wajib diisi"),
});

type AsetFormSchema = z.infer<typeof asetFormSchema>;

interface DropdownOption {
  value: string;
  label: string;
}

interface Aset {
  id: number;
  kode_barang: string;
  nup?: string;
  nama_aset: string;
  kategori_aset_id: number;
  subkategori_aset_id?: number;
  detail_kategori_aset_id?: number;
  spesifikasi?: string;
  jumlah: number;
  satuan: string;
  tanggal_perolehan?: string;
  nilai_perolehan: string;
  mata_uang: string;
  sumber_perolehan: string;
  keterangan_sumber_perolehan?: string;
  entitas_id?: number;
  satker_id?: number;
  unit_eselon_ii_id?: number;
  penanggung_jawab_aset_id?: number;
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
  created_by: number;
}

export default function EditAssetModal({
  isOpen,
  onClose,
  onSubmit,
  asetId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: AsetFormSchema) => void;
  asetId: number | null;
}) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AsetFormSchema>({
    resolver: zodResolver(asetFormSchema),
    defaultValues: {
      kode_barang: "",
      nup: "",
      nama_aset: "",
      kategori_aset_id: "",
      subkategori_aset_id: "",
      detail_kategori_aset_id: "",
      spesifikasi: "",
      jumlah: 1,
      satuan: "",
      tanggal_perolehan: "",
      nilai_perolehan: "",
      mata_uang: "IDR",
      sumber_perolehan: "pembelian",
      keterangan_sumber_perolehan: "",
      entitas_id: "",
      satker_id: "",
      unit_eselon_ii_id: "",
      penanggung_jawab_aset_id: "",
      unit_pemakai: "",
      kondisi_fisik: "baik",
      status: "aktif",
      tanggal_mulai_digunakan: "",
      umur_manfaat_bulan: "",
      metode_penyusutan: undefined,
      nilai_residu: "",
      lokasi_fisik: "",
      ruangan: "",
      kode_qr: "",
      tag_rfid: "",
      created_by: user?.id || 0,
    },
  });

  // Dropdown States
  const [kategoriList, setKategoriList] = useState<DropdownOption[]>([]);
  const [subkategoriList, setSubkategoriList] = useState<DropdownOption[]>([]);
  const [detailKategoriList, setDetailKategoriList] = useState<
    DropdownOption[]
  >([]);
  const [entitasList, setEntitasList] = useState<DropdownOption[]>([]);
  const [satkerList, setSatkerList] = useState<DropdownOption[]>([]);
  const [unitEselonList, setUnitEselonList] = useState<DropdownOption[]>([]);
  const [penanggungJawabList, setPenanggungJawabList] = useState<
    DropdownOption[]
  >([]);

  const [filteredSubkategori, setFilteredSubkategori] = useState<
    DropdownOption[]
  >([]);
  const [filteredDetailKategori, setFilteredDetailKategori] = useState<
    DropdownOption[]
  >([]);

  // Fetch asset detail
  useEffect(() => {
    if (!isOpen || !asetId) return;

    const fetchAsetDetail = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/api/v1/aset/${asetId}`);
        const aset: Aset = response.data;

        // Convert date format from YYYY-MM-DD to input format
        const formatDate = (dateStr?: string) => {
          if (!dateStr) return "";
          const date = new Date(dateStr);
          return date.toISOString().split("T")[0];
        };

        // Set form values
        form.reset({
          kode_barang: aset.kode_barang,
          nup: aset.nup || "",
          nama_aset: aset.nama_aset,
          kategori_aset_id: aset.kategori_aset_id?.toString() || "",
          subkategori_aset_id: aset.subkategori_aset_id?.toString() || "",
          detail_kategori_aset_id:
            aset.detail_kategori_aset_id?.toString() || "",
          spesifikasi: aset.spesifikasi || "",
          jumlah: aset.jumlah,
          satuan: aset.satuan,
          tanggal_perolehan: formatDate(aset.tanggal_perolehan),
          nilai_perolehan: aset.nilai_perolehan || "",
          mata_uang: aset.mata_uang || "IDR",
          sumber_perolehan: aset.sumber_perolehan as any,
          keterangan_sumber_perolehan: aset.keterangan_sumber_perolehan || "",
          entitas_id: aset.entitas_id?.toString() || "",
          satker_id: aset.satker_id?.toString() || "",
          unit_eselon_ii_id: aset.unit_eselon_ii_id?.toString() || "",
          penanggung_jawab_aset_id:
            aset.penanggung_jawab_aset_id?.toString() || "",
          unit_pemakai: aset.unit_pemakai || "",
          kondisi_fisik: aset.kondisi_fisik as any,
          status: aset.status as any,
          tanggal_mulai_digunakan: formatDate(aset.tanggal_mulai_digunakan),
          umur_manfaat_bulan: aset.umur_manfaat_bulan?.toString() || "",
          metode_penyusutan: aset.metode_penyusutan as any,
          nilai_residu: aset.nilai_residu || "",
          lokasi_fisik: aset.lokasi_fisik || "",
          ruangan: aset.ruangan || "",
          kode_qr: aset.kode_qr || "",
          tag_rfid: aset.tag_rfid || "",
          created_by: user?.id || 0,
        });
      } catch (error) {
        console.error("Error fetching asset detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsetDetail();
  }, [isOpen, asetId, form]);

  // Fetch all dropdowns
  useEffect(() => {
    if (!isOpen) return;

    const fetchDropdowns = async () => {
      try {
        const [
          kategori,
          subkategori,
          detailKategori,
          entitas,
          satker,
          unitEselon,
          penanggungJawab,
        ] = await Promise.all([
          axiosInstance.get("/api/v1/dropdown/kategori-aset"),
          axiosInstance.get("/api/v1/dropdown/subkategori-aset"),
          axiosInstance.get("/api/v1/dropdown/detail-kategori-aset"),
          axiosInstance.get("/api/v1/dropdown/entitas"),
          axiosInstance.get("/api/v1/dropdown/satker"),
          axiosInstance.get("/api/v1/dropdown/unit-eselon-ii"),
          axiosInstance.get("/api/v1/dropdown/penanggung-jawab-aset"),
        ]);

        setKategoriList(kategori.data.data || []);
        setSubkategoriList(subkategori.data.data || []);
        setDetailKategoriList(detailKategori.data.data || []);
        setEntitasList(entitas.data.data || []);
        setSatkerList(satker.data.data || []);
        setUnitEselonList(unitEselon.data.data || []);
        setPenanggungJawabList(penanggungJawab.data.data || []);
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };

    fetchDropdowns();
  }, [isOpen]);

  // Filter subkategori based on kategori
  useEffect(() => {
    const kategoriId = form.watch("kategori_aset_id");
    if (kategoriId) {
      const filtered = subkategoriList.filter(
        (sub: any) => sub.kategori_aset_id?.toString() === kategoriId
      );
      setFilteredSubkategori(filtered);
    } else {
      setFilteredSubkategori([]);
    }
  }, [form.watch("kategori_aset_id"), subkategoriList]);

  // Filter detail kategori based on subkategori
  useEffect(() => {
    const subkategoriId = form.watch("subkategori_aset_id");
    if (subkategoriId) {
      const filtered = detailKategoriList.filter(
        (detail: any) =>
          detail.subkategori_aset_id?.toString() === subkategoriId
      );
      setFilteredDetailKategori(filtered);
    } else {
      setFilteredDetailKategori([]);
    }
  }, [form.watch("subkategori_aset_id"), detailKategoriList]);

  if (!isOpen) return null;

  // Pastikan user sudah login sebelum form ditampilkan
  if (!user?.id) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-zinc-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative"
          >
            <div className="text-center">
              <Package className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                User Tidak Terdeteksi
              </h3>
              <p className="text-gray-600 mb-4">
                Silakan login terlebih dahulu untuk melanjutkan.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-zinc-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white p-6 rounded-xl shadow-xl w-full max-w-4xl relative overflow-y-auto max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="inline-block bg-blue-600 p-3 rounded-lg text-white mr-2">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="font-semibold text-2xl text-gray-900">Edit Aset</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit((values) => {
                if (asetId) {
                  onSubmit(asetId, values);
                }
              })}
              className="space-y-6"
            >
              {/* Hidden input for created_by */}
              <input type="hidden" {...form.register("created_by")} />

              {/* Informasi Dasar */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Informasi Dasar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Barang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: BRG-001"
                      {...form.register("kode_barang")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.formState.errors.kode_barang && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.kode_barang.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NUP (Nomor Urut Pendaftaran)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 001/2024"
                      {...form.register("nup")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Aset <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Laptop Dell Latitude 5420"
                      {...form.register("nama_aset")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.formState.errors.nama_aset && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.nama_aset.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Kategori */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Kategori
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...form.register("kategori_aset_id")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoriList.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.kategori_aset_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.kategori_aset_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subkategori
                    </label>
                    <select
                      {...form.register("subkategori_aset_id")}
                      disabled={!form.watch("kategori_aset_id")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Pilih Subkategori</option>
                      {filteredSubkategori.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detail Kategori
                    </label>
                    <select
                      {...form.register("detail_kategori_aset_id")}
                      disabled={!form.watch("subkategori_aset_id")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Pilih Detail Kategori</option>
                      {filteredDetailKategori.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Spesifikasi & Kuantitas */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Spesifikasi & Kuantitas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      {...form.register("jumlah", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.formState.errors.jumlah && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.jumlah.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Unit, Buah, Set"
                      {...form.register("satuan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.formState.errors.satuan && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.satuan.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nilai Perolehan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      {...form.register("nilai_perolehan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.formState.errors.nilai_perolehan && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.nilai_perolehan.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Uang <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...form.register("mata_uang")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="IDR">IDR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    {form.formState.errors.mata_uang && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.mata_uang.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Perolehan
                    </label>
                    <input
                      type="date"
                      {...form.register("tanggal_perolehan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sumber Perolehan <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...form.register("sumber_perolehan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pembelian">Pembelian</option>
                      <option value="hibah">Hibah</option>
                      <option value="tukar_menukar">Tukar Menukar</option>
                      <option value="penyertaan_modal">Penyertaan Modal</option>
                      <option value="hasil_pembangunan">
                        Hasil Pembangunan
                      </option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                    {form.formState.errors.sumber_perolehan && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.sumber_perolehan.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spesifikasi
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Intel Core i5-1135G7, RAM 8GB, SSD 256GB"
                      {...form.register("spesifikasi")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Kondisi & Status */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Kondisi & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kondisi Fisik <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...form.register("kondisi_fisik")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="baik">Baik</option>
                      <option value="rusak_ringan">Rusak Ringan</option>
                      <option value="rusak_berat">Rusak Berat</option>
                    </select>
                    {form.formState.errors.kondisi_fisik && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.kondisi_fisik.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...form.register("status")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="dalam_pemeliharaan">
                        Dalam Pemeliharaan
                      </option>
                      <option value="rusak">Rusak</option>
                      <option value="dipindahtangankan">
                        Dipindahtangankan
                      </option>
                      <option value="dihapus">Dihapus</option>
                    </select>
                    {form.formState.errors.status && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.status.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informasi Tambahan */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informasi Tambahan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Pemakai
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: IT Department"
                      {...form.register("unit_pemakai")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Mulai Digunakan
                    </label>
                    <input
                      type="date"
                      {...form.register("tanggal_mulai_digunakan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Umur Manfaat (Bulan)
                    </label>
                    <input
                      type="number"
                      placeholder="12"
                      {...form.register("umur_manfaat_bulan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Metode Penyusutan
                    </label>
                    <select
                      {...form.register("metode_penyusutan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Metode</option>
                      <option value="garis_lurus">Garis Lurus</option>
                      <option value="saldo_menurun">Saldo Menurun</option>
                      <option value="tidak_disusutkan">Tidak Disusutkan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nilai Residu
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      {...form.register("nilai_residu")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan Sumber Perolehan
                    </label>
                    <input
                      type="text"
                      placeholder="Keterangan tambahan"
                      {...form.register("keterangan_sumber_perolehan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lokasi */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Lokasi & Organisasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi Fisik
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Gedung A Lantai 3"
                      {...form.register("lokasi_fisik")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ruangan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ruang 301"
                      {...form.register("ruangan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entitas
                    </label>
                    <select
                      {...form.register("entitas_id")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Entitas</option>
                      {entitasList.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Satker
                    </label>
                    <select
                      {...form.register("satker_id")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Satker</option>
                      {satkerList.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Eselon II
                    </label>
                    <select
                      {...form.register("unit_eselon_ii_id")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Unit Eselon II</option>
                      {unitEselonList.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Penanggung Jawab
                    </label>
                    <select
                      {...form.register("penanggung_jawab_aset_id")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Penanggung Jawab</option>
                      {penanggungJawabList.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode QR
                    </label>
                    <input
                      type="text"
                      placeholder="Kode QR"
                      {...form.register("kode_qr")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag RFID
                    </label>
                    <input
                      type="text"
                      placeholder="Tag RFID"
                      {...form.register("tag_rfid")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center bg-gray-500 rounded-lg py-3 text-white font-semibold hover:bg-gray-600 transition-all"
                >
                  <X className="mr-2 w-4 h-4" />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1 flex items-center justify-center bg-blue-600 rounded-lg py-3 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="mr-2 w-4 h-4" />
                  {form.formState.isSubmitting ? "Menyimpan..." : "Update Aset"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
