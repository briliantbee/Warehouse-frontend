"use client";

import Image from "next/image";

import {
  Warehouse,
  ArrowRight,
  Store,
  Rocket,
  Boxes,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/ui/footer";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import Logo from "../../public/umkm.png";

const datas = [
  {
    id: "1",
    icon: Store,
    title: "Manajemen Data Gudang",
    description:
      "Mengelola informasi setiap gudang, termasuk nama, lokasi, kapasitas, dan detail lainnya.",
  },
  {
    id: "2",
    icon: Boxes,
    title: "Manajemen Data Barang",
    description:
      "Mencatat dan memperbarui detail setiap barang, seperti kode, nama, kategori, dan stok awal.",
  },
  {
    id: "3",
    icon: TrendingUp,
    title: "Manajemen Barang Masuk",
    description:
      "Mencatat setiap transaksi penerimaan barang dari pemasok atau gudang lain, lengkap dengan tanggal, jumlah, dan sumber barang.",
  },
  {
    id: "4",
    icon: TrendingDown,
    title: "Manajemen Barang Keluar",
    description:
      "Mencatat pengeluaran barang ke pelanggan, produksi, atau gudang lain, dengan detail jumlah, tujuan, dan waktu pengiriman.",
  },
];

export default function Home() {
  const token = Cookies.get("token");
  const { user, loading } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header>
        <nav className="bg-background flex justify-between items-center px-4 sm:px-6 py-4 shadow-custom relative z-50">
          <div className="flex items-center">
            <div className="p-2 text-white mr-2">
              <Image
                src={Logo}
                height={200}
                width={200}
                alt="logo"
                className="mr-1.5 object-contain"
              />{" "}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:block">
            <Link
              href="/login"
              className="inline-flex items-center bg-primary px-4 md:px-6 py-2 md:py-2.5 font-medium text-sm md:text-base text-white rounded-sm shadow-md hover:bg-primary/90 transition-colors duration-200 ease-in-out"
            >
              <ArrowRight className="mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 text-text hover:bg-gray-100 rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-background shadow-lg border-t sm:hidden">
              <div className="p-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-primary w-full px-4 py-3 font-medium text-base text-white rounded-sm shadow-md hover:bg-primary/90 transition-colors duration-200 ease-in-out"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ArrowRight className="mr-2 w-5 h-5" />
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Animated Background Elements - Responsive */}
      <span className="inline-block absolute left-1/2 sm:left-3/5 top-12 sm:top-16 -z-10 bg-gradient-to-br bg-slate-600 to-slate-500 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full animate-pulse"></span>

      <span className="inline-block absolute left-4 sm:left-9 top-1/4 sm:top-2/6 -z-10 bg-gradient-to-br bg-slate-600 to-slate-500 w-16 h-16 sm:w-20 sm:h-20 md:w-26 md:h-26 rounded-full animate-pulse"></span>

      <span className="inline-block absolute right-1 sm:right-4 top-1/3 sm:top-1/2 -z-10 bg-gradient-to-br bg-slate-600 to-slate-500 w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-full animate-pulse"></span>

      <span className="inline-block absolute left-1/4 sm:left-2/6 -bottom-16 sm:-bottom-27 -z-10 bg-gradient-to-br bg-slate-600 to-slate-500 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full animate-pulse"></span>

      {/* Hero Section - Responsive */}
      <div className="flex flex-col items-center justify-center my-8 sm:my-12 md:my-16 px-4 animate-fade-in">
        <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-secondary mb-2 sm:mb-4 text-center">
          Warehouse Management
        </h1>
        <h2 className="text-primary font-bold text-3xl sm:text-4xl md:text-5xl text-center">
          Warehouse App
        </h2>
      </div>

      {/* Main Content Section - Fully Responsive */}
      <div className="bg-gradient-to-br from-slate-400 to-slate-500 my-8 sm:my-12 md:my-16 mx-4 sm:mx-8 md:mx-12 lg:mx-18 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-8">
          {/* Image Section - Responsive */}
          <div className="flex justify-center lg:justify-start lg:flex-1">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
              <Image
                src="/3d.png"
                alt="3D"
                width={452}
                height={452}
                className="relative z-10 w-full h-auto"
              />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 -top-3 w-full">
                <svg
                  viewBox="0 0 465 463"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                >
                  <path
                    d="M341.176 42.576C388.6 69.632 431.768 109.456 451.528 159.92C471.288 210.08 467.64 270.272 450.008 326.512C432.376 382.752 400.76 434.736 355.16 453.584C309.56 472.432 250.28 458.144 198.6 447.808C146.616 437.472 102.232 431.392 69.096 408.592C35.96 385.488 14.072 346.272 5.256 305.536C-3.256 265.104 1.912 223.76 8.6 176.336C15.288 129.216 23.496 76.32 54.2 43.792C84.904 11.568 138.104 -0.288011 190.392 0.927989C242.376 1.83999 294.056 15.52 341.176 42.576Z"
                    fill="#2563EB"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Content Section - Responsive */}
          <div className="flex items-center flex-col lg:flex-1 lg:ml-8 xl:ml-12">
            <h1 className="font-bold text-xl sm:text-2xl md:text-3xl text-center text-text mb-4 sm:mb-6">
              Solusi Untuk Manajemen Operasi Gudang Anda
            </h1>

            {/* Features Grid - Fully Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4 sm:py-5 w-full max-w-4xl">
              {datas.map((data, idx) => {
                const Icon = data.icon;
                return (
                  <div
                    className="border-2 border-slate-800 shadow-xl p-3 sm:p-4 md:p-5 shadow-custom-2 relative w-full bg-white rounded-2xl"
                    key={idx}
                  >
                    <span className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 bg-text text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium text-xs">
                      {data.id}
                    </span>
                    <div className="flex flex-col items-center mt-2 sm:mt-1">
                      <div className="bg-background/25 flex justify-center p-1.5 rounded-full text-text">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <h1 className="mt-1.5 sm:mt-2 font-medium color-text text-xs sm:text-sm text-text text-center">
                        {data.title}
                      </h1>
                      <p className="text-center text-xs text-grey mt-1 sm:mt-2 leading-relaxed">
                        {data.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button - Responsive */}
            <div className="w-full max-w-md mt-4 sm:mt-6">
              {loading ? (
                <div className="py-4 sm:py-5 w-full text-center text-white">
                  Loading...
                </div>
              ) : user ? (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center bg-accent rounded-lg py-3 sm:py-4 md:py-5 w-full font-bold text-lg sm:text-xl md:text-2xl text-white shadow-custom-3 hover:bg-accent/80 hover:scale-105 focus:scale-100 active:scale-95 active:bg-accent transition-all duration-300 ease-in-out"
                >
                  <Rocket className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
                  Lanjut Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-primary rounded-lg py-3 sm:py-4 md:py-5 w-full font-bold text-lg sm:text-xl md:text-2xl text-white shadow-custom-3 hover:bg-primary/80 hover:scale-105 focus:scale-100 active:scale-95 active:bg-primary transition-all duration-300 ease-in-out"
                >
                  <Rocket className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
                  Login Sekarang
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
