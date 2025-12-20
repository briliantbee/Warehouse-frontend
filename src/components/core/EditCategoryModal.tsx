"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { Warehouse, X, Send, Hash, Group, FileText, Clock } from "lucide-react";

const categoryFormSchema = z.object({
  kode_kategori: z.string().min(1, "Kode kategori wajib diisi"),
  nama_kategori: z.string().min(1, "Nama kategori wajib diisi"),
  deskripsi: z.string().optional(),
  status: z.string().min(1, "Status wajib diisi"),
});

type CategoryFormSchema = z.infer<typeof categoryFormSchema>;

export default function EditCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormSchema) => void;
  initialData: CategoryFormSchema;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData,
  });

  // Auto-generate kode dari nama kategori
  const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nama = e.target.value;
    setValue("nama_kategori", nama);

    // Auto generate kode: ambil huruf pertama tiap kata
    const kode = nama
      .toUpperCase()
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 3);

    if (kode) {
      setValue("kode_kategori", `${kode}-${Date.now().toString().slice(-4)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-zinc-900/50 backdrop-blur-md flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-background p-8 border border-secondary rounded-xl shadow-xl w-full max-w-lg relative overflow-y-auto max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-text/50 hover:text-text"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="inline-block bg-primary p-3 rounded-lg text-white mr-2">
              <Warehouse className="w-6 h-6" />
            </div>
            <h1 className="font-semibold text-2xl text-text">Edit Kategori</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
            {/* Input Kode Kategori */}
            <div className="mb-5">
              <label
                htmlFor="kode_kategori"
                className="block text-text font-medium text-base mb-2"
              >
                Kode Kategori
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="text-text/30" />
                </div>
                <input
                  type="text"
                  id="kode_kategori"
                  placeholder="Contoh: ELK-2024"
                  {...register("kode_kategori")}
                  className="w-full pl-10 pr-3 py-3 bg-background border border-secondary text-text text-lg rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
              {errors.kode_kategori && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.kode_kategori.message}
                </p>
              )}
            </div>

            {/* Input Nama Kategori */}
            <div className="mb-5">
              <label
                htmlFor="nama_kategori"
                className="block text-text font-medium text-base mb-2"
              >
                Nama Kategori
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Group className="text-text/30" />
                </div>
                <input
                  type="text"
                  id="nama_kategori"
                  placeholder="Contoh: Elektronik"
                  {...register("nama_kategori")}
                  onChange={handleNamaChange}
                  className="w-full pl-10 pr-3 py-3 bg-background border border-secondary text-text text-lg rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
              {errors.nama_kategori && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nama_kategori.message}
                </p>
              )}
            </div>

            {/* Input Deskripsi */}
            <div className="mb-5">
              <label
                htmlFor="deskripsi"
                className="block text-text font-medium text-base mb-2"
              >
                Deskripsi{" "}
                <span className="text-gray-500 text-sm">(Opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                  <FileText className="text-text/30" />
                </div>
                <textarea
                  id="deskripsi"
                  placeholder="Deskripsi kategori..."
                  rows={3}
                  {...register("deskripsi")}
                  className="w-full pl-10 pr-3 py-3 bg-background border border-secondary text-text text-lg rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-none"
                />
              </div>
              {errors.deskripsi && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.deskripsi.message}
                </p>
              )}
            </div>

            {/* Input Status */}
            <div className="mb-5">
              <label
                htmlFor="status"
                className="block text-text font-medium text-base mb-2"
              >
                Status
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="text-text/30" />
                </div>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full pl-10 pr-3 py-3 bg-background border border-secondary text-text text-lg rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="aktif">Aktif</option>
                  <option value="tidak_aktif">Non Aktif</option>
                </select>
              </div>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center bg-gray-500 rounded-lg py-3 text-white font-semibold text-base hover:bg-gray-600 hover:scale-[1.02] active:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="mr-2 w-4 h-4" />
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center bg-primary rounded-lg py-3 text-white font-semibold text-base hover:bg-primary/90 hover:scale-[1.02] active:bg-primary/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="mr-2 w-4 h-4" />
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
