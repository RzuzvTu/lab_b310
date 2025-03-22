import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Reservation.css";

interface ReservationData {
  reservation_id: number;
  student_id: string;
  student_name: string;
  reservation_date: string;
  create_time: string;
  start_time: string;
  end_time: string;
  row_label: string;
  seat_number: number;
}

function Reservation() {
  const [reservations, setReservationData] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/reservations/GetAllUsers")
      .then((response) => {
        setReservationData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setLoading(false);
  
        if (error.response) {
          // 如果後端回傳 404，表示查無資料
          if (error.response.status === 404) {
            setError("目前沒有任何預約資料");
          } else if (error.response.data) {
            // 如果後端回傳了其他錯誤訊息
            setError(error.response.data.error || "發生錯誤");
          } else {
            setError("發生未知錯誤");
          }
        } else {
          setError("無法連線到伺服器");
        }
      });
  }, []);

  // 依搜尋條件過濾資料
  const filteredReservations = reservations.filter((res) =>
    Object.values(res).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 刪除過期預約，按鈕自動抓取今天日期刪除所有今天之前的資料
  const handleDelete = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (!window.confirm(`確定要刪除所有 ${today} 之前的預約資料嗎？`)) return;

    axios
      .delete(`http://127.0.0.1:5000/date/DeleteDataByDate?date=${today}`)
      .then((response) => {
        setDeleteMessage(response.data.message);
        // 重新載入資料
        axios.get("http://127.0.0.1:5000/user/GetAllUsers")
          .then((response) => {
            setReservationData(response.data);
          })
          .catch((error) => {
            console.error("重新載入資料錯誤:", error);
          });
      })
      .catch((err) => {
        console.error("刪除失敗:", err);
        setDeleteMessage(err.response?.data.error || "刪除失敗，請稍後再試。");
      });
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <input
        type="text"
        className="search-input"
        placeholder="🔍 搜尋學生姓名、學號、座位..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div />

      {/* 紅底白字刪除按鈕 */}
      <button className="delete-btn" onClick={handleDelete}>
        刪除過期預約
      </button>
      
      {/* 顯示刪除回應訊息 */}
      {deleteMessage && <p className="delete-msg">{deleteMessage}</p>}

      <div className="table-container">
        <table className="reservation-table">
          <thead>
            <tr>
              <th>預約 ID</th>
              <th>學號</th>
              <th>姓名</th>
              <th>預約日期</th>
              <th>建立時間</th>
              <th>開始時間</th>
              <th>結束時間</th>
              <th>座位</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res) => (
              <tr key={res.reservation_id}>
                <td>{res.reservation_id}</td>
                <td>{res.student_id}</td>
                <td>{res.student_name}</td>
                <td>{new Date(res.reservation_date).toLocaleDateString()}</td>
                <td>{new Date(res.create_time).toLocaleString()}</td>
                <td>{res.start_time}</td>
                <td>{res.end_time}</td>
                <td>{res.row_label} 排 {res.seat_number} 號</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reservation;