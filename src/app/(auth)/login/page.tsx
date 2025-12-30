"use client";

import React, { useState } from "react";
// import { login } from "@/services/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Lock, X, Warehouse, User, Eye, LogIn, EyeClosed } from "lucide-react";
import { login } from "@/services/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { isAxiosError } from "axios";
import Head from "next/head";
import { useUser } from "@/context/UserContext";
import Logo from "../../../../public/umkm.png";
import Image from "next/image";

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid",
  }),

  password: z.string().min(8, {
    message: "Password harus lebih dari 8 karakter",
  }),
});

type LoginFormSchema = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [show, setShow] = useState(false);
  const router = useRouter();
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
  });

  const handleLogin = async (values: LoginFormSchema) => {
    setLoading(true);
    try {
      const res = await login(values);

      const token = res.data?.token;
      const role = res.data?.user?.role;
      const expiresAt = res.data?.expires_at;

      if (token) {
        // Simpan token
        Cookies.set("token", token, { expires: 1 });

        // Simpan waktu expired (pakai dari server)
        if (expiresAt) {
          Cookies.set("token_expires_at", expiresAt, { expires: 1 });
        }
      }

      if (role) {
        Cookies.set("role", role, { expires: 1 });
      }

      await refreshUser();

      toast.success("Berhasil login");

      if (role === "superadmin") {
        router.replace("/admin/dashboard");
      } else if (role === "admingudang") {
        router.replace("/adminGudang/dashboard");
      } else {
        toast.error("Role tidak dikenali");
      }
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          toast.error("Login tidak sesuai atau tidak match dengan credentials");
          setError(true);
          setErrorMessage(
            "Login tidak sesuai atau tidak match dengan credentials"
          );
        } else if (err.response?.status === 500) {
          toast.error("Server sedang bermasalah, coba lagi nanti");
          setError(true);
          setErrorMessage("Server sedang bermasalah, coba lagi nanti");
        } else {
          toast.error(
            "Galat untuk login: " +
              (err.response?.data?.message || "Terjadi kesalahan")
          );
          setError(true);
          setErrorMessage("Terjadi kesalahan");
        }
      }
    } finally {
      setLoading(false);
      form.reset();
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Toaster position="top-right" />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        {/* <div className="flex-col max-w-md shadow-xl flex items-center justify-center rounded-xl border border-slate-800 p-8">
          <div className="flex space-x-2 text-xl font-semibold text-gray-800">
            <Image
              src={Logo}
              height={50}
              width={50}
              alt="logo"
              className="w-10 mr-2"
            />
            <h3 className="text-2xl mt-1">Warehouse Management</h3>
          </div>

          <h4 className="text-md text-black font-semibold mt-8">
            Welcome Back
          </h4>

          <h5 className="mt-2 text-gray-500 text-xs font-semibold">
            Login untuk melihat apa yang terjadi di gudang hari ini
          </h5>

          <form onSubmit={form.handleSubmit(handleLogin)} className="p-6 w-100">
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
                  {...form.register("email")}
                />
              </div>
              <span style={{ color: "red" }}>
                {form.formState.errors.email?.message}
              </span>
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
                  {...form.register("password")}
                />
              </div>
              <span style={{ color: "red" }}>
                {form.formState.errors.password?.message}
              </span>
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

          {error && (
            <div className="flex items-center gap-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg w-full mt-4 shadow-sm animate-fade-in">
              <span>
                <X className="w-5 h-5" />
              </span>
              <span className="font-medium">
                {errorMessage || "Terjadi kesalahan saat login."}
              </span>
            </div>
          )}
        </div> */}
        <div className="bg-background p-8 border-2 border-secondary rounded-xl shadow-xl">
          <div className="flex items-center justify-center">
            <div className=" mr-2">
              <Image
                src={Logo}
                height={300}
                width={300}
                alt="logo object-contain"
                className=" mr-2"
              />{" "}
            </div>
          </div>

          <div className="inline-block mt-6">
            <h1 className="text-center font-medium text-base text-text">
              Welcome Back
            </h1>
            <p className="text-secondary font-medium text-sm mt-2">
              Login untuk melihat apa yang terjadi di gudang hari ini
            </p>
          </div>

          <form className="mt-5" onSubmit={form.handleSubmit(handleLogin)}>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-text font-medium text-base mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-text/30" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-3 py-3 bg-background border border-secondary text-text text-lg rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 duration-200 transition-all"
                  {...form.register("email")}
                />
              </div>
              <span style={{ color: "red" }}>
                {form.formState.errors.email?.message}
              </span>
            </div>
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-text font-medium text-base mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-text/30" />
                </div>
                <input
                  type={show ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-3 py-3 bg-background border border-secondary text-text text-lg rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 duration-200 transition-all"
                  {...form.register("password")}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShow((prev) => !prev)}
                >
                  {show ? (
                    <Eye className="text-text/30" />
                  ) : (
                    <EyeClosed className="text-text/30" />
                  )}
                </div>
              </div>
              <span style={{ color: "red" }}>
                {form.formState.errors.password?.message}
              </span>
            </div>
            {loading ? (
              <button
                type="submit"
                disabled={true}
                className="w-full flex items-center justify-center bg-primary/80 rounded-lg py-3 text-white font-semibold text-lg cursor-not-allowed hover:bg-primary/90  active:bg-primary transition-all duration-300 ease-in-out"
              >
                <LogIn className="mr-2" />
                Logging In..
              </button>
            ) : (
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-primary rounded-lg py-3 text-white font-semibold text-lg cursor-pointer hover:bg-primary/90 hover:scale-105 active:bg-primary active:scale-95 transition-all duration-300 ease-in-out"
              >
                <LogIn className="mr-2" />
                Log In
              </button>
            )}
          </form>
          {error && (
            <div className="flex items-center gap-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg w-full mt-4 shadow-sm animate-fade-in">
              <span>
                <X className="w-5 h-5" />
              </span>
              <span className="font-medium">
                {errorMessage || "Terjadi kesalahan saat login."}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
