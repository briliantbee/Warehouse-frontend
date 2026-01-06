"use client";

import Image from "next/image";
import Logo from "../../../public/umkm.png";
import Person from "../../../public/assets/person.png";
import { Bell } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import useSWR from "swr";
export default function Header() {
  // const { data: any } = user();

  const { user, loading } = useUser();

  const fetcher = (url: string) =>
    axiosInstance.get(url).then((res) => res.data);
  const { data, isLoading } = useSWR(
    user ? "/api/v1/notifikasi/10" : null, // Key menjadi null jika user logout
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  );

  const totalNotif = data?.data?.length;

  if (loading)
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30">
        {/* Logo */}
        <div className="hidden md:flex space-x-2 text-xl font-semibold text-gray-800">
          <Image
            src={Logo}
            height={50}
            width={50}
            alt="logo"
            className="w-8 mr-1.5"
          />
        </div>

        {/* Profil */}
        <div className="flex animate-pulse items-center gap-3">
          <div className="flex gap-4">
            <Bell className="w-8 h-8 text-gray-600 cursor-pointer hover:text-gray-500 transition-colors duration-200 ease-in-out" />
            <div className="mt-1.5 h-5 w-16 bg-gray-300 rounded-md py-0.5"></div>
          </div>
          <span className="text-sm font-medium bg-gray-300 mt-4 w-5"></span>
        </div>
      </header>
    );
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30">
      {/* Logo */}
      <div className="hidden md:flex space-x-2 text-xl font-semibold text-gray-800">
        <Image
          src={Logo}
          height={200}
          width={200}
          alt="logo"
          className="mr-1.5 object-contain"
        />
      </div>

      {/* Profil */}

      <div className="flex translate-x-10 md:translate-x-0 items-end justify-end md:justify-center md:items-center gap-3">
        <Link href="/admin/notifications">
          <button className="relative">
            <Bell className="w-8 h-8 text-gray-600 cursor-pointer hover:text-gray-500 transition-colors duration-200 ease-in-out" />
            <span className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full px-2 py-0.5 text-xs font-bold shadow-md">
              {totalNotif ?? 0}
            </span>
          </button>
        </Link>
        <Link href="/admin/profile" className="flex space-x-2">
          <Image
            src={Person}
            alt="Avatar"
            height={32}
            width={32}
            className="w-8 h-8 rounded-full object-contain"
          />
          <span className="text-sm font-medium text-gray-700 mt-2">
            {user?.name ?? "Guset"}
          </span>
        </Link>
      </div>
    </header>
  );
}
