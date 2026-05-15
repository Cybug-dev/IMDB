import "./App.scss";
import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header/Header";
import CollectionPage from "./pages/Collection/CollectionPage";
import GenrePage from "./pages/Genre/GenrePage";
import HomePage from "./pages/Home/HomePage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isHeaderGlass, setIsHeaderGlass] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [heroContentBoundaryNode, setHeroContentBoundaryNode] = useState(null);

  const handleHeaderHeightChange = useCallback((height) => {
    setHeaderHeight(height);
  }, []);

  useEffect(() => {
    if (currentPage !== "home") {
      return undefined;
    }

    if (!heroContentBoundaryNode) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderGlass(
          !entry.isIntersecting && entry.boundingClientRect.top <= headerHeight,
        );
      },
      {
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: 0,
      },
    );

    observer.observe(heroContentBoundaryNode);

    return () => {
      observer.disconnect();
    };
  }, [currentPage, headerHeight, heroContentBoundaryNode]);

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
  const shouldUseGlassHeader = currentPage !== "home" || isHeaderGlass;

  return (
    <div className="app-shell">
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        watchlistCount={watchlist.length}
        isGlass={shouldUseGlassHeader}
        onHeightChange={handleHeaderHeightChange}
      />

      {currentPage === "home" && (
        <HomePage
          onToggleWatchlist={handleToggleWatchlist}
          onToggleFavorite={handleToggleFavorite}
          watchlist={watchlist}
          favorites={favorites}
          onNavigate={handleNavigate}
          heroContentBoundaryRef={setHeroContentBoundaryNode}
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
