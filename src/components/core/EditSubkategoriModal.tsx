"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  UpdateSubkategoriData,
  SubkategoriAset,
} from "@/lib/api/subkategori/route";

interface EditSubkategoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateSubkategoriData) => Promise<void>;
  subkategori: SubkategoriAset;
  categoryName?: string;
}

export default function EditSubkategoriModal({
  isOpen,
  onClose,
  onSubmit,
  subkategori,
  categoryName,
}: EditSubkategoriModalProps) {
  const [formData, setFormData] = useState<UpdateSubkategoriData>({
    kategori_aset_id: subkategori.kategori_aset_id,
    nama_subkategori: subkategori.nama_subkategori,
    deskripsi: subkategori.deskripsi || "",
    status: subkategori.status,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error updating subkategori:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form ke data asli saat close
    setFormData({
      kategori_aset_id: subkategori.kategori_aset_id,
      nama_subkategori: subkategori.nama_subkategori,
      deskripsi: subkategori.deskripsi || "",
      status: subkategori.status,
    });
    onClose();
  };

  useEffect(() => {
    // Update form data when subkategori prop changes
    setFormData({
      kategori_aset_id: subkategori.kategori_aset_id,
      nama_subkategori: subkategori.nama_subkategori,
      deskripsi: subkategori.deskripsi || "",
      status: subkategori.status,
    });
  }, [subkategori]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Subkategori
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Aset
            </label>
            <input
              type="text"
              value={
                categoryName ||
                subkategori.kategori_aset?.nama_kategori ||
                `Kategori ID: ${subkategori.kategori_aset_id}`
              }
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Subkategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_subkategori"
              value={formData.nama_subkategori}
              onChange={handleChange}
              placeholder="Masukkan nama subkategori"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Masukkan deskripsi (opsional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="aktif">Aktif</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
