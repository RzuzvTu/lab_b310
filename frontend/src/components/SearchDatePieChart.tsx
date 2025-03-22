// SearchDatePieChart.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../styles/DateQuery.css";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TimeslotData {
  timeslot_id: number;
  count: number;
}

interface SearchDatePieChartProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

function SearchDatePieChart({ selectedDate, setSelectedDate }: SearchDatePieChartProps) {
  const [chartData, setChartData] = useState<number[]>(Array(18).fill(0));
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSearch = () => {
    if (!selectedDate) return;
    setLoading(true);
    setModalMessage("");

    axios
      .get(`http://127.0.0.1:5000/date/GetTimeslotCountByDate?date=${selectedDate}`)
      .then((response) => {
        const counts = Array(18).fill(0);
        const data: TimeslotData[] = response.data;
        data.forEach((item) => {
          if (item.timeslot_id >= 1 && item.timeslot_id <= 18) {
            counts[item.timeslot_id - 1] = item.count;
          }
        });
        setChartData(counts);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response && err.response.data.error) {
          setModalMessage(err.response.data.error);
        } else {
          setModalMessage("無法連線到伺服器");
        }
      });
  };

  // Doughnut 圖表資料
  const timeslotLabels = [
    "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
    "11:00 - 11:30", "11:30 - 12:00", "12:00 - 12:30", "12:30 - 13:00",
    "13:00 - 13:30", "13:30 - 14:00", "14:00 - 14:30", "14:30 - 15:00",
    "15:00 - 15:30", "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00",
    "17:00 - 17:30", "17:30 - 18:00",
  ];

  const doughnutData = {
    labels: timeslotLabels,
    datasets: [
      {
        label: "預約次數",
        data: chartData,
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
          "#FF9F40", "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
          "#9966FF", "#FF9F40", "#FF6384", "#36A2EB", "#FFCE56",
          "#4BC0C0", "#9966FF", "#FF9F40",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="date-query-container">
      <h1>日期比例查詢</h1>
      <div className="date-search">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
        <button onClick={handleSearch} className="search-btn">
          查詢
        </button>
      </div>

      {loading && <p className="loading-text">Loading...</p>}
      {modalMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={() => setModalMessage("")}>關閉</button>
          </div>
        </div>
      )}

      {!loading && !modalMessage && (
        <div className="chart-container">
          <div className="doughnut-chart">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: "bottom" } },
                cutout: "50%",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchDatePieChart;