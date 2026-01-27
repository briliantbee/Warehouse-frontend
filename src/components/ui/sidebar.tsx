"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { LogOut, Menu, HomeIcon, Users, Group, Briefcase } from "lucide-react";
import Cookies from "js-cookie";

import { ChartLine } from "lucide-react";
import axiosInstance from "@/lib/axios";
import LogoutConfirmationModal from "../core/LogoutModal";
import Image from "next/image";
import Logo from "../../../public/assets/logo.png";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [logoutModal, setLogoutModal] = useState(false);
  const { setUser } = useUser();

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/api/v1/logout");
      const token = response.data.token;
      setUser(null);
      router.push("/");
      Cookies.remove("token", token);
    } catch (error: unknown) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="flex">
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg border border-gray-300"
          onClick={() => setOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex md:hidden space-x-2 text-xl font-semibold text-gray-800">
          <Image
            src={Logo}
            height={50}
            width={50}
            alt="logo"
            className="w-8 ml-4"
          />
          <h3 className="text-sm mt-1.5">Warehouse Management</h3>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-40 md:z-20 top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 text-gray-800 flex flex-col pt-16 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* <div className="flex md:hidden space-x-2 text-xl font-semibold text-gray-800">
          <Image
            src={Logo}
            height={50}
            width={50}
            alt="logo"
            className="w-8 ml-4"
          />
          <h3 className="text-sm mt-1.5">Warehouse Management</h3>
        </div> */}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-auto">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === "/admin/dashboard"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChartLine className="w-5 h-5" />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                href="/admin/gudang"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === "/admin/gudang"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                Divisi
              </Link>
            </li>

            {/* Kategori  */}
            <li>
              <Link
                href="/admin/categories"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === "/admin/categories"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Group className="w-5 h-5" />
                  Kategori & Barang
                </div>
              </Link>
            </li>

            {/* Barang & Product */}
            {/* <li>
              <Link
                href="/admin/products"
                className={`flex items-coducts"
                    ? "bg-primary text-whitenter gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === "/admin/pre-gray-100"
                }`}"
                    : "text-gray-700 hover:bg
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5" />
                  Barang & Produk
                </div>
              </Link>
            </li> */}

            {/* Dropdown Stock Barang */}
            {/* <li>
              <Link
                href="/admin/stock"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === "/admin/stock"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5" />
                  Stock Barang
                </div>
              </Link>
            </li> */}

            <li>
              <Link
                href="/admin/users"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === "/admin/users"
                    ? "bg-[#2563EB] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5" />
                Manajemen Pegawai
              </Link>
            </li>

            <li>
              <Link
                href="/admin/jabatan"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === "/admin/jabatan"
                    ? "bg-[#2563EB] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Briefcase className="w-5 h-5" />
                Jabatan
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Spacer (desktop) */}
      <div className="hidden md:block w-64 shrink-0" />

      {logoutModal && (
        <LogoutConfirmationModal
          onConfirm={handleLogout}
          onClose={() => setLogoutModal(false)}
          isOpen={logoutModal}
        />
      )}
    </>
  );
}
