import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/DateQuery.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface TimeslotUsage {
  timeslot_id: number;
  count: number;
}

interface AvgUsageResponse {
  avg_usage?: string; // 後端回傳的平均值，字串形式
  error?: string;
}

interface TopThreeBarChartProps {
  selectedDate: string; // 從父層傳入的日期
}

function TopThreeBarChart({ selectedDate }: TopThreeBarChartProps) {
  const [barData, setBarData] = useState<TimeslotUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 當 selectedDate 改變時，重新抓取資料
  useEffect(() => {
    if (!selectedDate) return; // 若尚未選日期，就不執行
    fetchData();
  }, [selectedDate]);

  // 同時呼叫「取得平均值」與「取得該日期各時段使用次數」
  const fetchData = () => {
    setLoading(true);
    setError(null);
    setBarData([]);

    // 同時發送兩個請求
    const avgReq = axios.get<AvgUsageResponse>(
      `http://127.0.0.1:5000/date/GetAvgUsageByDate?date=${selectedDate}`
    );
    const usageReq = axios.get<TimeslotUsage[]>(
      `http://127.0.0.1:5000/date/GetTimeslotCountByDate?date=${selectedDate}`
    );

    Promise.all([avgReq, usageReq])
      .then(([resAvg, resUsage]) => {
        // 1) 檢查 avg_usage
        if (resAvg.data.error) {
          // 例如 { "error": "查無資料" }
          setError(resAvg.data.error);
          setLoading(false);
          return;
        }
        if (!resAvg.data.avg_usage) {
          setError("後端未回傳 avg_usage");
          setLoading(false);
          return;
        }
        const avgNum = parseFloat(resAvg.data.avg_usage); // 轉成數字

        // 2) 檢查 usage 陣列
        if (!Array.isArray(resUsage.data)) {
          setError("後端回傳的使用次數不是陣列");
          setLoading(false);
          return;
        }

        // 3) 過濾出「大於平均」的時段
        const usageData = resUsage.data.filter((item) => item.count > avgNum);

        // 4) 按使用次數做降冪排序，取前三高
        usageData.sort((a, b) => b.count - a.count);
        const topThree = usageData.slice(0, 3);

        // 5) 設定到 state
        setBarData(topThree);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("無法獲取數據");
        setLoading(false);
      });
  };

  const timeslotLabels = [
    "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
    "11:00 - 11:30", "11:30 - 12:00", "12:00 - 12:30", "12:30 - 13:00",
    "13:00 - 13:30", "13:30 - 14:00", "14:00 - 14:30", "14:30 - 15:00",
    "15:00 - 15:30", "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00",
    "17:00 - 17:30", "17:30 - 18:00",
  ];

  // 準備 Bar 圖表的資料
  const chartData = {
    labels: timeslotLabels,
    datasets: [
      {
        label: "大於平均的使用次數",
        data: barData.map((item) => item.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bar-chart-container">
      <h2>大於平均的前三高時段</h2>
      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && barData.length > 0 && (
        <div className="bar-chart">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: { legend: { position: "bottom" } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      )}
      {!loading && !error && barData.length === 0 && (
        <p>沒有大於平均的時段</p>
      )}
    </div>
  );
}

export default TopThreeBarChart;