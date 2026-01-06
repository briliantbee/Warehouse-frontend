"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightLeft,
  Send,
  X,
  Calendar,
  FileText,
  Building2,
  User,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useUser } from "../../context/UserContext";

const disposalFormSchema = z.object({
  jenis_tindakan: z.enum([
    "jual",
    "hibah",
    "pindah_tangan",
    "tukar_menukar",
    "penyertaan_modal",
    "pemusnahan",
    "penghapusan",
  ]),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  alasan: z.string().min(1, "Alasan wajib diisi"),
  kondisi_aset: z.enum(["baik", "rusak_ringan", "rusak_berat"]),
  nilai_transaksi: z.string().optional(),
  pihak_penerima: z.string().optional(),
  alamat_penerima: z.string().optional(),
  kontak_penerima: z.string().optional(),
  entitas_tujuan_id: z.string().optional(),
  satker_tujuan_id: z.string().optional(),
  unit_eselon_ii_tujuan_id: z.string().optional(),
  penanggung_jawab_aset_tujuan_id: z.string().optional(),
  created_by: z.number().min(1, "Created by wajib diisi"),
  // Fields for penghapusan disposal type
  dasar_persetujuan: z.string().optional(),
  tanggal_pemindahan: z.string().optional(),
  // Upload bukti foto 4 sisi untuk penghapusan (array max 4 files)
  upload_bukti: z.any().optional(),
});

type DisposalFormSchema = z.infer<typeof disposalFormSchema>;

interface DropdownOption {
  value: string;
  label: string;
}

interface DisposalAsset {
  id: number;
  kode_barang: string;
  nama_aset: string;
}

export default function DisposalAssetModal({
  isOpen,
  onClose,
  onSubmit,
  asset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: DisposalFormSchema | FormData) => void;
  asset: DisposalAsset | null;
}) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DisposalFormSchema>({
    resolver: zodResolver(disposalFormSchema),
    defaultValues: {
      jenis_tindakan: "pindah_tangan",
      tanggal: new Date().toISOString().split("T")[0],
      alasan: "",
      kondisi_aset: "baik",
      nilai_transaksi: "",
      pihak_penerima: "",
      alamat_penerima: "",
      kontak_penerima: "",
      entitas_tujuan_id: "",
      satker_tujuan_id: "",
      unit_eselon_ii_tujuan_id: "",
      penanggung_jawab_aset_tujuan_id: "",
      created_by: user?.id || 0,
      dasar_persetujuan: "",
      tanggal_pemindahan: "",
      upload_bukti: null,
    },
  });

  // Dropdown States
  const [entitasList, setEntitasList] = useState<DropdownOption[]>([]);
  const [satkerList, setSatkerList] = useState<DropdownOption[]>([]);
  const [unitEselonList, setUnitEselonList] = useState<DropdownOption[]>([]);
  const [penanggungJawabList, setPenanggungJawabList] = useState<
    DropdownOption[]
  >([]);

  // State for 4 foto files (upload_bukti array)
  const [fotoSamping, setFotoSamping] = useState<File | null>(null);
  const [fotoAtas, setFotoAtas] = useState<File | null>(null);
  const [fotoDepan, setFotoDepan] = useState<File | null>(null);
  const [fotoBelakang, setFotoBelakang] = useState<File | null>(null);

  // Fetch all dropdowns
  useEffect(() => {
    if (!isOpen) return;

    const fetchDropdowns = async () => {
      try {
        const [entitas, satker, unitEselon, penanggungJawab] =
          await Promise.all([
            axiosInstance.get("/api/v1/dropdown/entitas"),
            axiosInstance.get("/api/v1/dropdown/satker"),
            axiosInstance.get("/api/v1/dropdown/unit-eselon-ii"),
            axiosInstance.get("/api/v1/dropdown/penanggung-jawab-aset"),
          ]);

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

  const jenisTindakan = form.watch("jenis_tindakan");
  const showTujuan = ["hibah", "tukar_menukar"].includes(jenisTindakan);
  const showNilaiTransaksi = ["jual", "tukar_menukar"].includes(jenisTindakan);
  const showPenghapusanFields = jenisTindakan === "penghapusan";
  const showPenerimaInfo = ![
    "pemusnahan",
    "penghapusan",
    "pindah_tangan",
  ].includes(jenisTindakan);

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
          className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl relative overflow-y-auto max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="inline-block bg-blue-600 p-3 rounded-lg text-white mr-2">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <h1 className="font-semibold text-2xl text-gray-900">
              Disposal Aset
            </h1>
          </div>

          {asset && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Informasi Aset</h3>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Kode:</span> {asset.kode_barang}
                </p>
                <p>
                  <span className="font-medium">Nama:</span> {asset.nama_aset}
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={form.handleSubmit((values) => {
              if (asset) {
                // Collect all foto files into array for upload_bukti
                const fotoFiles = [
                  fotoSamping,
                  fotoAtas,
                  fotoDepan,
                  fotoBelakang,
                ].filter((f): f is File => f !== null);
                const hasUploadBukti = fotoFiles.length > 0;

                // Create FormData if there's any file upload
                if (hasUploadBukti) {
                  const formData = new FormData();

                  // Append all form fields
                  Object.entries(values).forEach(([key, value]) => {
                    if (
                      key !== "upload_bukti" &&
                      value !== null &&
                      value !== undefined &&
                      value !== ""
                    ) {
                      formData.append(key, String(value));
                    }
                  });

                  // Append foto files as upload_bukti array
                  fotoFiles.forEach((file, index) => {
                    formData.append(`upload_bukti[${index}]`, file);
                  });

                  onSubmit(asset.id, formData);
                } else {
                  // Remove upload_bukti if no file selected
                  const { upload_bukti, ...dataWithoutFiles } = values;
                  onSubmit(asset.id, dataWithoutFiles);
                }
              }
            })}
            className="space-y-6"
          >
            {/* Hidden input for created_by */}
            <input type="hidden" {...form.register("created_by")} />

            {/* Informasi Pengajuan */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informasi Pengajuan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Tindakan <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...form.register("jenis_tindakan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pindah_tangan">Pindah Tangan</option>
                    <option value="jual">Jual</option>
                    <option value="hibah">Hibah</option>
                    <option value="tukar_menukar">Tukar Menukar</option>
                    <option value="penyertaan_modal">Penyertaan Modal</option>
                    <option value="pemusnahan">Pemusnahan</option>
                    <option value="penghapusan">Penghapusan</option>
                  </select>
                  {form.formState.errors.jenis_tindakan && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.jenis_tindakan.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pengajuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...form.register("tanggal")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.tanggal && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.tanggal.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kondisi Aset <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...form.register("kondisi_aset")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="baik">Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                  </select>
                  {form.formState.errors.kondisi_aset && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.kondisi_aset.message}
                    </p>
                  )}
                </div>

                {showNilaiTransaksi && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nilai Transaksi
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      {...form.register("nilai_transaksi")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan alasan disposal aset ini"
                    {...form.register("alasan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.alasan && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.alasan.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Khusus Penghapusan */}
            {showPenghapusanFields && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Form Disposal Penghapusan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dasar Persetujuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Dasar persetujuan penghapusan"
                      {...form.register("dasar_persetujuan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Pemindahan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...form.register("tanggal_pemindahan")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Upload Bukti - Foto 4 Sisi */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Bukti - Foto 4 Sisi (Opsional)
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Format: JPG, PNG, GIF, BMP (Maksimal 2MB per foto,
                      maksimal 4 foto)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Foto Samping (Kanan/Kiri)
                        </label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.bmp"
                          onChange={(e) =>
                            setFotoSamping(e.target.files?.[0] || null)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Foto Atas
                        </label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.bmp"
                          onChange={(e) =>
                            setFotoAtas(e.target.files?.[0] || null)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Foto Depan
                        </label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.bmp"
                          onChange={(e) =>
                            setFotoDepan(e.target.files?.[0] || null)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Foto Belakang
                        </label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.bmp"
                          onChange={(e) =>
                            setFotoBelakang(e.target.files?.[0] || null)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Informasi Penerima - tampil untuk jual, hibah, tukar_menukar, penyertaan_modal */}
            {showPenerimaInfo && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Penerima
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pihak Penerima
                    </label>
                    <input
                      type="text"
                      placeholder="Nama pihak penerima"
                      {...form.register("pihak_penerima")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kontak Penerima
                    </label>
                    <input
                      type="text"
                      placeholder="Email atau telepon"
                      {...form.register("kontak_penerima")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Penerima
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Alamat lengkap penerima"
                      {...form.register("alamat_penerima")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Organisasi Tujuan - tampil untuk hibah, tukar_menukar */}
            {showTujuan && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Organisasi Tujuan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entitas Tujuan
                    </label>
                    <select
                      {...form.register("entitas_tujuan_id")}
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
                      Satker Tujuan
                    </label>
                    <select
                      {...form.register("satker_tujuan_id")}
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
                      Unit Eselon II Tujuan
                    </label>
                    <select
                      {...form.register("unit_eselon_ii_tujuan_id")}
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
                      Penanggung Jawab Tujuan
                    </label>
                    <select
                      {...form.register("penanggung_jawab_aset_tujuan_id")}
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
            )}

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Peringatan
                  </h4>
                  <p className="text-sm text-red-700">
                    Tindakan disposal ini akan mengubah status aset dan tidak
                    dapat dibatalkan. Pastikan semua informasi sudah benar
                    sebelum melanjutkan.
                  </p>
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
                {form.formState.isSubmitting
                  ? "Memproses..."
                  : "Submit Disposal"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
