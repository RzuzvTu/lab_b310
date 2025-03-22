import { Link } from "react-router-dom"

function HorizontalNavbar(){
    return (
      <nav className="horizontalnavbar">
        <ul>
          <li><Link to ="/">首頁</Link></li>
          <li><Link to ="/reservation">預約資料</Link></li>
          <li><Link to ="/date-query">日期比例查詢</Link></li>
        </ul>
      </nav>
    )
  }

  export default HorizontalNavbar