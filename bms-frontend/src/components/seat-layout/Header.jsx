import React from "react";
import mainLogo from "../../assets/main-icon.png";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { FaUserCircle, FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../shared/ThemeToggle";

dayjs.extend(customParseFormat);

const Header = ({ showData, type }) => {
  const navigate = useNavigate();
  const { auth, user, toggleModal } = useAuth();

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <img
          onClick={() => navigate("/")}
          src={mainLogo}
          alt="BookMyScreen"
          className="h-8 object-contain cursor-pointer hover:opacity-90 transition drop-shadow"
        />

        {/* Center Details */}
        {type === "checkout" ? (
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
            Order Summary & Payment
          </h2>
        ) : (
          <div className="text-center">
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate max-w-md">
              {showData?.movie?.title || "Movie Selection"}
            </h2>
            <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
              <span>{showData?.date ? dayjs(showData.date, "DD-MM-YYYY").format("D MMMM YYYY") : ""}</span>
              <span>•</span>
              <span>{showData?.startTime}</span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 truncate">{showData?.theater?.name}</span>
            </p>
          </div>
        )}

        {/* Right side controls (ThemeToggle + Auth profile) */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {auth ? (
            <div
              onClick={() => navigate(`/profile/${user?._id}/profile`)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition"
            >
              <FaUserCircle className="text-rose-500 text-sm" />
              <span className="max-w-[100px] truncate">{user?.name || "User"}</span>
            </div>
          ) : (
            <button
              onClick={() => toggleModal()}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer shadow"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
