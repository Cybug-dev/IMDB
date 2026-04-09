import "./App.css";
import { useState } from "react";
import Header from "./components/Header/Header";
import CollectionPage from "./pages/Collection/CollectionPage";
import HomePage from "./pages/Home/HomePage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const handleNavigate = (page) => setCurrentPage(page);

  return (
    <div className="app-shell">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === "watchlist" && <CollectionPage type="watchlist" />}
      {currentPage === "favorites" && <CollectionPage type="favorites" />}
     {currentPage === "home" && <HomePage />}
    </div>
  );
}

export default App;
