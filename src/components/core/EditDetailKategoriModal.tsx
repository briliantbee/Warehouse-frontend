"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Send, Edit, Tag } from "lucide-react";
import {
  DetailKategoriAset,
  UpdateDetailKategoriData,
} from "../../lib/api/detailkategori";

const editDetailKategoriFormSchema = z.object({
  kode_detail_kategori: z.string().min(1, "Kode detail kategori wajib diisi"),
  nama_detail_kategori: z.string().min(1, "Nama detail kategori wajib diisi"),
  deskripsi: z.string().optional(),
  status: z.enum(["aktif", "tidak_aktif"]),
  subkategori_aset_id: z.number(),
});

type EditDetailKategoriFormSchema = z.infer<
  typeof editDetailKategoriFormSchema
>;

interface EditDetailKategoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateDetailKategoriData) => Promise<void>;
  detailKategori: DetailKategoriAset;
  subkategoriName?: string;
  kategoriName?: string;
}

export default function EditDetailKategoriModal({
  isOpen,
  onClose,
  onSubmit,
  detailKategori,
  subkategoriName,
  kategoriName,
}: EditDetailKategoriModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<EditDetailKategoriFormSchema>({
    resolver: zodResolver(editDetailKategoriFormSchema),
    defaultValues: {
      kode_detail_kategori: "",
      nama_detail_kategori: "",
      deskripsi: "",
      status: "aktif",
      subkategori_aset_id: 0,
    },
  });

  // Reset form dengan data detailKategori
  useEffect(() => {
    if (isOpen && detailKategori) {
      form.reset({
        kode_detail_kategori: detailKategori.kode_detail_kategori,
        nama_detail_kategori: detailKategori.nama_detail_kategori,
        deskripsi: detailKategori.deskripsi || "",
        status: detailKategori.status,
        subkategori_aset_id: detailKategori.subkategori_aset_id,
      });
      setSubmitError(null);
    }
  }, [isOpen, detailKategori, form]);

  const handleSubmit = async (values: EditDetailKategoriFormSchema) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await onSubmit({
        subkategori_aset_id: values.subkategori_aset_id,
        kode_detail_kategori: values.kode_detail_kategori,
        nama_detail_kategori: values.nama_detail_kategori,
        deskripsi: values.deskripsi || "",
        status: values.status,
      });

      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui data"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="inline-block bg-blue-600 p-3 rounded-lg text-white mr-2">
              <Edit className="w-6 h-6" />
            </div>
            <h1 className="font-semibold text-xl text-gray-900">
              Edit Detail Kategori
            </h1>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Kategori:</span> {kategoriName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Subkategori:</span>{" "}
              {subkategoriName}
            </p>
          </div>

          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{submitError}</p>
            </div>
          )}

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Detail Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: DTL-001"
                {...form.register("kode_detail_kategori")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.kode_detail_kategori && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.kode_detail_kategori.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Detail Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan nama detail kategori"
                {...form.register("nama_detail_kategori")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.nama_detail_kategori && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.nama_detail_kategori.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                placeholder="Masukkan deskripsi (opsional)"
                rows={3}
                {...form.register("deskripsi")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
              {form.formState.errors.status && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            <input type="hidden" {...form.register("subkategori_aset_id")} />

            <div className="flex gap-3 pt-4 border-t">
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
                {isSubmitting ? "Memperbarui..." : "Perbarui"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
