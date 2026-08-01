import Header from "../components/seat-layout/Header";
import Footer from "../components/seat-layout/Footer";
import { useParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getShowById } from "../apis/index";
import { useSeatContext } from "../context/SeatContext";
import { useLocation } from "../context/LocationContext";
import { socket } from "../utils/socket";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaClock, FaCheckCircle, FaLock, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

const Seat = ({ seat, row, selectedSeats, lockedSeats, onClick }) => {
  const seatId = `${row}${seat.number}`;
  const isLocked = lockedSeats?.includes(seatId);
  const isSelected = selectedSeats.includes(seatId);
  const isBooked = seat.status === "BOOKED";

  let seatStyle = "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-rose-600 hover:border-rose-500 hover:text-white cursor-pointer";
  if (isBooked) {
    seatStyle = "bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60";
  } else if (isLocked) {
    seatStyle = "bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400 cursor-not-allowed animate-pulse";
  } else if (isSelected) {
    seatStyle = "bg-gradient-to-r from-rose-500 to-pink-600 border-rose-400 text-white font-extrabold shadow-lg shadow-rose-500/40 scale-105";
  }

  return (
    <button
      title={isBooked ? `Seat ${seatId} (Sold Out)` : isLocked ? `Seat ${seatId} (Locked by another user)` : `Seat ${seatId}`}
      className={`w-8 h-8 md:w-9 md:h-9 m-0.5 rounded-lg border text-xs font-bold transition-all duration-200 flex items-center justify-center ${seatStyle}`}
      disabled={isBooked || isLocked}
      onClick={onClick}
    >
      {isBooked ? "✕" : isLocked ? "🔒" : seat.number}
    </button>
  );
};

const SeatLayout = () => {
  const [lockedSeats, setLockedSeats] = useState([]);
  const { selectedSeats, setSelectedSeats } = useSeatContext();
  const { location } = useLocation();
  const { showId } = useParams();

  const [timeLeft, setTimeLeft] = useState(300); // 5 min countdown

  useEffect(() => {
    if (selectedSeats.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedSeats]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSelectSeat = (row, number) => {
    const seatId = `${row}${number}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((existingId) => existingId !== seatId) : [...prev, seatId]
    );
  };

  const { data: showData } = useQuery({
    queryKey: ["show", showId],
    queryFn: async () => await getShowById(showId),
    placeholderData: keepPreviousData,
    enabled: !!showId,
    select: (res) => res?.data,
  });

  const isSelectedSeats = selectedSeats.length > 0;

  /* Socket.io seat locking code */
  useEffect(() => {
    setSelectedSeats([]);
    socket.emit("join-show", { showId });

    socket.on("locked-seats-initials", ({ seatIds }) => {
      setLockedSeats(seatIds || []);
    });

    socket.on("seat-locked", ({ seatIds, showId: incomingShowId }) => {
      if (incomingShowId !== showId) return;
      setLockedSeats((prev) => [...new Set([...(prev || []), ...seatIds])]);
    });

    socket.on("seat-unlocked", ({ seatIds, showId: incomingShowId }) => {
      if (incomingShowId !== showId) return;
      setLockedSeats((prev) => (prev || []).filter((id) => !seatIds.includes(id)));
    });

    socket.on("seat-locked-failed", ({ alreadyLocked }) => {
      toast.error(`Seats already locked by another user: ${alreadyLocked.join(", ")}`);
    });

    return () => {
      socket.off("locked-seats-initials");
      socket.off("seat-locked");
      socket.off("seat-unlocked");
      socket.off("seat-locked-failed");
    };
  }, [showId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-20">
        <Header showData={showData} />
      </div>

      {/* Main Seat Area */}
      <div className="max-w-6xl mx-auto w-full pt-[170px] pb-32 px-4 flex flex-col items-center">
        
        {/* Real-time Status Legend & Lock Countdown */}
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 shadow-md dark:shadow-xl flex flex-wrap items-center justify-between gap-4 transition-colors duration-300">
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-4 h-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md inline-block"></span>
              <span>Available</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
              <span className="w-4 h-4 bg-rose-600 rounded-md inline-block"></span>
              <span>Selected</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-4 h-4 bg-amber-500/30 border border-amber-500/60 rounded-md inline-block"></span>
              <span>Locked</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <span className="w-4 h-4 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md inline-block"></span>
              <span>Sold Out</span>
            </span>
          </div>

          {isSelectedSeats && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse">
              <FaClock />
              <span>Lock Timer: {formatTimer(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Seat Tiers & Matrix */}
        {showData?.seatLayout && (
          <div className="w-full flex flex-col items-center space-y-8">
            {Object.entries(
              showData.seatLayout.reduce((acc, curr) => {
                if (!acc[curr.type]) acc[curr.type] = { price: curr.price, rows: [] };
                acc[curr.type].rows.push(curr);
                return acc;
              }, {})
            ).map(([type, { price, rows }]) => (
              <div key={type} className="w-full flex flex-col items-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-6 rounded-3xl shadow-md dark:shadow-xl transition-colors duration-300">
                <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 w-full justify-center">
                  <span>{type}</span> • <span className="text-rose-500 dark:text-rose-400">₹{price}</span>
                </h3>
                <div className="space-y-2">
                  {rows.map((rowObj) => (
                    <div key={rowObj.row} className="flex items-center justify-center">
                      <div className="w-7 text-right mr-3 text-xs font-bold text-slate-400">
                        {rowObj.row}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {rowObj.seats.map((seat, i) => (
                          <Seat
                            key={i}
                            seat={seat}
                            row={rowObj.row}
                            selectedSeats={selectedSeats}
                            lockedSeats={lockedSeats}
                            onClick={() => handleSelectSeat(rowObj.row, seat.number)}
                          />
                        ))}
                      </div>
                      <div className="w-7 text-left ml-3 text-xs font-bold text-slate-400">
                        {rowObj.row}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Curved Glowing Screen Graphic */}
        <div className="w-full max-w-2xl mt-12 flex flex-col items-center">
          <div className="relative w-full h-8 flex items-center justify-center">
            {/* Glowing screen curve */}
            <div className="w-full h-3 bg-gradient-to-r from-sky-500 via-indigo-400 to-sky-500 rounded-t-full shadow-[0_-8px_30px_rgba(56,189,248,0.7)] border-t border-sky-300"></div>
          </div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400/80 mt-2 flex items-center gap-1.5">
            <FaInfoCircle className="text-xs" /> ALL EYES THIS WAY (SCREEN)
          </p>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3 px-6 z-20 shadow-2xl transition-colors duration-300">
        <Footer isSelected={isSelectedSeats} selectedSeats={selectedSeats} showData={showData} state={location} />
      </div>
    </div>
  );
};

export default SeatLayout;
