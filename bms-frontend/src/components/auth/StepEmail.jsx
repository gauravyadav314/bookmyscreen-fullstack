import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BeatLoader } from 'react-spinners';
import { FaUserCheck, FaUserShield } from 'react-icons/fa';

const StepEmail = ({ onNext }) => {
  const [email, setEmail] = useState("");
  const { sendOtpRequest, otpLoader, loginDemoUser } = useAuth();

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    sendOtpRequest({ email: email.trim().toLowerCase(), onNext });
  };

  return (
    <form onSubmit={handleSendOtp} className="flex flex-col gap-3 px-8 py-5 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <h2 className="text-center text-lg font-bold text-slate-900 dark:text-white">Get Started</h2>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">Enter your email address to continue</p>

      <div className="flex items-center border rounded-xl border-slate-300 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-rose-500 transition">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-grow outline-none text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full cursor-pointer text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 font-semibold py-2.5 rounded-xl text-sm shadow-md transition"
      >
        {otpLoader ? <BeatLoader size={10} color="white" /> : "Continue"}
      </button>

      <p className="text-slate-400 dark:text-slate-500 text-center m-auto text-[11px] leading-relaxed mt-1">
        By logging in, you agree to our <a href="#" className="text-rose-500 underline">Terms of Service</a> & <a href="#" className="text-rose-500 underline">Privacy Policy</a>.
      </p>
    </form>
  );
};

export default StepEmail;