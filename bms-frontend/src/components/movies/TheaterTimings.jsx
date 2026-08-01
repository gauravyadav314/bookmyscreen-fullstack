import { useState } from "react";
import dayjs from "dayjs";
import { theatres as fallbackTheatres } from "../../utils/constants";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getShowsByMovieAndLocation } from "../../apis";
import { useLocation } from "../../context/LocationContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaClock, FaMapMarkerAlt, FaCalendarCheck } from "react-icons/fa";

const TheaterTimings = ({ movieId }) => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { auth, toggleModal } = useAuth();

  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today);
  const formattedDate = selectedDate.format("DD-MM-YYYY");

  const next7days = Array.from({ length: 7 }, (_, i) => today.add(i, "day"));

  const { data: showData } = useQuery({
    queryKey: ["show", movieId, location || "Mumbai", formattedDate],
    queryFn: async () => await getShowsByMovieAndLocation(movieId, location || "Mumbai", formattedDate),
    placeholderData: keepPreviousData,
    select: (res) => res?.data,
  });

  return (
    <div className="space-y-6">
      {/* Date Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
        {next7days.map((date, i) => {
          const isSelected = selectedDate.isSame(date, "day");
          const isToday = today.isSame(date, "day");
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-2xl min-w-[70px] border transition cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-br from-rose-500 to-pink-600 border-rose-400 text-white shadow-lg shadow-rose-500/25 scale-105"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="text-xs font-bold uppercase">{date.format("ddd")}</span>
              <span className="text-base font-black leading-none my-0.5">{date.format("D")}</span>
              <span className="text-[10px] font-medium">{isToday ? "TODAY" : date.format("MMM").toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* Theatres & Showtimes List */}
      <div className="space-y-4">
        {(!showData || showData.length === 0) ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-500 dark:text-slate-400 transition-colors duration-300">
            <FaCalendarCheck className="mx-auto text-3xl text-rose-500 mb-3" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No showtimes found for {selectedDate.format("DD MMM YYYY")}</p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Please select another date or location above.</p>
          </div>
        ) : (
          showData.map((curr, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-lg transition hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  {curr.theater?.theaterDetails?.logo ? (
                    <img
                      src={curr.theater.theaterDetails.logo}
                      alt="logo"
                      className="w-9 h-9 object-contain rounded-lg bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 font-bold text-sm">
                      🎬
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      {curr.theater?.theaterDetails?.name || "Cinema Hall"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <FaMapMarkerAlt className="text-rose-500 text-[10px]" />
                      <span>{curr.theater?.theaterDetails?.city || location || "City Center"}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Allows Cancellation</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Showtimes Pill Grid */}
              <div className="flex flex-wrap gap-3">
                {curr.theater?.shows?.map((slot, idx) => {
                  const theaterId = curr.theater.theaterDetails._id;
                  const movieName = curr.movie.title;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!auth) {
                          toggleModal();
                          return;
                        }
                        navigate(`/movies/${movieId}/${encodeURIComponent(movieName)}/${location || "Mumbai"}/theater/${theaterId}/show/${slot._id}/seat-layout`);
                      }}
                      className="group flex flex-col items-center bg-slate-50 dark:bg-slate-950/80 hover:bg-rose-500/10 dark:hover:bg-rose-600/20 border border-slate-200 dark:border-slate-700 hover:border-rose-500 rounded-xl px-5 py-2.5 transition cursor-pointer shadow-sm"
                    >
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                        {slot.startTime}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-300 uppercase mt-0.5">
                        {slot.audioType || "4K DOLBY"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TheaterTimings;
