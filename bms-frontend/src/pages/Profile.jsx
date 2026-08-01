import React, { useEffect, useState } from "react";
import { tabs } from "../utils/constants";
import { IoIosLogOut } from "react-icons/io";
import { FaUserCircle, FaTicketAlt, FaShieldAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import BookingHistory from "../components/profile/BookingHistory";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const Profile = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const { user, logoutRequest } = useAuth();

  useEffect(() => {
    if (tab && tabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (t) => {
    setActiveTab(t);
    if (user?._id) {
      navigate(`/profile/${user._id}/${t}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-300">
      {/* Sub Header Tab Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-8 py-3 text-sm font-extrabold">
          <button
            onClick={() => handleTabChange("profile")}
            className={`flex items-center gap-2 pb-1 border-b-2 transition cursor-pointer ${
              activeTab === "profile"
                ? "border-rose-500 text-rose-500 dark:text-rose-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FaUserCircle /> PROFILE DETAILS
          </button>
          <button
            onClick={() => handleTabChange("booking")}
            className={`flex items-center gap-2 pb-1 border-b-2 transition cursor-pointer ${
              activeTab === "booking"
                ? "border-rose-500 text-rose-500 dark:text-rose-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FaTicketAlt /> MY BOOKINGS
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "profile" ? (
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="bg-gradient-to-r from-rose-500/10 via-slate-100 to-rose-100 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-md dark:shadow-2xl transition-colors duration-300">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 p-1 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center text-rose-500 dark:text-rose-400 text-2xl font-bold">
                    {user?.name?.[0] || "U"}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{user?.name || "User"}</h2>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">{user?.role === "ADMIN" ? "Verified Administrator" : "Verified Customer"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={logoutRequest}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <IoIosLogOut className="text-base" /> Sign Out
              </button>
            </div>

            {/* Account Details Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-4 transition-colors duration-300">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FaShieldAlt className="text-rose-500" /> Account Security & Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-rose-500 text-base" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Email Address</p>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    Verified
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <FaPhoneAlt className="text-rose-500 text-base" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Mobile Phone</p>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{user?.phone || "+91 9876543210"}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <BookingHistory />
        )}
      </div>
    </div>
  );
};

export default Profile;
