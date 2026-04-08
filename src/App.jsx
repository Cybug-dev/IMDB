import "./App.css";
import Header from "./components/Header/Header";
import WatchlistPage from "./pages/Watchlist/WatchlistPage";

function App() {
  return (
    <div className="app-shell">
      <Header />
      <WatchlistPage />
    </div>
  );
}

export default App;
