import { useState, useEffect } from "react";
import { fetchTrendingMovies, fetchTopRated } from "../../services/tmdb";
import { Award, TrendingUp, Star, Sparkles } from "lucide-react";
import HeroBanner from "./HeroBanner";
import FeaturedMovies from "./FeatureMovies";

function HomePage() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const [trendingData, topRatedData] = await Promise.all([
          fetchTrendingMovies(),
          fetchTopRated(),
        ]);
        setTrending(trendingData);
        setTopRated(topRatedData);
      } catch (loadError) {
        setError(
          loadError.message || "Failed to load movies. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  const heroMovie = trending[0] || topRated[0] || null;

  const sections = [
    {
      title: "Featured Movies",
      movies: topRated,
      LeftIcon: Award,
      RightIcon: Sparkles,
    },
    {
      title: "Trending Movies",
      movies: trending,
      LeftIcon: TrendingUp,
      RightIcon: Star,
    },
  ];

  return (
    <main className="home-page">
      <HeroBanner movie={heroMovie} />
      {sections.map((section) => (
        <FeaturedMovies
          key={section.title}
          title={section.title}
          movies={section.movies}
          LeftIcon={section.LeftIcon}
          RightIcon={section.RightIcon}
        />
      ))}
    </main>
  );
}
export default HomePage;
