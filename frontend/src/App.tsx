import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import "./styles/App.css"
import HorizontalNavbar from "./components/HorizontalNavbar"
import Home from "./pages/Home"
import Reservation from "./pages/Reservation"
import DateQuery from "./pages/DateQuery"

function App (){

  return (
    <Router>
      <HorizontalNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/date-query" element={<DateQuery />} />
      </Routes>
    </Router>
  )
}

export default App