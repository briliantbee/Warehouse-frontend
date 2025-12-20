// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { Warehouse, Send, X, Clock, Home, Calendar, Boxes } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { motion, AnimatePresence } from "framer-motion";
// import { useState, useEffect } from "react";
// import { Category } from "@/utils/types";
// import axiosInstance from "@/lib/axios";
// import { useUser } from "@/context/UserContext";

// const barangFormSchema = z.object({
//   kategori_id: z.preprocess((val) => {
//     if (typeof val === "string") {
//       const num = parseInt(val, 10);
//       return isNaN(num) ? 0 : num;
//     }
//     return typeof val === "number" ? val : 0;
//   }, z.number().min(1, "Kategori harus dipilih")),
//   created_by: z.number(),
//   produk: z.string().min(1, "Nama produk harus diisi"),
//   production_date: z.string().min(1, "Tanggal produksi harus diisi"),
//   stock: z.preprocess((val) => {
//     if (typeof val === "string") {
//       const num = parseInt(val, 10);
//       return isNaN(num) ? 0 : num;
//     }
//     return typeof val === "number" ? val : 0;
//   }, z.number().min(0, "Stock tidak boleh negatif")),
//   kodegrp: z.string().min(1, "Kode grup harus diisi"),
//   status: z.enum(["active", "un-active"]),
//   line_divisi: z.number(),
//   main_produk: z.number(),
// });

// type BarangFormSchema = {
//   kategori_id: number;
//   created_by: number;
//   produk: string;
//   production_date: string;
//   stock: number;
//   kodegrp: string;
//   status: "active" | "un-active";
//   line_divisi: number;
//   main_produk: number;
// };

// export default function CreateBarangModal({
//   isOpen,
//   onClose,
//   onSubmit,
//   categoryId,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: BarangFormSchema) => void;
//   categoryId: string;
// }) {
//   const { user } = useUser();
//   const [categoriesOption, setCategoriesOption] = useState<Category[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(
//     null
//   );

//   const form = useForm<BarangFormSchema>({
//     resolver: zodResolver(barangFormSchema) as any,
//     defaultValues: {
//       kategori_id: 1,
//       created_by: user?.id || 0,
//       produk: "",
//       production_date: "",
//       stock: 0,
//       kodegrp: "",
//       status: "active" as const,
//       line_divisi: user?.divisi.id || 0,
//       main_produk: 1,
//     },
//   });

//   const fetchCategories = async () => {
//     try {
//       const response = await axiosInstance.get("/api/v1/kategori");
//       setCategoriesOption(response.data.data);

//       // Cari kategori yang sesuai dengan categoryId
//       const currentCategory = response.data.data.find(
//         (cat: Category) => cat.id === parseInt(categoryId)
//       );

//       if (currentCategory) {
//         setSelectedCategory(currentCategory);
//       }

//       return response.data;
//     } catch (error) {
//       return [];
//     }
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       if (isOpen && user?.id && categoryId) {
//         setIsDataLoaded(false);

//         await fetchCategories();

//         form.reset({
//           kategori_id: parseInt(categoryId),
//           created_by: user.id,
//           produk: "",
//           production_date: "",
//           stock: 0,
//           kodegrp: "",
//           status: "active" as const,
//           line_divisi: user.divisi.id || 0,
//           main_produk: 1,
//         });

//         setIsDataLoaded(true);
//       }
//     };

//     loadData();
//   }, [isOpen, user, form, categoryId]);

//   const handleSubmit = async (values: BarangFormSchema) => {
//     if (isSubmitting) return;

//     setIsSubmitting(true);

//     try {
//       const submitData: BarangFormSchema = {
//         ...values,
//         kategori_id: Number(values.kategori_id),
//         stock: Number(values.stock),
//         created_by: Number(values.created_by),
//         line_divisi: Number(values.line_divisi),
//         main_produk: Number(values.main_produk),
//       };

//       await onSubmit(submitData);
//       form.reset();
//       onClose();
//     } catch (error) {
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleClose = () => {
//     if (!isSubmitting) {
//       form.reset();
//       setIsDataLoaded(false);
//       setSelectedCategory(null);
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-zinc-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
//       >
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           transition={{ type: "spring", stiffness: 300, damping: 25 }}
//           className="bg-background p-8 border border-secondary rounded-xl shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
//         >
//           <button
//             onClick={handleClose}
//             disabled={isSubmitting}
//             className="absolute top-3 right-3 text-text/50 hover:text-text disabled:opacity-50 transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>

//           <div className="flex items-center justify-center mb-6">
//             <div className="inline-block bg-primary p-3 rounded-lg text-white mr-3">
//               <Warehouse className="w-6 h-6" />
//             </div>
//             <h1 className="font-semibold text-2xl text-text">
//               Tambah Barang - {selectedCategory?.kategori || "Loading..."}
//             </h1>
//           </div>

//           {/* Show loading indicator while data is being loaded */}
//           {!isDataLoaded ? (
//             <div className="flex items-center justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary"></div>
//               <span className="ml-3 text-text">Memuat data...</span>
//             </div>
//           ) : (
//             <form
//               className="space-y-4"
//               onSubmit={form.handleSubmit(handleSubmit)}
//             >
//               {/* Hidden inputs */}
//               <input type="hidden" {...form.register("created_by")} />
//               <input type="hidden" {...form.register("line_divisi")} />
//               <input type="hidden" {...form.register("main_produk")} />
//               <input type="hidden" {...form.register("kategori_id")} />

//               {/* Display selected category info */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                 <p className="text-blue-800 text-sm">
//                   <strong>Kategori yang dipilih:</strong>{" "}
//                   {selectedCategory?.kategori || "Loading..."}
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Input nama barang */}
//                 <div>
//                   <label
//                     htmlFor="produk"
//                     className="block text-text font-medium text-sm mb-2"
//                   >
//                     Nama Barang
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Boxes className="text-text/30 w-4 h-4" />
//                     </div>
//                     <input
//                       type="text"
//                       id="produk"
//                       placeholder="Contoh: Kaos oblong"
//                       {...form.register("produk")}
//                       className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                       disabled={isSubmitting}
//                     />
//                   </div>
//                   {form.formState.errors.produk && (
//                     <span className="text-red-500 text-xs mt-1">
//                       {form.formState.errors.produk.message}
//                     </span>
//                   )}
//                 </div>

//                 {/* Input kodegrp */}
//                 <div>
//                   <label
//                     htmlFor="kodegrp"
//                     className="block text-text font-medium text-sm mb-2"
//                   >
//                     Kode Grup
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Home className="text-text/30 w-4 h-4" />
//                     </div>
//                     <input
//                       type="text"
//                       id="kodegrp"
//                       placeholder="Contoh: A716"
//                       {...form.register("kodegrp")}
//                       className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                       disabled={isSubmitting}
//                     />
//                   </div>
//                   {form.formState.errors.kodegrp && (
//                     <span className="text-red-500 text-xs mt-1">
//                       {form.formState.errors.kodegrp.message}
//                     </span>
//                   )}
//                 </div>

//                 {/* Input stock */}
//                 <div>
//                   <label
//                     htmlFor="stock"
//                     className="block text-text font-medium text-sm mb-2"
//                   >
//                     Stock
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Boxes className="text-text/30 w-4 h-4" />
//                     </div>
//                     <input
//                       type="number"
//                       id="stock"
//                       placeholder="Contoh: 100"
//                       min="0"
//                       {...form.register("stock", {
//                         valueAsNumber: true,
//                       })}
//                       onInput={(e) => {
//                         const target = e.target as HTMLInputElement;
//                         const value = parseInt(target.value);

//                         // Prevent negative input
//                         if (value < 0) {
//                           target.value = "";
//                           form.setValue("stock", 0);
//                         }
//                       }}
//                       className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                       disabled={isSubmitting}
//                     />
//                   </div>
//                   {form.formState.errors.stock && (
//                     <span className="text-red-500 text-xs mt-1">
//                       {form.formState.errors.stock.message}
//                     </span>
//                   )}
//                 </div>

//                 {/* Input tanggal produksi */}
//                 <div>
//                   <label
//                     htmlFor="production_date"
//                     className="block text-text font-medium text-sm mb-2"
//                   >
//                     Tanggal Produksi
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Calendar className="text-text/30 w-4 h-4" />
//                     </div>
//                     <input
//                       type="date"
//                       id="production_date"
//                       {...form.register("production_date")}
//                       className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                       disabled={isSubmitting}
//                     />
//                   </div>
//                   {form.formState.errors.production_date && (
//                     <span className="text-red-500 text-xs mt-1">
//                       {form.formState.errors.production_date.message}
//                     </span>
//                   )}
//                 </div>

//                 {/* Input status */}
//                 <div className="md:col-span-2">
//                   <label
//                     htmlFor="status"
//                     className="block text-text font-medium text-sm mb-2"
//                   >
//                     Status
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Clock className="text-text/30 w-4 h-4" />
//                     </div>
//                     <select
//                       id="status"
//                       {...form.register("status")}
//                       className="w-full pl-10 pr-3 py-2.5 bg-background border border-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                       disabled={isSubmitting}
//                     >
//                       <option value="active">Aktif</option>
//                       <option value="un-active">Non Aktif</option>
//                     </select>
//                   </div>
//                   {form.formState.errors.status && (
//                     <span className="text-red-500 text-xs mt-1">
//                       {form.formState.errors.status.message}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Info Text */}
//               <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//                 <p className="text-green-800 text-sm">
//                   <strong>Info:</strong> Barang akan ditambahkan ke kategori "
//                   {selectedCategory?.kategori}". Pastikan semua informasi sudah
//                   benar sebelum menyimpan data.
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="pt-4 flex gap-3">
//                 <button
//                   type="button"
//                   onClick={handleClose}
//                   disabled={isSubmitting}
//                   className="flex-1 flex items-center justify-center bg-gray-500 rounded-lg py-3 text-white font-semibold text-base hover:bg-gray-600 hover:scale-[1.02] active:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <X className="mr-2 w-4 h-4" />
//                   Batal
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="flex-1 flex items-center justify-center bg-primary rounded-lg py-3 text-white font-semibold text-base hover:bg-primary/90 hover:scale-[1.02] active:bg-primary/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
//                       Menyimpan...
//                     </>
//                   ) : (
//                     <>
//                       <Send className="mr-2 w-4 h-4" />
//                       Tambah Barang
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           )}
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
