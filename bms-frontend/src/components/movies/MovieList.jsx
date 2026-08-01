import React from 'react';
import MovieCard from './MovieCard';
import { FaFilm } from 'react-icons/fa';

const MovieList = ({ allMovies }) => {
  return (
    <div className="w-full md:w-3/4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl mb-6 shadow-md dark:shadow-lg transition-colors duration-300">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <FaFilm className="text-rose-500" /> Movies Playing Now ({allMovies?.length || 0})
        </h3>
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
          Showing All Languages & Genres
        </span>
      </div>

      {/* Movies Grid */}
      {allMovies && allMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {allMovies.map((movie, i) => (
            <MovieCard key={movie._id || movie.id || i} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 transition-colors duration-300">
          <p className="text-sm font-semibold">No movies match your selected filters.</p>
          <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Try resetting filters to discover all movies.</p>
        </div>
      )}
    </div>
  );
};

export default MovieList;