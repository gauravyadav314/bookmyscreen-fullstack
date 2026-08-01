import React, { useState } from "react";
import TheaterTimings from "../components/movies/TheaterTimings";
import { filters } from "../utils/constants";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMovieById } from "../apis/index";
import { useParams } from "react-router-dom";
import { FaStar, FaPlay, FaShareAlt, FaCalendarAlt, FaClock, FaFilm, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const { id } = useParams();
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const { data: movieRes } = useQuery({
    queryKey: ["movie", id],
    queryFn: async () => await getMovieById(id),
    placeholderData: keepPreviousData,
  });

  const movie = movieRes?.data?.movie || movieRes?.data;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title || "BookMyScreen",
        text: `Book tickets for ${movie?.title || "Movie"} on BookMyScreen!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const defaultPoster = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";
  const posterSrc = movie?.posterUrl || defaultPoster;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-300">
      {/* Movie Details Hero Banner */}
      <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        {/* Background Backdrop Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 dark:opacity-25 scale-110"
          style={{ backgroundImage: `url(${posterSrc})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
            
            {/* Poster Card */}
            <div className="relative group flex-shrink-0">
              <div className="w-56 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-950">
                <img
                  src={posterSrc}
                  alt={movie?.title || "Movie"}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setShowTrailerModal(true)}
                className="w-full mt-3 py-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                <FaPlay className="text-rose-500" /> Watch Trailer
              </button>
            </div>

            {/* Movie Info */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {movie?.title || "Loading Movie..."}
                </h1>
                <button
                  onClick={handleShare}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white p-2.5 rounded-full border border-slate-700 transition cursor-pointer"
                  title="Share"
                >
                  <FaShareAlt className="text-xs" />
                </button>
              </div>

              {/* Rating Pill */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-400/30 px-4 py-2 rounded-xl backdrop-blur-md">
                  <FaStar className="text-amber-400 text-base" />
                  <span className="font-extrabold text-white text-base">
                    {movie?.rating || 8.5}/10
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    ({movie?.votes || "10K"} Votes)
                  </span>
                </div>
              </div>

              {/* Languages & Formats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                {movie?.format?.map((fmt, idx) => (
                  <span key={idx} className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-lg">
                    {fmt}
                  </span>
                ))}
                {movie?.languages?.map((lang, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium px-3 py-1 rounded-lg">
                    {lang}
                  </span>
                ))}
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 font-medium pt-1">
                <span className="flex items-center gap-1.5"><FaClock className="text-rose-400" /> {movie?.duration || "2h 15m"}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><FaFilm className="text-rose-400" /> {Array.isArray(movie?.genre) ? movie.genre.join(", ") : movie?.genre}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-rose-400" /> {movie?.releaseDate || "Released"}</span>
                <span>•</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">{movie?.certification || "UA13+"}</span>
              </div>

              {/* Synopsis */}
              <div className="pt-2 max-w-3xl">
                <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider mb-1.5">Synopsis</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {movie?.description || "An immersive cinematic experience filled with high-stakes action, emotional drama, and spectacular visuals."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Theater Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Availability Legend & Filter Tags */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-md dark:shadow-lg mb-6 flex flex-wrap items-center justify-between gap-4 transition-colors duration-300">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block shadow-sm shadow-emerald-500/50"></span>
              <span>Available</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block shadow-sm shadow-amber-400/50"></span>
              <span>Fast Filling</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block shadow-sm shadow-rose-500/50"></span>
              <span>Almost Full</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {filters.slice(0, 5).map((filter, i) => (
              <span key={i} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {filter}
              </span>
            ))}
          </div>
        </div>

        {/* Theater Timings */}
        <TheaterTimings movieId={id} />
      </div>

      {/* Trailer Dialog Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FaPlay className="text-rose-500 text-xs" /> {movie?.title} - Official Trailer
              </h4>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <FaTimes />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Movie Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
