import HeaderLeft from "./HeaderLeft";
import HeaderSearch from "./HeaderSearch";
import HeaderRight from "./HeaderRight";

function Header({ onNavigate, currentPage, watchlistCount }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <HeaderLeft onNavigate={onNavigate} currentPage={currentPage} />
        <HeaderSearch />
        <HeaderRight onNavigate={onNavigate} currentPage={currentPage} watchlistCount={watchlistCount} />
      </div>
    </header>
  );
}

export default Header;
