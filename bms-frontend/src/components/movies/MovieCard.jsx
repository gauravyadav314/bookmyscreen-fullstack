import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaTicketAlt } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { location } = useLocation();

  const handleNavigate = (movie) => {
    const originalTitle = movie.title;
    const cleanedTitle = originalTitle.includes(":") ? originalTitle.replace(/:/g, "") : originalTitle;
    const formattedTitle = cleanedTitle.replace(/\s+/g, "-").toLowerCase();
    const loc = location || "Mumbai";
    navigate(`/movies/${loc}/${formattedTitle}/${movie._id}/ticket`);
  };

  const languagesText = Array.isArray(movie.language)
    ? movie.language.join(", ")
    : Array.isArray(movie.languages)
    ? movie.languages.join(", ")
    : movie.language || movie.languages || "Hindi, English";

  const genreText = Array.isArray(movie.genre)
    ? movie.genre.join(" • ")
    : movie.genre || "Action, Drama";

  return (
    <div
      onClick={() => handleNavigate(movie)}
      className="group relative flex flex-col bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl dark:hover:shadow-rose-500/20 hover:border-rose-500/50 transition-all duration-300 transform hover:-translate-y-1.5"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        <img
          src={movie.posterUrl || movie.img}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-extrabold px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1 shadow">
            <FaStar className="text-[10px]" /> {movie.rating || 8.5}
          </span>
        </div>

        {/* Hover Glow Overlay button */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
          <button className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition transform group-hover:translate-y-0 translate-y-2">
            <FaTicketAlt /> Book Tickets
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3 flex flex-col flex-grow justify-between bg-white dark:bg-slate-900/95 transition-colors duration-300">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
            {movie.title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
            {genreText}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 truncate font-semibold">{languagesText}</span>
          {movie.votes && (
            <span className="text-slate-400 dark:text-slate-500 text-[10px] whitespace-nowrap">{movie.votes} votes</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;