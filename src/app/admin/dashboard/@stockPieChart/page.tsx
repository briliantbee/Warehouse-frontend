"use client";
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import axiosInstance from "@/lib/axios";
import { RotateCcw } from "lucide-react";
import { AsetStatisticsSummary } from "@/utils/types";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#9CA3AF",
  "#111827",
];

interface ChartData {
  name: string;
  value: number;
  label: string;
  [key: string]: string | number;
}

// Custom label function dengan proper typing
const renderLabel = (entry: any) => {
  if (entry.percent) {
    return `${(entry.percent * 100).toFixed(0)}%`;
  }
  return "";
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-blue-600">{`Jumlah: ${data.value} aset`}</p>
        <p className="text-gray-600 text-sm">{`${(
          (data.value / data.total) *
          100
        ).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

export default function DonutChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statisticsData, setStatisticsData] =
    useState<AsetStatisticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<
    "status" | "kondisi" | "kategori"
  >("status");

  useEffect(() => {
    fetchStatisticsData();
  }, []);

  useEffect(() => {
    if (statisticsData) {
      processChartData(statisticsData, selectedChart);
    }
  }, [selectedChart, statisticsData]);

  const fetchStatisticsData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        "/api/v1/aset/statistics/summary"
      );
      const data: AsetStatisticsSummary = response.data;
      setStatisticsData(data);

      // Process initial chart data
      processChartData(data, selectedChart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (
    data: AsetStatisticsSummary,
    chartType: "status" | "kondisi" | "kategori"
  ) => {
    let processedData: ChartData[] = [];
    let total = 0;

    switch (chartType) {
      case "status":
        total = data.by_status.reduce((sum, item) => sum + item.total, 0);
        processedData = data.by_status
          .filter((item) => item.total > 0)
          .map((item) => ({
            name: item.status.replace("_", " ").toUpperCase(),
            value: item.total,
            label: `${item.status}: ${item.total} aset`,
            total: total,
          }));
        break;

      case "kondisi":
        total = data.by_kondisi.reduce((sum, item) => sum + item.total, 0);
        processedData = data.by_kondisi
          .filter((item) => item.total > 0)
          .map((item) => ({
            name: item.kondisi_fisik.replace("_", " ").toUpperCase(),
            value: item.total,
            label: `${item.kondisi_fisik}: ${item.total} aset`,
            total: total,
          }));
        break;

      case "kategori":
        total = data.by_kategori.reduce((sum, item) => sum + item.total, 0);
        processedData = data.by_kategori
          .filter((item) => item.total > 0)
          .map((item) => ({
            name:
              item.kategori_aset?.nama_kategori ||
              `Kategori ${item.kategori_aset_id}`,
            value: item.total,
            label: `${item.kategori_aset?.nama_kategori || "Kategori"}: ${
              item.total
            } aset`,
            total: total,
          }));
        break;
    }

    setChartData(processedData);
  };

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

  const handleRefresh = (): void => {
    fetchStatisticsData();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col p-5">
        <h2 className="text-xl font-semibold mb-4">Distribusi Aset</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col p-5">
        <h2 className="text-xl font-semibold mb-4">Distribusi Aset</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-500 mb-2">⚠️ Gagal memuat data</div>
          <p className="text-gray-600 text-sm mb-4">Server sedang bermasalah</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col p-5">
        <h2 className="text-xl font-semibold mb-4">{getChartTitle()}</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-gray-500 mb-2">📊 Tidak ada data tersedia</div>
          <p className="text-gray-600 text-sm mb-4">
            Tidak ada data aset tersedia untuk kategori yang dipilih
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{getChartTitle()}</h2>
        <div className="flex gap-2">
          <select
            value={selectedChart}
            onChange={(e) =>
              setSelectedChart(
                e.target.value as "status" | "kondisi" | "kategori"
              )
            }
            className="border border-gray-300 px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="status">Status</option>
            <option value="kondisi">Kondisi</option>
            <option value="kategori">Kategori</option>
          </select>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            title="Refresh data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary info */}
      {statisticsData && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-gray-600">Total Aset</p>
            <p className="text-xl font-bold text-blue-600">
              {statisticsData.total_aset}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-gray-600">Perlu Pemeliharaan</p>
            <p className="text-xl font-bold text-orange-600">
              {statisticsData.perlu_pemeliharaan}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
