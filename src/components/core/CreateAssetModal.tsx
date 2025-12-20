"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  Send,
  X,
  Hash,
  FileText,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  User,
  Wrench,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

const asetFormSchema = z.object({
  kode_barang: z.string().min(1, "Kode barang wajib diisi"),
  nup: z.string().optional(),
  nama_aset: z.string().min(1, "Nama aset wajib diisi"),
  kategori_aset_id: z.string().min(1, "Kategori wajib dipilih"),
  subkategori_aset_id: z.string().optional(),
  detail_kategori_aset_id: z.string().optional(),
  merk: z.string().optional(),
  tipe: z.string().optional(),
  nomor_seri: z.string().optional(),
  bahan: z.string().optional(),
  ukuran: z.string().optional(),
  spesifikasi_teknis: z.string().optional(),
  tahun_perolehan: z.string().min(1, "Tahun perolehan wajib diisi"),
  tanggal_perolehan: z.string().min(1, "Tanggal perolehan wajib diisi"),
  nilai_perolehan: z.string().min(1, "Nilai perolehan wajib diisi"),
  mata_uang_id: z.string().min(1, "Mata uang wajib dipilih"),
  kondisi_fisik: z.string().min(1, "Kondisi fisik wajib dipilih"),
  status: z.string().min(1, "Status wajib dipilih"),
  lokasi_fisik: z.string().optional(),
  entitas_id: z.string().optional(),
  satker_id: z.string().optional(),
  unit_eselon_ii_id: z.string().optional(),
  penanggung_jawab_aset_id: z.string().optional(),
  metode_penyusutan_id: z.string().optional(),
  masa_manfaat: z.string().optional(),
  nilai_residu: z.string().optional(),
  satuan_id: z.string().optional(),
  jumlah: z.string().optional(),
  keterangan: z.string().optional(),
});

type AsetFormSchema = z.infer<typeof asetFormSchema>;

interface DropdownOption {
  value: string;
  label: string;
}

export default function CreateAssetModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AsetFormSchema) => void;
}) {
  const form = useForm<AsetFormSchema>({
    resolver: zodResolver(asetFormSchema),
    defaultValues: {
      kode_barang: "",
      nup: "",
      nama_aset: "",
      kategori_aset_id: "",
      subkategori_aset_id: "",
      detail_kategori_aset_id: "",
      merk: "",
      tipe: "",
      nomor_seri: "",
      bahan: "",
      ukuran: "",
      spesifikasi_teknis: "",
      tahun_perolehan: new Date().getFullYear().toString(),
      tanggal_perolehan: "",
      nilai_perolehan: "",
      mata_uang_id: "",
      kondisi_fisik: "baik",
      status: "aktif",
      lokasi_fisik: "",
      entitas_id: "",
      satker_id: "",
      unit_eselon_ii_id: "",
      penanggung_jawab_aset_id: "",
      metode_penyusutan_id: "",
      masa_manfaat: "",
      nilai_residu: "",
      satuan_id: "",
      jumlah: "1",
      keterangan: "",
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
  const [mataUangList, setMataUangList] = useState<DropdownOption[]>([]);
  const [kondisiFisikList, setKondisiFisikList] = useState<DropdownOption[]>(
    []
  );
  const [statusList, setStatusList] = useState<DropdownOption[]>([]);
  const [metodePenyusutanList, setMetodePenyusutanList] = useState<
    DropdownOption[]
  >([]);
  const [satuanList, setSatuanList] = useState<DropdownOption[]>([]);

  const [filteredSubkategori, setFilteredSubkategori] = useState<
    DropdownOption[]
  >([]);
  const [filteredDetailKategori, setFilteredDetailKategori] = useState<
    DropdownOption[]
  >([]);

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
          mataUang,
          kondisiFisik,
          statusAset,
          metodePenyusutan,
          satuan,
        ] = await Promise.all([
          axiosInstance.get("/api/v1/dropdown/kategori-aset"),
          axiosInstance.get("/api/v1/dropdown/subkategori-aset"),
          axiosInstance.get("/api/v1/dropdown/detail-kategori-aset"),
          axiosInstance.get("/api/v1/dropdown/entitas"),
          axiosInstance.get("/api/v1/dropdown/satker"),
          axiosInstance.get("/api/v1/dropdown/unit-eselon-ii"),
          axiosInstance.get("/api/v1/dropdown/penanggung-jawab-aset"),
          axiosInstance.get("/api/v1/dropdown/mata-uang"),
          axiosInstance.get("/api/v1/dropdown/kondisi-fisik"),
          axiosInstance.get("/api/v1/dropdown/status-aset"),
          axiosInstance.get("/api/v1/dropdown/metode-penyusutan"),
          axiosInstance.get("/api/v1/dropdown/satuan"),
        ]);

        setKategoriList(kategori.data.data || []);
        setSubkategoriList(subkategori.data.data || []);
        setDetailKategoriList(detailKategori.data.data || []);
        setEntitasList(entitas.data.data || []);
        setSatkerList(satker.data.data || []);
        setUnitEselonList(unitEselon.data.data || []);
        setPenanggungJawabList(penanggungJawab.data.data || []);
        setMataUangList(mataUang.data.data || []);
        setKondisiFisikList(kondisiFisik.data.data || []);
        setStatusList(statusAset.data.data || []);
        setMetodePenyusutanList(metodePenyusutan.data.data || []);
        setSatuanList(satuan.data.data || []);
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
            <h1 className="font-semibold text-2xl text-gray-900">
              Tambah Aset Baru
            </h1>
          </div>

          <form
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values);
              form.reset();
            })}
            className="space-y-6"
          >
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

            {/* Spesifikasi */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Spesifikasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merk
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dell"
                    {...form.register("merk")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Latitude 5420"
                    {...form.register("tipe")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Seri
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SN123456789"
                    {...form.register("nomor_seri")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bahan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Plastik, Metal"
                    {...form.register("bahan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ukuran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 14 inch"
                    {...form.register("ukuran")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan
                  </label>
                  <select
                    {...form.register("satuan_id")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Satuan</option>
                    {satuanList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    {...form.register("jumlah")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spesifikasi Teknis
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Intel Core i5-1135G7, RAM 8GB, SSD 256GB"
                    {...form.register("spesifikasi_teknis")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Perolehan & Nilai */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Perolehan & Nilai
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun Perolehan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="2024"
                    {...form.register("tahun_perolehan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.tahun_perolehan && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.tahun_perolehan.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Perolehan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...form.register("tanggal_perolehan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.tanggal_perolehan && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.tanggal_perolehan.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Perolehan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="10000000"
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
                    {...form.register("mata_uang_id")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Mata Uang</option>
                    {mataUangList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.mata_uang_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.mata_uang_id.message}
                    </p>
                  )}
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
                    {kondisiFisikList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
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
                    {statusList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.status && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Lokasi & Organisasi */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Lokasi & Organisasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokasi Fisik
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gedung A Lantai 3 Ruang 301"
                    {...form.register("lokasi_fisik")}
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
              </div>
            </div>

            {/* Penyusutan */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Penyusutan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metode Penyusutan
                  </label>
                  <select
                    {...form.register("metode_penyusutan_id")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Metode</option>
                    {metodePenyusutanList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Masa Manfaat (Tahun)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    {...form.register("masa_manfaat")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Residu
                  </label>
                  <input
                    type="number"
                    placeholder="1000000"
                    {...form.register("nilai_residu")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Keterangan */}
            <div className="pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Keterangan Tambahan
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  rows={4}
                  placeholder="Tambahkan catatan atau informasi tambahan..."
                  {...form.register("keterangan")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                {form.formState.isSubmitting ? "Menyimpan..." : "Tambah Aset"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
