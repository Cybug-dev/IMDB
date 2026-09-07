import "./App.scss";
import { useCallback, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import CookieConsent from "./components/CookieConsent/CookieConsent";
import CollectionPage from "./pages/Collection/CollectionPage";
import HomePage from "./pages/Home/HomePage";
import GenrePage from "./pages/Genre/GenrePage";
import MovieDetailsPage from "./pages/MovieDetails/MovieDetailsPage";
import MoviesPage from "./pages/Movies/MoviesPage";
import SearchPage from "./pages/Search/SearchPage";
import useStoredMovieCollections from "./hooks/useStoredMovieCollections";
import { MovieCollectionsContext } from "./context/MovieCollectionsContext";

const getPageFromPath = (pathname) => {
  if (pathname.startsWith("/movies")) return "movies";
  if (pathname.startsWith("/watchlist")) return "watchlist";
  if (pathname.startsWith("/favorites")) return "favorites";
  if (pathname.startsWith("/genre")) return "genre";
  if (pathname.startsWith("/movie")) return "movie";
  if (pathname.startsWith("/tv")) return "movie";
  if (pathname.startsWith("/search")) return "search";
  return "home";
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = getPageFromPath(location.pathname);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const collections = useStoredMovieCollections();
  const {
    watchlist, favorites,
    onToggleWatchlist: handleToggleWatchlist,
    onToggleFavorite: handleToggleFavorite,
    onClearCollection: handleClearCollection,
  } = collections;
  const [isHeaderGlass, setIsHeaderGlass] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [heroContentBoundaryNode, setHeroContentBoundaryNode] = useState(null);

  const handleHeaderHeightChange = useCallback((height) => {
    setHeaderHeight(height);
  }, []);

  // useEffect(() => {
  //   if ("scrollRestoration" in window.history) {
  //     window.history.scrollRestoration = "manual";
  //   }
  // }, []);

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

  const handleNavigate = useCallback((page, payload = null) => {
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
      movies: "/movies",
      watchlist: "/watchlist",
      favorites: "/favorites",
    };

    navigate(paths[page] ?? "/");
  }, [navigate]);

  const shouldUseGlassHeader = currentPage !== "home" || isHeaderGlass;
  const shouldUsePageBackground = currentPage === "home";

  return (
    <MovieCollectionsContext.Provider value={collections}>
    <div className={`app-shell${shouldUsePageBackground ? " app-shell--home" : ""}`}>
      <Toaster
        position="bottom-center"
        richColors
        closeButton={false}
        visibleToasts={2}
        toastOptions={{
          duration: 3600,
        }}
      />
      <CookieConsent />
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
          path="/movies"
          element={
            <MoviesPage
              onToggleWatchlist={handleToggleWatchlist}
              onToggleFavorite={handleToggleFavorite}
              watchlist={watchlist}
              favorites={favorites}
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
              onNavigate={handleNavigate}
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
              onNavigate={handleNavigate}
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
              mediaType="movie"
              onToggleWatchlist={handleToggleWatchlist}
              onToggleFavorite={handleToggleFavorite}
              watchlist={watchlist}
              favorites={favorites}
            />
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/tv/:id"
          element={
            <MovieDetailsPage
              mediaType="tv"
              onToggleWatchlist={handleToggleWatchlist}
              onToggleFavorite={handleToggleFavorite}
              watchlist={watchlist}
              favorites={favorites}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
    </MovieCollectionsContext.Provider>
  );
}

export default App;
