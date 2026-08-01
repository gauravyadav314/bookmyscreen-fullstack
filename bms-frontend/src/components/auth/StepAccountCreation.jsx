import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const StepAccountCreation = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { activateUserRequest } = useAuth();

  const handleActivateAccount = (e) => {
    e.preventDefault();
    activateUserRequest({ name, phone });
  };

  return (
    <form onSubmit={handleActivateAccount} className="flex flex-col gap-3 px-8 py-5 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <h2 className="text-center text-lg font-bold text-slate-900 dark:text-white">Enter your account details</h2>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        If you don't have an account, we'll create one for you.
      </p>

      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-rose-500 transition">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="flex-grow outline-none text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400"
          required
        />
      </div>
      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-rose-500 transition">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          className="flex-grow outline-none text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full cursor-pointer text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 font-semibold py-2.5 rounded-xl text-sm shadow-md transition"
      >
        Create Account
      </button>

      <p className="text-slate-400 dark:text-slate-500 text-center m-auto text-[11px] leading-relaxed">
        By entering your details, you're agreeing to our{" "}
        <a href="#" className="text-rose-500 underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-rose-500 underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
};

export default StepAccountCreation;
