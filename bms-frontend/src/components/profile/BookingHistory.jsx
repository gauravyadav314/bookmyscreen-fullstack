import React, { useState } from "react";
import { ordersData as staticOrders } from "../../utils/constants";
import { MdChair } from "react-icons/md";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUserBookings } from "../../apis";
import dayjs from "dayjs";
import { FaTicketAlt, FaQrcode, FaCheckCircle, FaTimesCircle, FaDownload, FaTimes } from "react-icons/fa";

const BookingHistory = () => {
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);

  const { data: fetchedData } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => await getUserBookings(),
    placeholderData: keepPreviousData,
  });

  const apiBookings = fetchedData?.data?.bookings || fetchedData?.data || [];
  
  const bookingsToDisplay = Array.isArray(apiBookings) ? apiBookings : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 transition-colors duration-300">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FaTicketAlt className="text-rose-500" /> Your Movie Passes & Tickets ({bookingsToDisplay.length})
        </h3>
      </div>

      {bookingsToDisplay.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 transition-colors duration-300">
          <FaTicketAlt className="mx-auto text-4xl text-rose-500/50 mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No active movie bookings found.</p>
          <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Book tickets for upcoming movies to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookingsToDisplay.map((item, idx) => {
            const isApi = !!item._id;
            const title = isApi ? item.showId?.movie?.title : item.title;
            const poster = isApi ? item.showId?.movie?.posterUrl : item.poster;
            const dateStr = isApi
              ? dayjs(item.showId?.date, "DD-MM-YYYY").format("D MMM YYYY")
              : item.datetime;
            const timeStr = isApi ? item.showId?.startTime : "";
            const theaterStr = isApi ? item.showId?.theater?.name : item.cinema;
            const seatsStr = isApi ? item.seats?.join(", ") : item.seats;
            const totalAmount = isApi ? item.bookingFee?.total : item.total;
            const bookingId = isApi ? item.bookingRef : item.id;

            return (
              <div
                key={isApi ? item._id : item.id || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-4">
                    {poster ? (
                      <img src={poster} alt={title} className="w-14 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow" />
                    ) : (
                      <div className="w-14 h-20 bg-slate-100 dark:bg-slate-950 rounded-xl flex items-center justify-center text-2xl">🎬</div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h4>
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaCheckCircle /> CONFIRMED
                        </span>
                      </div>
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
                        {dateStr} {timeStr && `| ${timeStr}`}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{theaterStr}</p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col items-end gap-2 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400">₹{totalAmount}</span>
                    <button
                      onClick={() => setSelectedTicketModal({ title, poster, dateStr, timeStr, theaterStr, seatsStr, totalAmount, bookingId })}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <FaQrcode className="text-rose-500 dark:text-rose-400" /> View QR Pass
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MdChair className="text-rose-500 text-base" />
                    <span>Seats: <strong className="text-slate-900 dark:text-white">{seatsStr}</strong></span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Booking ID: {bookingId}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal View */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl text-center space-y-4 relative">
            <button
              onClick={() => setSelectedTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <FaTimes />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Digital M-Ticket Pass</h3>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left space-y-3 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-extrabold text-rose-500 tracking-widest uppercase">BookMyScreen Verified Pass</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">{selectedTicketModal.bookingId}</span>
              </div>

              <div className="flex items-center gap-3">
                {selectedTicketModal.poster && (
                  <img src={selectedTicketModal.poster} alt="" className="w-12 h-16 rounded object-cover shadow" />
                )}
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedTicketModal.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedTicketModal.theaterStr}</p>
                  <p className="text-xs font-bold text-rose-500 dark:text-rose-400">{selectedTicketModal.dateStr} {selectedTicketModal.timeStr}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <p className="text-slate-600 dark:text-slate-400">Seats: <span className="font-extrabold text-slate-900 dark:text-white">{selectedTicketModal.seatsStr}</span></p>
                <p className="text-slate-600 dark:text-slate-400">Total Paid: <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{selectedTicketModal.totalAmount}</span></p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="w-20 h-20 bg-white p-1.5 rounded-xl flex items-center justify-center shadow">
                  <FaQrcode className="text-slate-950 text-6xl" />
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow"
            >
              <FaDownload /> Print / Download Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
