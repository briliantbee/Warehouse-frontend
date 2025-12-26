"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { AsetStatisticsSummary } from "@/utils/types";

interface ChartData {
  name: string;
  value: number;
  label: string;
}

export default function StockBarChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statisticsData, setStatisticsData] =
    useState<AsetStatisticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<
    "status" | "kondisi" | "kategori"
  >("status");
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering chart
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchStatisticsData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        "/api/v1/aset/statistics/summary"
      );
      const data: AsetStatisticsSummary = response.data;
      setStatisticsData(data);

      // Process data for chart based on selected chart type
      processChartData(data, selectedChart);
    } catch (error) {
      toast.error("Gagal memuat data chart");
    } finally {
      setIsLoading(false);
    }
  };

  const processChartData = (
    data: AsetStatisticsSummary,
    chartType: "status" | "kondisi" | "kategori"
  ) => {
    let processedData: ChartData[] = [];

    switch (chartType) {
      case "status":
        processedData = data.by_status.map((item) => ({
          name: item.status.replace("_", " ").toUpperCase(),
          value: item.total,
          label: `${item.status}: ${item.total} aset`,
        }));
        break;

      case "kondisi":
        processedData = data.by_kondisi.map((item) => ({
          name: item.kondisi_fisik.replace("_", " ").toUpperCase(),
          value: item.total,
          label: `${item.kondisi_fisik}: ${item.total} aset`,
        }));
        break;

      case "kategori":
        processedData = data.by_kategori.map((item) => ({
          name:
            item.kategori_aset?.nama_kategori ||
            `Kategori ${item.kategori_aset_id}`,
          value: item.total,
          label: `${item.kategori_aset?.nama_kategori || "Kategori"}: ${
            item.total
          } aset`,
        }));
        break;
    }

    setChartData(processedData);
  };

  useEffect(() => {
    fetchStatisticsData();
  }, []);

  useEffect(() => {
    if (statisticsData) {
      processChartData(statisticsData, selectedChart);
    }
  }, [selectedChart, statisticsData]);

  const getChartTitle = () => {
    switch (selectedChart) {
      case "status":
        return "Distribusi Aset berdasarkan Status";
      case "kondisi":
        return "Distribusi Aset berdasarkan Kondisi Fisik";
      case "kategori":
        return "Distribusi Aset berdasarkan Kategori";
      default:
        return "Distribusi Aset";
    }
  };

  // Custom tooltip untuk chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600">{`Jumlah: ${data.value} aset`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col p-5 top-20 md:top-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{getChartTitle()}</h2>

        {/* Dropdown untuk memilih jenis chart */}
        <select
          value={selectedChart}
          onChange={(e) =>
            setSelectedChart(
              e.target.value as "status" | "kondisi" | "kategori"
            )
          }
          className="border border-gray-300 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="status">Berdasarkan Status</option>
          <option value="kondisi">Berdasarkan Kondisi</option>
          <option value="kategori">Berdasarkan Kategori</option>
        </select>
      </div>

      <div className="w-full flex-1" style={{ minWidth: 0 }}>
        {!isMounted ? (
          // Show placeholder while mounting
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
        ) : isLoading ? (
          // Loading skeleton
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
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis
                label={{
                  value: "Jumlah Aset",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill="#1D4ED8"
                radius={[5, 5, 0, 0]}
                name="Jumlah Aset"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // No data message
          <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg font-medium">Tidak ada data aset</p>
            <p className="text-sm">untuk kategori yang dipilih</p>
          </div>
        )}
      </div>

      {/* Summary statistics */}
      {!isLoading && statisticsData && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Aset</p>
              <p className="text-xl font-bold text-blue-600">
                {statisticsData.total_aset}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Nilai Perolehan</p>
              <p className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(statisticsData.total_nilai_perolehan)}
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Perlu Pemeliharaan</p>
              <p className="text-xl font-bold text-orange-600">
                {statisticsData.perlu_pemeliharaan}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Mendekati Kadaluarsa</p>
              <p className="text-xl font-bold text-red-600">
                {statisticsData.near_expiration}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
