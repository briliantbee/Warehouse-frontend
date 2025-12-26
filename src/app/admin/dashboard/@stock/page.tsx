"use client";

import { BoxesIcon, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { AsetStatisticsSummary } from "@/utils/types";
import axiosInstance from "@/lib/axios";

export default function Stock() {
  const [statisticsData, setStatisticsData] =
    useState<AsetStatisticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        "/api/v1/aset/statistics/summary"
      );
      setStatisticsData(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Helper functions to get specific data from the statistics
  const getStatusCount = (status: string) => {
    return (
      statisticsData?.by_status.find((item) => item.status === status)?.total ||
      0
    );
  };

  const getKondisiCount = (kondisi: string) => {
    return (
      statisticsData?.by_kondisi.find((item) => item.kondisi_fisik === kondisi)
        ?.total || 0
    );
  };

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-50 px-5 mb-70 md:mb-0">
          {/* Card 1 */}
          <div className="animate-pulse rounded-lg shadow-md border p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-gray-300 h-6 w-6 rounded-md"></div>
              <div className="bg-gray-300 h-5 w-12 rounded"></div>
            </div>
            <div className="mt-auto">
              <div className="bg-gray-300 h-6 w-20 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-32 rounded"></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="animate-pulse rounded-lg shadow-md border p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-gray-300 h-6 w-6 rounded-md"></div>
              <div className="bg-gray-300 h-5 w-12 rounded"></div>
            </div>
            <div className="mt-auto">
              <div className="bg-gray-300 h-6 w-20 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-32 rounded"></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="animate-pulse rounded-lg shadow-md border p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-gray-300 h-6 w-6 rounded-md"></div>
              <div className="bg-gray-300 h-5 w-12 rounded"></div>
            </div>
            <div className="mt-auto">
              <div className="bg-gray-300 h-6 w-20 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-32 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-50 px-5 mb-70 md:mb-0">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-md border p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-primary text-white p-2 rounded-md">
                <BoxesIcon className="w-10 h-10" />
              </div>
              {/* <span className="bg-primary text-white text-md font-semibold px-2 py-1 rounded">
            12 %
          </span> */}
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-semibold">
                {statisticsData?.total_aset || 0}
              </p>
              <p className="text-sm text-gray-500">Total Aset</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-md border p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-primary text-white p-2 rounded-md">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-semibold">
                {getStatusCount("aktif")}
              </p>
              <p className="text-sm text-gray-500">Aset Aktif</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-md border p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-primary text-white p-2 rounded-md">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-semibold">
                {statisticsData?.perlu_pemeliharaan || 0}
              </p>
              <p className="text-sm text-gray-500">Perlu Pemeliharaan</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
