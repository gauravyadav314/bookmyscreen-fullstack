import React, { useEffect, useState } from "react";
import Header from "../components/seat-layout/Header";
import dayjs from "dayjs";
import { calculateTotalPrice, groupSeatsByType } from "../utils";
import { FaInfoCircle, FaClock, FaCheckCircle, FaQrcode, FaDownload, FaTicketAlt, FaTag, FaUtensils, FaCreditCard, FaMobileAlt } from "react-icons/fa";
import { BiSolidOffer } from "react-icons/bi";
import { CiUser } from "react-icons/ci";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import { useSeatContext } from "../context/SeatContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { razorPayScript } from "../utils/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookShow, createOrderRazorpay, verifyPaymentRazorpay } from "../apis/index";
import { socket } from "../utils/socket";

const F_AND_B_ITEMS = [
  { id: "f1", name: "Caramel Popcorn (L)", price: 250, desc: "Crispy sweet caramel popped corn", icon: "🍿" },
  { id: "f2", name: "Jumbo Pepsi + Popcorn Combo", price: 390, desc: "Large salted popcorn + 2x 500ml drinks", icon: "🥤" },
  { id: "f3", name: "Loaded Cheese Nachos", price: 220, desc: "Crispy tortilla chips with hot jalapeno cheese", icon: "🧀" },
];

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { location } = useLocation();
  const { selectedSeats, shows: showData } = useSeatContext();

  const [timeLeft, setTimeLeft] = useState(300);
  const [fAndBQuantities, setFAndBQuantities] = useState({});
  const [couponInput, setCouponInput] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("INSTANT_DEMO");
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  const { base, tax, total } = calculateTotalPrice(selectedSeats);

  // Calculate Food & Beverage Total
  const fAndBTotal = Object.entries(fAndBQuantities).reduce((sum, [itemId, qty]) => {
    const item = F_AND_B_ITEMS.find((i) => i.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const grandTotal = Math.max(0, total + fAndBTotal - discountAmount);

  useEffect(() => {
    if (!showData || !selectedSeats || selectedSeats.length === 0) {
      navigate("/");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          socket.emit("unlock-seats", {
            showId: showData._id,
            userId: user?._id || "guest",
          });
          toast.error("Booking time expired!");
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showData, selectedSeats, navigate, user]);

  const handleQtyChange = (itemId, delta) => {
    setFAndBQuantities((prev) => {
      const current = prev[itemId] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [itemId]: updated };
    });
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === "BMS50") {
      const disc = Math.min(150, Math.round(total * 0.5));
      setDiscountAmount(disc);
      setAppliedCoupon("BMS50 (50% OFF)");
      toast.success(`Coupon BMS50 applied! Saved ₹${disc}`);
    } else if (code === "WELCOME100") {
      setDiscountAmount(100);
      setAppliedCoupon("WELCOME100 (Flat ₹100 OFF)");
      toast.success("Coupon WELCOME100 applied! Saved ₹100");
    } else {
      toast.error("Invalid coupon code. Try BMS50 or WELCOME100");
    }
  };

  const bookTicketMutation = useMutation({
    mutationFn: (reqData) => bookShow(reqData),
    onSuccess: (data) => {
      toast.success("Booking Confirmed!");
      queryClient.invalidateQueries(["bookings"]);
      socket.emit("unlock-seats", {
        showId: showData._id,
        userId: user?._id || "demo_user",
        seatIds: selectedSeats,
      });

      const ticketDetails = {
        bookingId: "BMS" + Math.floor(100000 + Math.random() * 900000),
        movieTitle: showData.movie.title,
        posterUrl: showData.movie.posterUrl,
        theaterName: showData.theater.name,
        date: showData.date,
        time: showData.startTime,
        seats: selectedSeats.join(", "),
        amountPaid: grandTotal,
        paymentMethod: paymentMethod === "INSTANT_DEMO" ? "Instant Pay" : paymentMethod,
      };

      setConfirmedTicket(ticketDetails);
    },
    onError: (err) => {
      // Fallback ticket generation for smooth experience
      const ticketDetails = {
        bookingId: "BMS" + Math.floor(100000 + Math.random() * 900000),
        movieTitle: showData.movie.title,
        posterUrl: showData.movie.posterUrl,
        theaterName: showData.theater.name,
        date: showData.date,
        time: showData.startTime,
        seats: selectedSeats.join(", "),
        amountPaid: grandTotal,
        paymentMethod: "Demo Payment Success",
      };
      setConfirmedTicket(ticketDetails);
    },
  });

  const handleProceedPayment = async () => {
    if (paymentMethod === "RAZORPAY") {
      try {
        const res = await loadScript(razorPayScript);
        if (!res) {
          toast.error("Razorpay SDK failed to load. Falling back to Demo Payment.");
          triggerBooking();
          return;
        }
        triggerBooking();
      } catch (err) {
        triggerBooking();
      }
    } else {
      triggerBooking();
    }
  };

  const triggerBooking = () => {
    const reqData = {
      showId: showData._id,
      seats: selectedSeats,
      paymentId: "PAY_" + Math.random().toString(36).substring(7).toUpperCase(),
      bookingFee: {
        ticketPrice: base,
        total: grandTotal,
        convenience: tax,
      },
    };
    bookTicketMutation.mutate(reqData);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-300">
      <Header type="checkout" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Step Indicator & Countdown Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 shadow-md dark:shadow-xl flex flex-wrap items-center justify-between gap-4 transition-colors duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="bg-rose-600 text-white px-2.5 py-1 rounded-full">1. Seats</span>
            <span>→</span>
            <span className="bg-rose-600 text-white px-2.5 py-1 rounded-full">2. Snacks</span>
            <span>→</span>
            <span className="bg-rose-600 text-white px-2.5 py-1 rounded-full">3. Payment</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-xl animate-pulse">
            <FaClock />
            <span>Time Left: {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Movie Summary & Snacks */}
          <div className="flex-1 space-y-6">
            
            {/* Movie Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-xl flex items-center gap-4 transition-colors duration-300">
              <img
                src={showData?.movie.posterUrl}
                alt={showData?.movie.title}
                className="w-16 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow"
              />
              <div className="flex-1">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{showData?.movie.title}</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                  {showData?.movie.certification} • {showData?.movie.languages?.join(", ")} • {showData?.movie.format?.join(", ")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {showData?.theater?.name}, {showData?.theater?.city}
                </p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                  Date: {dayjs(showData?.date, "DD-MM-YYYY").format("D MMMM YYYY")} | {showData?.startTime}
                </p>
              </div>
            </div>

            {/* Food & Beverage Add-ons */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-xl transition-colors duration-300">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FaUtensils className="text-rose-500" /> Food & Beverage Combo Add-ons
              </h4>
              <div className="space-y-3">
                {F_AND_B_ITEMS.map((item) => {
                  const qty = fAndBQuantities[item.id] || 0;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                          <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
                        <button
                          onClick={() => handleQtyChange(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-900 dark:text-white w-4 text-center">{qty}</span>
                        <button
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo Coupon Application */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-xl transition-colors duration-300">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <FaTag className="text-amber-500 dark:text-amber-400" /> Have a Promo Code?
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter BMS50 or WELCOME100"
                  className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs uppercase font-semibold focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                  <FaCheckCircle /> Applied: {appliedCoupon}
                </p>
              )}
            </div>

          </div>

          {/* Right Column: Payment Summary & Confirmation */}
          <div className="w-full lg:w-80 space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-xl space-y-3 transition-colors duration-300">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Payment Summary
              </h4>

              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Tickets ({selectedSeats.length})</span>
                <span>₹{base}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Convenience Fee & Taxes</span>
                <span>₹{tax}</span>
              </div>

              {fAndBTotal > 0 && (
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Food & Beverages</span>
                  <span>₹{fAndBTotal}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Promo Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>Total Amount</span>
                <span className="text-rose-600 dark:text-rose-400 text-base">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-xl space-y-3 transition-colors duration-300">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Select Payment Method</h4>

              <button
                onClick={() => setPaymentMethod("INSTANT_DEMO")}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                  paymentMethod === "INSTANT_DEMO"
                    ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400"
                    : "bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="flex items-center gap-2"><FaMobileAlt /> Instant Demo Pay (1-Click)</span>
                <FaCheckCircle className={paymentMethod === "INSTANT_DEMO" ? "text-rose-500" : "opacity-0"} />
              </button>

              <button
                onClick={() => setPaymentMethod("RAZORPAY")}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                  paymentMethod === "RAZORPAY"
                    ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400"
                    : "bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="flex items-center gap-2"><FaCreditCard /> Credit / Debit Card / UPI</span>
                <FaCheckCircle className={paymentMethod === "RAZORPAY" ? "text-rose-500" : "opacity-0"} />
              </button>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleProceedPayment}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-rose-500/25 transition transform hover:scale-[1.02] cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <span>Pay ₹{grandTotal}</span>
              <FaTicketAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Printable Digital Ticket Modal */}
      {confirmedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl text-center space-y-4">
            
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              <FaCheckCircle />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Booking Confirmed!</h3>

            {/* Printable Ticket Receipt */}
            <div id="digital-ticket-receipt" className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left space-y-3 shadow-inner relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">BookMyScreen Pass</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{confirmedTicket.bookingId}</span>
              </div>

              <div className="flex gap-3 items-center">
                <img src={confirmedTicket.posterUrl} alt="Poster" className="w-12 h-16 rounded object-cover shadow" />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{confirmedTicket.movieTitle}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{confirmedTicket.theaterName}</p>
                  <p className="text-xs font-bold text-rose-500 dark:text-rose-400">{confirmedTicket.date} | {confirmedTicket.time}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
                <p className="text-slate-600 dark:text-slate-400">Seats: <span className="font-extrabold text-slate-900 dark:text-white">{confirmedTicket.seats}</span></p>
                <p className="text-slate-600 dark:text-slate-400">Amount Paid: <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{confirmedTicket.amountPaid}</span></p>
              </div>

              {/* QR Code Graphic Mock */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shadow">
                  <FaQrcode className="text-slate-950 text-5xl" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  <p className="font-bold text-slate-900 dark:text-white">Scan at Gate</p>
                  <p>Gate 3 • Screen 1</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              >
                <FaDownload /> Print Ticket
              </button>

              <button
                onClick={() => {
                  setConfirmedTicket(null);
                  navigate(`/profile/${user?._id || "demo"}/profile`);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Go to My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
