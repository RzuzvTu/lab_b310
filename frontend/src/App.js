import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("無法獲取 API 資料：", error);
      });
  }, []);

  return (
    <div>
      <h1>預約列表</h1>
      <ul>
        {users.length > 0 ? (
          users.map((user) => (
            <li key={user.reservation_id}>
              {user.student_name} - {user.row_label}排 {user.seat_number}號 - {user.start_time} ~ {user.end_time}
            </li>
          ))
        ) : (
          <p>正在載入資料...</p>
        )}
      </ul>
    </div>
  );
}

export default App;