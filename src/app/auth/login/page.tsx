"use client";

import React, { useState } from "react";
// import { login } from "@/services/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axios";
import Logo from "../../../../public/umkm.png";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { login } from "@/services/auth";

type LoginData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      // If backend returns token in JSON, optionally store as fallback (NOT recommended for security)
      const token = (res.data as any).token;
      if (token) {
        Cookies.set("token", token, { expires: 1 }); // fallback, optional
      }
      // refresh global user from server
      await refreshUser();
      router.replace("/admin/dashboard");
    } catch (err) {
      // show notification
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex-col max-w-md shadow-xl flex items-center justify-center rounded-xl border border-slate-800 p-8">
        <div className="flex space-x-2 text-xl font-semibold text-gray-800">
          <Image
            src={Logo}
            height={50}
            width={50}
            alt="logo"
            className="w-10 mr-2"
          />
        </div>

        <h4 className="text-md text-black font-semibold mt-8">Welcome Back</h4>

        <h5 className="mt-2 text-gray-500 text-xs font-semibold">
          Login untuk melihat apa yang terjadi di gudang hari ini
        </h5>

        <form onSubmit={handleSubmit} className="p-6 w-100">
          <div className="w-full">
            <label htmlFor="email" className="font-medium text-md">
              Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3">
                <Mail className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="email"
                placeholder="Masukkan emal anda disini"
                className="border p-3 pl-10 mb-2 w-full rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="w-full">
            <label htmlFor="password" className="font-medium text-md">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="password"
                placeholder="Masukkan password anda disini"
                className="border p-3 pl-10 mb-2 w-full rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary w-full text-white px-4 py-2 mt-4 rounded-lg shadow shodow-7xl"
          >
            <svg
              width="16"
              height="14"
              className="inline-flex mr-3"
              viewBox="0 0 16 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.7812 7.53125C11.075 7.2375 11.075 6.7625 10.7812 6.47188L6.28125 1.96875C6.06563 1.75312 5.74375 1.69063 5.4625 1.80625C5.18125 1.92188 5 2.19688 5 2.5V5H1.5C0.671875 5 0 5.67188 0 6.5V7.5C0 8.32812 0.671875 9 1.5 9H5V11.5C5 11.8031 5.18125 12.0781 5.4625 12.1938C5.74375 12.3094 6.06563 12.2469 6.28125 12.0312L10.7812 7.53125ZM11 12C10.4469 12 10 12.4469 10 13C10 13.5531 10.4469 14 11 14H13C14.6562 14 16 12.6562 16 11V3C16 1.34375 14.6562 0 13 0H11C10.4469 0 10 0.446875 10 1C10 1.55313 10.4469 2 11 2H13C13.5531 2 14 2.44688 14 3V11C14 11.5531 13.5531 12 13 12H11Z"
                fill="#F8FAFC"
              />
            </svg>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
