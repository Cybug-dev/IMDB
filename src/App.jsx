import "./App.css";
import { useState } from "react";
import Header from "./components/Header/Header";
import WatchlistPage from "./pages/Watchlist/WatchlistPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const handleNavigate = (page) => setCurrentPage(page);

  return (
    <div className="app-shell">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === "watchlist" && <WatchlistPage />}
      {currentPage === "home" && <div>Home Page Coming Soon</div>}
    </div>
  );
}

export default App;
