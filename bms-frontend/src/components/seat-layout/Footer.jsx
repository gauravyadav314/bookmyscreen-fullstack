import React from "react";
import { useNavigate } from "react-router-dom";
import { useSeatContext } from "../../context/SeatContext";
import { socket } from "../../utils/socket";
import { useAuth } from "../../context/AuthContext";
import { FaArrowRight } from "react-icons/fa";

const Footer = ({ isSelected, selectedSeats, showData, state }) => {
  const navigate = useNavigate();
  const { setShows } = useSeatContext();
  const { user } = useAuth();

  const handleNavigateToCheckout = () => {
    socket.emit("lock-seats", {
      showId: showData._id,
      seatIds: selectedSeats,
      userId: user?._id || "demo_user_67890",
    });

    navigate(`/shows/${showData._id}/${state || "Mumbai"}/checkout`);
    setShows(showData);
  };

  return (
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      {isSelected ? (
        <>
          <div>
            <p className="text-slate-900 dark:text-white font-extrabold text-sm sm:text-base">
              {selectedSeats.length} Seat{selectedSeats.length !== 1 ? "s" : ""} Selected
            </p>
            <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold truncate max-w-xs sm:max-w-md">
              Seats: {selectedSeats.join(", ")}
            </p>
          </div>

          <button
            onClick={handleNavigateToCheckout}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-7 py-2.5 rounded-xl font-extrabold text-sm shadow-lg shadow-rose-500/30 transition transform hover:scale-105 cursor-pointer"
          >
            <span>Proceed to Pay</span>
            <FaArrowRight />
          </button>
        </>
      ) : (
        <div className="w-full text-center text-xs text-slate-500 dark:text-slate-400 font-medium py-1">
          Select your seats above to proceed with booking
        </div>
      )}
    </div>
  );
};

export default Footer;
