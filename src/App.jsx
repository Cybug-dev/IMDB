import "./App.scss";
import { useCallback, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header/Header";
import CollectionPage from "./pages/Collection/CollectionPage";
import HomePage from "./pages/Home/HomePage";
import GenrePage from "./pages/Genre/GenrePage";
import MovieDetailsPage from "./pages/MovieDetails/MovieDetailsPage";

const getPageFromPath = (pathname) => {
  if (pathname.startsWith("/watchlist")) return "watchlist";
  if (pathname.startsWith("/favorites")) return "favorites";
  if (pathname.startsWith("/genre")) return "genre";
  if (pathname.startsWith("/movie")) return "movie";
  return "home";
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = getPageFromPath(location.pathname);
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
    if (page === "genre") {
      setSelectedGenre(payload);
      navigate(`/genre/${payload.slug}`);
      return;
    }

    if (page === "movie" && payload?.id) {
      navigate(`/movie/${payload.id}`);
      return;
    }

    const paths = {
      home: "/",
      watchlist: "/watchlist",
      favorites: "/favorites",
    };

    navigate(paths[page] ?? "/");
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

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onToggleWatchlist={handleToggleWatchlist}
              onToggleFavorite={handleToggleFavorite}
              watchlist={watchlist}
              favorites={favorites}
              onNavigate={handleNavigate}
              heroContentBoundaryRef={setHeroContentBoundaryNode}
            />
          }
        />
        <Route
          path="/watchlist"
          element={
            <CollectionPage
              type="watchlist"
              items={watchlist}
              onClear={() => handleClearCollection("watchlist")}
              onToggleWatchlist={handleToggleWatchlist}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            <CollectionPage
              type="favorites"
              items={favorites}
              onClear={() => handleClearCollection("favorites")}
              onToggleWatchlist={handleToggleWatchlist}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route
          path="/genre/:slug"
          element={
            selectedGenre ? (
              <GenrePage
                genre={selectedGenre}
                onNavigate={handleNavigate}
                onToggleWatchlist={handleToggleWatchlist}
                onToggleFavorite={handleToggleFavorite}
                watchlist={watchlist}
                favorites={favorites}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/movie/:id"
          element={
            <MovieDetailsPage
              onToggleWatchlist={handleToggleWatchlist}
              onToggleFavorite={handleToggleFavorite}
              watchlist={watchlist}
              favorites={favorites}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
