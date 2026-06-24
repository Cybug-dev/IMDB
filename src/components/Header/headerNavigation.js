import { faHeart, faStar } from "@fortawesome/free-regular-svg-icons";
import {
  faArrowRightToBracket,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

export const primaryNavItems = [
  { label: "Home", icon: faHouse, page: "home" },
  { label: "Movies", page: "movies" },
  { label: "TV Shows", page: "tvshows" },
  { label: "Celebrities", page: "celebrities" },
];

export const headerActions = [
  { label: "Watchlist", icon: faStar, page: "watchlist" },
  { label: "Favorites", icon: faHeart, page: "favorites" },
  { label: "Sign In", icon: faArrowRightToBracket, page: null },
];

export const mobileNavItems = [
  ...primaryNavItems,
  { label: "Favorites", icon: faHeart, page: "favorites" },
  { label: "Watchlist", icon: faStar, page: "watchlist" },
];
