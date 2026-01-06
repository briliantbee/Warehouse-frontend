"use client";

import React from "react";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";

// export const metadata = {
//   title: "Dashboard",
//   description: "Admin Dashboard",
// };
import dynamic from "next/dynamic";

// Import StockBarChart secara dynamic dengan no SSR
const StockBarChart = dynamic(() => import("./stockBarChart/page"), {
  ssr: false,
  loading: () => (
    <div className="w-full md:w-full lg:w-full xl:w-[755px] bg-white rounded-md border p-4 mt-0 md:mt-0">
      <h2 className="text-xl font-semibold mb-4">Data Barang per Bulan</h2>
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-32 mb-4 mx-auto"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 bg-gray-200 rounded"
                style={{ width: `${Math.random() * 200 + 100}px` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function Layout({
  children,
  stock,
  stockPieChart,
}: {
  children: React.ReactNode;
  stock: React.ReactNode;
  stockPieChart: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-slate-50 md:flex-row">
        {/* Sidebar */}
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Header />
          {/* Main content area */}
          {children}
          {/* Stock components */}
          {stock}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-5 py-8">
            <div className="xl:col-span-2">
              <StockBarChart />
            </div>
            <div className="xl:col-span-1">{stockPieChart}</div>
          </div>
        </div>
      </div>
    </>
  );
}
