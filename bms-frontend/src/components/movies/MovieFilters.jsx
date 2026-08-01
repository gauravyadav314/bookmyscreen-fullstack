import React from "react";
import { languages } from "../../utils/constants";
import { FaFilter, FaRedo } from "react-icons/fa";

const GENRES = ["Action", "Drama", "Comedy", "Thriller", "Sci-Fi", "Horror", "Fantasy", "Animation"];
const FORMATS = ["2D", "3D", "IMAX 3D", "4DX"];

const MovieFilters = ({ selectedLang, setSelectedLang, selectedGenre, setSelectedGenre, clearAll }) => {
  return (
    <div className="w-full md:w-1/4 space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FaFilter className="text-rose-500" /> Filters
          </h2>
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 transition"
          >
            <FaRedo className="text-[10px]" /> Reset
          </button>
        </div>

        {/* Languages */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2.5">Languages</h4>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((lang, i) => {
              const active = selectedLang === lang;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedLang(active ? null : lang)}
                  className={`text-xs px-3 py-1 rounded-full border font-medium transition ${
                    active
                      ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                      : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Genres */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2.5">Genres</h4>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((genre, i) => {
              const active = selectedGenre === genre;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedGenre(active ? null : genre)}
                  className={`text-xs px-3 py-1 rounded-full border font-medium transition ${
                    active
                      ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                      : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Formats */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2.5">Format</h4>
          <div className="flex flex-wrap gap-1.5">
            {FORMATS.map((fmt, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieFilters;
