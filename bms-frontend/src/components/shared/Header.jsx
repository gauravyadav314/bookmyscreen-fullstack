import React, { useState, useEffect, useRef } from "react";
import mainLogo from "../../assets/main-icon.png";
import { FaSearch, FaUserCircle, FaMapMarkerAlt, FaSignOutAlt, FaTicketAlt, FaChevronDown, FaTimes } from "react-icons/fa";
import { useLocation } from "../../context/LocationContext";
import { useNavigate } from "react-router-dom";
import SignInModel from "./SignInModel";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { getAllMovies } from "../../apis";

const CITIES = [
  "Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Chandigarh", "Jaipur"
];

const Header = () => {
  const { location, setLocation, loading } = useLocation();
  const { toggleModal, auth, user, logoutRequest } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await getAllMovies();
        if (res?.data?.data) {
          setMoviesList(res.data.data);
        } else if (Array.isArray(res?.data)) {
          setMoviesList(res.data);
        }
      } catch (err) {
        console.error("Failed to load movies for search", err);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matched = moviesList.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.genre?.some((g) => g.toLowerCase().includes(q)) ||
          m.language?.some((l) => l.toLowerCase().includes(q))
      );
      setFilteredMovies(matched);
      setShowSearchDropdown(true);
    } else {
      setFilteredMovies([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, moviesList]);

  // Click outside search container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMovie = (movie) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    const loc = location || "Mumbai";
    navigate(`/movies/${loc}/${encodeURIComponent(movie.title)}/${movie._id}/ticket`);
  };

  const handleSelectCity = (city) => {
    if (setLocation) setLocation(city);
    setShowCityModal(false);
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-md sticky top-0 z-40 transition-colors duration-300">
      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Search */}
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <img
              onClick={() => navigate("/")}
              src={mainLogo}
              alt="BookMyScreen Logo"
              className="h-9 object-contain cursor-pointer transition hover:opacity-90 drop-shadow"
            />

            {/* Instant Search Bar */}
            <div className="relative flex-1 hidden sm:block" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                  placeholder="Search for Movies, Events, Genres, Languages..."
                  className="w-full bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm border border-slate-300 dark:border-slate-700/80 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition shadow-inner"
                />
                <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn max-h-96 overflow-y-auto">
                  {filteredMovies.length > 0 ? (
                    filteredMovies.map((movie) => (
                      <div
                        key={movie._id}
                        onClick={() => handleSelectMovie(movie)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800/90 cursor-pointer border-b border-slate-100 dark:border-slate-800/60 last:border-0 transition"
                      >
                        <img
                          src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100"}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded shadow"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{movie.title}</h4>
                          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                            {movie.language?.join(", ")} • {movie.genre?.join(", ")}
                          </p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{movie.duration} min</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      No movies found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location, Theme & Auth Controls */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Location Switcher */}
            <button
              onClick={() => setShowCityModal(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700/60 transition"
            >
              <FaMapMarkerAlt className="text-rose-500 text-sm" />
              <span>{loading ? "Select your region" : (location || "Select your region")}</span>
              <FaChevronDown className="text-[10px] text-slate-400" />
            </button>

            {/* Auth State Button / Profile Menu */}
            {auth ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 hover:from-rose-500/20 hover:to-pink-500/20 border border-rose-500/40 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition"
                >
                  <FaUserCircle className="text-rose-500 text-base" />
                  <span className="max-w-[120px] truncate">{user?.name || "User"}</span>
                  <FaChevronDown className="text-[10px] text-slate-400" />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.email || "User"}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate(`/profile/${user?._id}/profile`);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition"
                    >
                      <FaTicketAlt className="text-rose-500 dark:text-rose-400" /> My Bookings & Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logoutRequest();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 transition"
                    >
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => toggleModal()}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs sm:text-sm shadow-md hover:shadow-rose-500/25 transition cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub Navbar */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-2 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-0.5">
            <span onClick={() => navigate("/movies")} className="cursor-pointer hover:text-rose-500 dark:hover:text-rose-400 transition">Movies</span>
            <span onClick={() => navigate("/")} className="cursor-pointer hover:text-rose-500 dark:hover:text-rose-400 transition">Stream</span>
            <span onClick={() => navigate("/")} className="cursor-pointer hover:text-rose-500 dark:hover:text-rose-400 transition">Events</span>
            <span onClick={() => navigate("/")} className="cursor-pointer hover:text-rose-500 dark:hover:text-rose-400 transition">Plays</span>
            <span onClick={() => navigate("/")} className="cursor-pointer hover:text-rose-500 dark:hover:text-rose-400 transition">Sports</span>
            <span onClick={() => navigate("/")} className="cursor-pointer hover:text-rose-500 dark:hover:text-rose-400 transition">Activities</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">ListYourShow</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">Offers</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">Gift Cards</span>
          </div>
        </div>
      </div>

      {/* City Selector Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaMapMarkerAlt className="text-rose-500" /> Select Your City
              </h3>
              <button onClick={() => setShowCityModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <FaTimes />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose your location to see movies & showtimes near you.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className={`p-2.5 text-xs font-semibold rounded-xl border transition ${
                    location === city
                      ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 font-bold"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <SignInModel />
    </header>
  );
};

export default Header;
