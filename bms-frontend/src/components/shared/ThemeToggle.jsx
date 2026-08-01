import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle dark/light theme"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      className={`relative inline-flex items-center justify-between w-14 h-7 p-1 rounded-full cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
        isDark
          ? "bg-slate-800 border border-slate-700 hover:border-slate-600"
          : "bg-amber-100 border border-amber-300 hover:border-amber-400"
      } ${className}`}
    >
      <span className="sr-only">Toggle Theme</span>
      
      {/* Sliding Knob */}
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transform transition-transform duration-300 ease-in-out flex items-center justify-between p-1.5 shadow-md ${
          isDark
            ? "translate-x-7 bg-slate-900 text-amber-400 border border-slate-700"
            : "translate-x-0 bg-white text-amber-500 border border-amber-200"
        }`}
      >
        {isDark ? (
          <FaMoon className="w-3.5 h-3.5 text-amber-400 transform -rotate-12 transition-transform duration-300" />
        ) : (
          <FaSun className="w-3.5 h-3.5 text-amber-500 transform rotate-45 transition-transform duration-300" />
        )}
      </span>

      {/* Decorative background icons */}
      <span className="w-full flex items-center justify-between px-1 pointer-events-none">
        <FaSun className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? "opacity-30 text-slate-400" : "opacity-0"}`} />
        <FaMoon className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? "opacity-0" : "opacity-30 text-amber-600"}`} />
      </span>
    </button>
  );
};

export default ThemeToggle;
