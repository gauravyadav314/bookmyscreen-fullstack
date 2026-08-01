import React from "react";
import { movies as staticMovies } from "../utils/constants";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRecommendedMovies } from "../apis";
import { useNavigate } from "react-router-dom";
import MovieCard from "./movies/MovieCard";
import { FaFire, FaChevronRight } from "react-icons/fa";

const Recommended = () => {
  const navigate = useNavigate();

  const { data: recMovies, isError } = useQuery({
    queryKey: ["recommendedMovies"],
    queryFn: async () => {
      return await getRecommendedMovies();
    },
    placeholderData: keepPreviousData,
  });

  const displayMovies = recMovies?.data?.topMovies || staticMovies;

  return (
    <section className="w-full py-8 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaFire className="text-rose-500 text-lg" /> Recommended Movies
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Handpicked blockbusters playing in theatres now</p>
          </div>
          <button 
            onClick={() => navigate("/movies")}
            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3.5 py-1.5 rounded-full transition"
          >
            <span>See All</span>
            <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        {/* Movie Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayMovies.map((movie, i) => (
            <MovieCard key={movie._id || movie.id || i} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Recommended;
