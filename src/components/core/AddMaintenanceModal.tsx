"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Wrench,
  Send,
  X,
  Calendar,
  FileText,
  DollarSign,
  User,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";

const maintenanceFormSchema = z.object({
  tanggal_pemeliharaan: z.string().min(1, "Tanggal pemeliharaan wajib diisi"),
  jenis_pemeliharaan: z.enum([
    "service",
    "repair",
    "upgrade",
    "calibration",
    "preventive",
    "corrective",
  ]),
  deskripsi_pemeliharaan: z
    .string()
    .min(1, "Deskripsi pemeliharaan wajib diisi"),
  kondisi_sebelum: z.enum(["baik", "rusak_ringan", "rusak_berat"]),
  kondisi_sesudah: z.enum(["baik", "rusak_ringan", "rusak_berat"]),
  biaya: z.number().min(0, "Biaya tidak boleh negatif"),
  mata_uang: z.string().min(1, "Mata uang wajib diisi"),
  vendor: z.string().min(1, "Vendor wajib diisi"),
  status: z.enum(["selesai", "dalam_proses", "pending"]),
  tanggal_selesai: z.string().optional(),
  created_by: z.number().min(1, "Created by wajib diisi"),
});

type MaintenanceFormSchema = z.infer<typeof maintenanceFormSchema>;

export default function AddMaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
  assetName,
  currentCondition,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaintenanceFormSchema) => void;
  assetName: string;
  currentCondition: string;
}) {
  const { user } = useUser();

  const form = useForm<MaintenanceFormSchema>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      tanggal_pemeliharaan: new Date().toISOString().split("T")[0],
      jenis_pemeliharaan: "service",
      deskripsi_pemeliharaan: "",
      kondisi_sebelum: currentCondition as any,
      kondisi_sesudah: "baik",
      biaya: 0,
      mata_uang: "IDR",
      vendor: "",
      status: "selesai",
      tanggal_selesai: new Date().toISOString().split("T")[0],
      created_by: user?.id || 0,
    },
  });

  const selectedStatus = form.watch("status");

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
            <div className="inline-block bg-green-600 p-3 rounded-lg text-white mr-2">
              <Wrench className="w-6 h-6" />
            </div>
            <h1 className="font-semibold text-2xl text-gray-900">
              Tambah Maintenance Record
            </h1>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 mb-1">Aset</h3>
            <p className="text-sm text-gray-600">{assetName}</p>
          </div>

          <form
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values);
              form.reset();
            })}
            className="space-y-6"
          >
            {/* Hidden input for created_by */}
            <input type="hidden" {...form.register("created_by")} />

            {/* Informasi Pemeliharaan */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informasi Pemeliharaan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pemeliharaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...form.register("tanggal_pemeliharaan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {form.formState.errors.tanggal_pemeliharaan && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.tanggal_pemeliharaan.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Pemeliharaan <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...form.register("jenis_pemeliharaan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="service">Service</option>
                    <option value="repair">Repair</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="calibration">Calibration</option>
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                  </select>
                  {form.formState.errors.jenis_pemeliharaan && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.jenis_pemeliharaan.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kondisi Sebelum <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...form.register("kondisi_sebelum")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="baik">Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                  </select>
                  {form.formState.errors.kondisi_sebelum && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.kondisi_sebelum.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kondisi Sesudah <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...form.register("kondisi_sesudah")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="baik">Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                  </select>
                  {form.formState.errors.kondisi_sesudah && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.kondisi_sesudah.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...form.register("status")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="selesai">Selesai</option>
                    <option value="dalam_proses">Dalam Proses</option>
                    <option value="pending">Pending</option>
                  </select>
                  {form.formState.errors.status && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>

                {selectedStatus === "selesai" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      {...form.register("tanggal_selesai")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Pemeliharaan{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan detail pemeliharaan yang dilakukan"
                    {...form.register("deskripsi_pemeliharaan")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {form.formState.errors.deskripsi_pemeliharaan && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.deskripsi_pemeliharaan.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informasi Biaya & Vendor */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Informasi Biaya & Vendor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biaya <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    {...form.register("biaya", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {form.formState.errors.biaya && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.biaya.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Uang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="IDR"
                    {...form.register("mata_uang")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {form.formState.errors.mata_uang && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.mata_uang.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nama vendor/teknisi"
                    {...form.register("vendor")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {form.formState.errors.vendor && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.vendor.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Informasi
                  </h4>
                  <p className="text-sm text-blue-700">
                    Record maintenance ini akan dicatat dalam riwayat
                    pemeliharaan aset. Pastikan semua informasi sudah benar
                    sebelum menyimpan.
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
                className="flex-1 flex items-center justify-center bg-green-600 rounded-lg py-3 text-white font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="mr-2 w-4 h-4" />
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Record"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
