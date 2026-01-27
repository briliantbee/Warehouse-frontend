"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Send,
  X,
  Mail,
  Phone,
  Building,
  Briefcase,
  IdCard,
  CheckCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

// Penanggung Jawab form schema
const penanggungJawabFormSchema = z.object({
  nama_pic: z
    .string()
    .min(1, "Nama wajib diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),

  nip: z
    .string()
    .min(1, "NIP wajib diisi")
    .regex(/^[0-9]+$/, "NIP hanya boleh berisi angka"),

  jabatan: z
    .string()
    .min(1, "Jabatan wajib diisi")
    .max(100, "Jabatan maksimal 100 karakter"),

  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(100, "Email maksimal 100 karakter"),

  telepon: z
    .string()
    .min(1, "Telepon wajib diisi")
    .regex(/^[0-9+\-\s()]+$/, "Format telepon tidak valid"),

  unit_eselon_ii_id: z.coerce
    .number()
    .int("Unit Eselon II ID harus berupa bilangan bulat")
    .positive("Unit Eselon II ID harus berupa angka positif"),

  status: z
    .string()
    .min(1, "Status wajib dipilih")
    .refine((val) => ["aktif", "tidak_aktif"].includes(val), {
      message: "Status tidak valid",
    }),

  user_id: z.coerce.number().optional(),
});

type PenanggungJawabFormSchema = z.infer<typeof penanggungJawabFormSchema>;

interface UnitEselonII {
  id: number;
  kode_unit: string;
  nama_unit: string;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PenanggungJawabFormSchema) => void;
}) {
  const [unitEselonOptions, setUnitEselonOptions] = useState<UnitEselonII[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const form = useForm<PenanggungJawabFormSchema>({
    resolver: zodResolver(penanggungJawabFormSchema) as any,
    defaultValues: {
      nama_pic: "",
      nip: "",
      jabatan: "",
      email: "",
      telepon: "",
      unit_eselon_ii_id: 0,
      status: "aktif",
      user_id: undefined,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        setIsDataLoaded(false);

        // Fetch unit eselon data
        await fetchUnitEselon();

        // Reset form
        form.reset({
          nama_pic: "",
          nip: "",
          jabatan: "",
          email: "",
          telepon: "",
          unit_eselon_ii_id: 1,
          status: "aktif",
          user_id: undefined,
        });

        setIsDataLoaded(true);
      }
    };

    loadData();
  }, [isOpen]);

  const fetchUnitEselon = async () => {
    try {
      // Update endpoint sesuai dengan backend Anda
      const response = await axiosInstance.get("/api/v1/unit-eselon-ii");
      setUnitEselonOptions(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching unit eselon:", error);
    }
  };

  const handleSubmit = async (values: PenanggungJawabFormSchema) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
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
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-background p-6 border border-secondary rounded-xl shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text/50 hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="inline-block bg-primary p-3 rounded-lg text-white mr-3">
              <User className="w-6 h-6" />
            </div>
            <h1 className="font-semibold text-2xl text-text">
              Tambah Penanggung Jawab
            </h1>
          </div>

          {/* Show loading indicator while data is being loaded */}
          {!isDataLoaded ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600/30 border-t-blue-600"></div>
              <span className="ml-3 text-text">Memuat data...</span>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Nama PIC */}
                <div>
                  <label
                    htmlFor="nama_pic"
                    className="block text-text font-medium text-sm mb-2"
                  >
                    Nama PIC
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-text/30 w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="nama_pic"
                      placeholder="Masukkan nama PIC"
                      {...form.register("nama_pic")}
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  {form.formState.errors.nama_pic && (
                    <span className="text-red-500 text-xs mt-1">
                      {form.formState.errors.nama_pic.message}
                    </span>
                  )}
                </div>

                {/* Input NIP */}
                <div>
                  <label
                    htmlFor="nip"
                    className="block text-text font-medium text-sm mb-2"
                  >
                    NIP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="text-text/30 w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="nip"
                      placeholder="Masukkan NIP"
                      {...form.register("nip")}
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  {form.formState.errors.nip && (
                    <span className="text-red-500 text-xs mt-1">
                      {form.formState.errors.nip.message}
                    </span>
                  )}
                </div>

                {/* Input Jabatan */}
                <div>
                  <label
                    htmlFor="jabatan"
                    className="block text-text font-medium text-sm mb-2"
                  >
                    Jabatan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="text-text/30 w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="jabatan"
                      placeholder="Masukkan jabatan"
                      {...form.register("jabatan")}
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  {form.formState.errors.jabatan && (
                    <span className="text-red-500 text-xs mt-1">
                      {form.formState.errors.jabatan.message}
                    </span>
                  )}
                </div>

                {/* Input Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-text font-medium text-sm mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="text-text/30 w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      placeholder="penanggung@example.com"
                      {...form.register("email")}
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <span className="text-red-500 text-xs mt-1">
                      {form.formState.errors.email.message}
                    </span>
                  )}
                </div>

                {/* Input Telepon */}
                <div>
                  <label
                    htmlFor="telepon"
                    className="block text-text font-medium text-sm mb-2"
                  >
                    Telepon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="text-text/30 w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="telepon"
                      placeholder="08xxxxxxxxxx"
                      {...form.register("telepon")}
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  {form.formState.errors.telepon && (
                    <span className="text-red-500 text-xs mt-1">
                      {form.formState.errors.telepon.message}
                    </span>
                  )}
                </div>

                {/* Input Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-text font-medium text-sm mb-2"
                  >
                    Status
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckCircle className="text-text/30 w-4 h-4" />
                    </div>
                    <select
                      id="status"
                      {...form.register("status")}
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">Pilih Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="tidak_aktif">Tidak Aktif</option>
                    </select>
                  </div>
                  {form.formState.errors.status && (
                    <span className="text-red-500 text-xs mt-1">
                      {form.formState.errors.status.message}
                    </span>
                  )}
                </div>

                {/* Input Unit Eselon II */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="unit_eselon_ii_id"
                    className="block text-text font-medium text-sm mb-2"
                  >
                    Unit Eselon II
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="text-text/30 w-4 h-4" />
                    </div>
                    <select
                      id="unit_eselon_ii_id"
                      {...form.register("unit_eselon_ii_id")}
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">Pilih Unit Eselon II</option>
                      {unitEselonOptions.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.kode_unit} - {unit.nama_unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.formState.errors.unit_eselon_ii_id && (
                    <span className="text-red-500 text-xs mt-1">
                      {form.formState.errors.unit_eselon_ii_id.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-primary rounded-lg py-3 text-white font-semibold text-base hover:bg-primary/90 hover:scale-[1.02] active:bg-primary active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 w-4 h-4" />
                      Tambah Penanggung Jawab
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
