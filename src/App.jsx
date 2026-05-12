import "./App.scss";
import { useState } from "react";
import Header from "./components/Header/Header";
import CollectionPage from "./pages/Collection/CollectionPage";
import GenrePage from "./pages/Genre/GenrePage";
import HomePage from "./pages/Home/HomePage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const handleNavigate = (page, payload = null) => {
    setCurrentPage(page);

    if (page === "genre") {
      setSelectedGenre(payload);
    }
  };
  const handleToggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      return exists ? prev.filter((m) => m.id !== movie.id) : [...prev, movie];
    });
  };
  const handleToggleFavorite = (movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      return exists ? prev.filter((m) => m.id !== movie.id) : [...prev, movie];
    });
  };
  const handleClearCollection = (type) => {
    type === "watchlist" ? setWatchlist([]) : setFavorites([]);
  };

  return (
    <div className="app-shell">
      <Header onNavigate={handleNavigate}
       currentPage={currentPage} 
       watchlistCount={watchlist.length}/>

      {currentPage === "home" && (
        <HomePage
          onToggleWatchlist={handleToggleWatchlist}
          onToggleFavorite={handleToggleFavorite}
          watchlist={watchlist}
          favorites={favorites}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentPage === "watchlist" && (
        <CollectionPage
          type="watchlist"
          items={watchlist}
          onClear={() => handleClearCollection("watchlist")}
          onToggleWatchlist={handleToggleWatchlist}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {currentPage === "favorites" && (
        <CollectionPage
          type="favorites"
          items={favorites}
          onClear={() => handleClearCollection("favorites")}
          onToggleWatchlist={handleToggleWatchlist}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {currentPage === "genre" && selectedGenre && (
        <GenrePage
          genre={selectedGenre}
          onNavigate={handleNavigate}
          onToggleWatchlist={handleToggleWatchlist}
          onToggleFavorite={handleToggleFavorite}
          watchlist={watchlist}
          favorites={favorites}
        />
      )}
    </div>
  );
}

export default App;
