// DateQuery.tsx
import React, { useState } from "react";
import SearchDatePieChart from "../components/SearchDatePieChart";
import TopThreeBarChart from "../components/TopThreeBarChart";
import "../styles/DateQuery.css";

function DateQuery() {
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="date-query-container">
      <SearchDatePieChart selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      
      <TopThreeBarChart selectedDate={selectedDate} />
    </div>
  );
}

export default DateQuery;