"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  Send,
  X,
  Hash,
  DollarSign,
  Tag,
  Wrench,
  MapPin,
  Calendar,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "@/lib/axios";
import { useUser } from "../../context/UserContext";

// ... (SATUAN_OPTIONS dan schema tetap sama)

const SATUAN_OPTIONS = [
  { value: "Unit", label: "Unit" },
  { value: "Buah", label: "Buah" },
  { value: "Pcs", label: "Pcs" },
  { value: "Set", label: "Set" },
  { value: "Paket", label: "Paket" },
];

const asetFormSchema = z.object({
  kode_barang: z.string().min(1, "Kode barang wajib diisi"),
  nup: z.string().max(6, "NUP maksimal 6 karakter").optional(),
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
  tanggal_mulai_digunakan: z.string().optional(),
  umur_manfaat_bulan: z.string().optional(),
  metode_penyusutan: z
    .enum(["garis_lurus", "saldo_menurun", "tidak_disusutkan"])
    .optional(),
  nilai_residu: z.string().optional(),
  lokasi_fisik: z.string().optional(),
  ruangan: z.string().optional(),
  created_by: z.number(),
});

type AsetFormSchema = z.infer<typeof asetFormSchema>;

interface DropdownOption {
  value: string;
  label: string;
}

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    borderColor: "#d1d5db",
    "&:hover": { borderColor: "#3b82f6" },
    boxShadow: "none",
    "&:focus-within": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
    },
  }),
  menu: (base: any) => ({ ...base, zIndex: 9999 }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#eff6ff"
      : "white",
    color: state.isSelected ? "white" : "#1f2937",
  }),
};

// PROPS INTERFACE - INI YANG PENTING!
interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AsetFormSchema) => void;
  defaultKategoriId?: string | null; // Terima dari parent
  defaultSubkategoriId?: string | null; // Terima dari parent
  defaultDetailKategoriId?: string | null; // Terima dari parent
}

export default function CreateAssetModal({
  isOpen,
  onClose,
  onSubmit,
  defaultKategoriId = null,
  defaultSubkategoriId = null,
  defaultDetailKategoriId = null,
}: CreateAssetModalProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Currency formatting functions
  const formatCurrency = (value: string | number): string => {
    if (!value) return "";
    const numericValue =
      typeof value === "string" ? value.replace(/[^\d]/g, "") : String(value);
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseCurrency = (value: string): string => {
    return value.replace(/,/g, "");
  };

  const form = useForm<AsetFormSchema>({
    resolver: zodResolver(asetFormSchema),
    defaultValues: {
      kode_barang: "",
      nup: "",
      nama_aset: "",
      kategori_aset_id: defaultKategoriId || "",
      subkategori_aset_id: defaultSubkategoriId || "",
      detail_kategori_aset_id: defaultDetailKategoriId || "",
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
      tanggal_mulai_digunakan: "",
      umur_manfaat_bulan: "",
      metode_penyusutan: undefined,
      nilai_residu: "",
      lokasi_fisik: "",
      ruangan: "",
      created_by: user?.id || 0,
    },
  });

  // Dropdown States
  const [kategoriList, setKategoriList] = useState<DropdownOption[]>([]);
  const [subkategoriList, setSubkategoriList] = useState<DropdownOption[]>([]);
  const [entitasList, setEntitasList] = useState<DropdownOption[]>([]);
  const [satkerList, setSatkerList] = useState<DropdownOption[]>([]);
  const [unitEselonList, setUnitEselonList] = useState<DropdownOption[]>([]);
  const [penanggungJawabList, setPenanggungJawabList] = useState<
    DropdownOption[]
  >([]);
  const [filteredSubkategori, setFilteredSubkategori] = useState<
    DropdownOption[]
  >([]);
  const [detailKategoriList, setDetailKategoriList] = useState<
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
        ] = await Promise.all([
          axiosInstance.get("/api/v1/dropdown/kategori-aset"),
          axiosInstance.get("/api/v1/dropdown/subkategori-aset"),
          axiosInstance.get("/api/v1/detail-kategori-aset/dropdown"),
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

  // SIMPLE! Set nilai dari props saat modal dibuka dan data sudah ready
  useEffect(() => {
    if (isOpen && subkategoriList.length > 0 && detailKategoriList.length > 0) {
      // Set kategori dari props
      if (defaultKategoriId) {
        form.setValue("kategori_aset_id", defaultKategoriId);

        // Filter subkategori
        const filtered = subkategoriList.filter(
          (sub: any) => sub.kategori_aset_id?.toString() === defaultKategoriId
        );
        setFilteredSubkategori(filtered);

        // Set subkategori dari props
        if (defaultSubkategoriId) {
          form.setValue("subkategori_aset_id", defaultSubkategoriId);

          // Filter detail kategori
          const filteredDetail = detailKategoriList.filter(
            (detail: any) =>
              detail.subkategori_aset_id?.toString() === defaultSubkategoriId
          );
          setFilteredDetailKategori(filteredDetail);

          // Set detail kategori dari props
          if (defaultDetailKategoriId) {
            form.setValue("detail_kategori_aset_id", defaultDetailKategoriId);
          }
        }
      }
    }
  }, [
    isOpen,
    defaultKategoriId,
    defaultSubkategoriId,
    defaultDetailKategoriId,
    subkategoriList,
    detailKategoriList,
    form,
  ]);

  // Filter subkategori saat user mengubah kategori
  useEffect(() => {
    const kategoriId = form.watch("kategori_aset_id");

    if (kategoriId && subkategoriList.length > 0) {
      const filtered = subkategoriList.filter(
        (sub: any) => sub.kategori_aset_id?.toString() === kategoriId
      );
      setFilteredSubkategori(filtered);

      // Clear subkategori jika tidak valid (kecuali dari props)
      const currentSub = form.getValues("subkategori_aset_id");
      if (currentSub && currentSub !== defaultSubkategoriId) {
        const isValid = filtered.some((sub: any) => sub.value === currentSub);
        if (!isValid) {
          form.setValue("subkategori_aset_id", "");
          form.setValue("detail_kategori_aset_id", ""); // Clear detail kategori juga
        }
      }
    } else {
      setFilteredSubkategori([]);
    }
  }, [form.watch("kategori_aset_id"), subkategoriList, defaultSubkategoriId]);

  // Filter detail kategori saat user mengubah subkategori
  useEffect(() => {
    const subkategoriId = form.watch("subkategori_aset_id");

    if (subkategoriId && detailKategoriList.length > 0) {
      const filtered = detailKategoriList.filter(
        (detail: any) =>
          detail.subkategori_aset_id?.toString() === subkategoriId
      );
      setFilteredDetailKategori(filtered);

      // Clear detail kategori jika tidak valid (kecuali dari props)
      const currentDetail = form.getValues("detail_kategori_aset_id");
      if (currentDetail && currentDetail !== defaultDetailKategoriId) {
        const isValid = filtered.some(
          (detail: any) => detail.value === currentDetail
        );
        if (!isValid) {
          form.setValue("detail_kategori_aset_id", "");
        }
      }
    } else {
      setFilteredDetailKategori([]);
    }
  }, [
    form.watch("subkategori_aset_id"),
    detailKategoriList,
    defaultDetailKategoriId,
  ]);

  // Reset form saat modal tutup
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSubmitError(null);
      setIsSubmitting(false);
      setFilteredSubkategori([]);
      setFilteredDetailKategori([]);
    }
  }, [isOpen, form]);

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

          {/* Selected Categories Display */}
          {(defaultKategoriId ||
            defaultSubkategoriId ||
            defaultDetailKategoriId) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Kategori Terpilih
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {defaultKategoriId && (
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Kategori</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {kategoriList.length > 0
                        ? kategoriList.find(
                            (k) =>
                              k.value.toString() ===
                              defaultKategoriId.toString()
                          )?.label || "Tidak ditemukan"
                        : "Loading..."}
                    </p>
                  </div>
                )}
                {defaultSubkategoriId && (
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Subkategori</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {subkategoriList.length > 0
                        ? subkategoriList.find(
                            (s) =>
                              s.value.toString() ===
                              defaultSubkategoriId.toString()
                          )?.label || "Tidak ditemukan"
                        : "Loading..."}
                    </p>
                  </div>
                )}
                {defaultDetailKategoriId && (
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">
                      Detail Kategori
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {detailKategoriList.length > 0
                        ? detailKategoriList.find(
                            (d) =>
                              d.value.toString() ===
                              defaultDetailKategoriId.toString()
                          )?.label || "Tidak ditemukan"
                        : "Loading..."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={form.handleSubmit(async (values) => {
              try {
                setIsSubmitting(true);
                setSubmitError(null);
                await onSubmit(values);
                form.reset();
                onClose();
              } catch (error) {
                setSubmitError(
                  error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menyimpan data"
                );
              } finally {
                setIsSubmitting(false);
              }
            })}
            className="space-y-6"
          >
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{submitError}</p>
              </div>
            )}

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
                    placeholder="Max 6 karakter"
                    maxLength={6}
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
                    disabled={!!defaultKategoriId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
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
                    disabled={
                      !form.watch("kategori_aset_id") || !!defaultSubkategoriId
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
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
                    Detail Kategori (Opsional)
                  </label>
                  <select
                    {...form.register("detail_kategori_aset_id")}
                    disabled={
                      !form.watch("subkategori_aset_id") ||
                      !!defaultDetailKategoriId
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
                  >
                    <option value="">Tidak ada detail kategori</option>
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
                  <select
                    {...form.register("satuan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Satuan</option>
                    {SATUAN_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.satuan && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.satuan.message}
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

            {/* Perolehan & Nilai */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5">Rp</span>
                Perolehan & Nilai
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Nilai Perolehan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="10,000,000"
                    value={formatCurrency(form.watch("nilai_perolehan") || "")}
                    onChange={(e) => {
                      const rawValue = parseCurrency(e.target.value);
                      form.setValue("nilai_perolehan", rawValue);
                    }}
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
                    Mata Uang
                  </label>
                  <input
                    type="text"
                    placeholder="IDR"
                    {...form.register("mata_uang")}
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
                    <option value="hasil_pembangunan">Hasil Pembangunan</option>
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
                    Keterangan Sumber Perolehan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pembelian dari vendor XYZ"
                    {...form.register("keterangan_sumber_perolehan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Kondisi & Penggunaan */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Kondisi & Penggunaan
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
                    placeholder="60"
                    {...form.register("umur_manfaat_bulan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  <Controller
                    name="entitas_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        options={entitasList}
                        value={
                          entitasList.find(
                            (opt) => String(opt.value) === String(field.value)
                          ) || null
                        }
                        onChange={(option) => {
                          field.onChange(String(option?.value || ""));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        isClearable
                        placeholder="Pilih Entitas"
                        styles={customSelectStyles}
                        noOptionsMessage={() => "Tidak ada data"}
                        isDisabled={isSubmitting}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satker
                  </label>
                  <Controller
                    name="satker_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        options={satkerList}
                        value={
                          satkerList.find(
                            (opt) => String(opt.value) === String(field.value)
                          ) || null
                        }
                        onChange={(option) => {
                          field.onChange(String(option?.value || ""));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        isClearable
                        placeholder="Pilih Satker"
                        styles={customSelectStyles}
                        noOptionsMessage={() => "Tidak ada data"}
                        isDisabled={isSubmitting}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Eselon II
                  </label>
                  <Controller
                    name="unit_eselon_ii_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        options={unitEselonList}
                        value={
                          unitEselonList.find(
                            (opt) => String(opt.value) === String(field.value)
                          ) || null
                        }
                        onChange={(option) => {
                          field.onChange(String(option?.value || ""));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        isClearable
                        placeholder="Pilih Unit Eselon II"
                        styles={customSelectStyles}
                        noOptionsMessage={() => "Tidak ada data"}
                        isDisabled={isSubmitting}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penanggung Jawab (PIC)
                  </label>
                  <Controller
                    name="penanggung_jawab_aset_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        options={penanggungJawabList}
                        value={
                          penanggungJawabList.find(
                            (opt) => String(opt.value) === String(field.value)
                          ) || null
                        }
                        onChange={(option) => {
                          field.onChange(String(option?.value || ""));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        isClearable
                        placeholder="Pilih Penanggung Jawab"
                        styles={customSelectStyles}
                        noOptionsMessage={() => "Tidak ada data"}
                        isDisabled={isSubmitting}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Pemakai
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Unit IT"
                    {...form.register("unit_pemakai")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Penyusutan */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Penyusutan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    type="text"
                    placeholder="1,000,000"
                    value={formatCurrency(form.watch("nilai_residu") || "")}
                    onChange={(e) => {
                      const rawValue = parseCurrency(e.target.value);
                      form.setValue("nilai_residu", rawValue);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <input type="hidden" {...form.register("created_by")} />

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
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center bg-blue-600 rounded-lg py-3 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="mr-2 w-4 h-4" />
                {isSubmitting ? "Menyimpan..." : "Tambah Aset"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
