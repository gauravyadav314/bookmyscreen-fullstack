import { useRef, useState } from "react";
import { useCountdown } from "../../hooks/useCountdown";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

const StepOTP = ({ onNext }) => {
  const [otpArray, setOtpArray] = useState(new Array(4).fill(""));
  const inputRef = useRef([]);
  const { verifyOtpRequest, sendOtpRequest, authData, otpLoader } = useAuth();

  const { displayTime, isExpired, resetTimer } = useCountdown({
    initialTimeInSeconds: 2 * 60,
  });

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otpString = otpArray.join("");
    if (otpString.length < 4) return;
    verifyOtpRequest(otpString, onNext);
  };

  const handleResendOtp = (e) => {
    e.preventDefault();
    if (authData?.email) {
      sendOtpRequest({
        email: authData.email,
        onNext: () => {
          handleClearOtp();
          resetTimer();
        },
      });
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    const lastChar = value.slice(-1);

    if (lastChar === "" || /^[0-9]$/.test(lastChar)) {
      const newOtp = [...otpArray];
      newOtp[index] = lastChar;
      setOtpArray(newOtp);

      if (lastChar !== "" && index < inputRef.current.length - 1) {
        inputRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otpArray];
      if (newOtp[index]) {
        newOtp[index] = "";
        setOtpArray(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtpArray(newOtp);
        inputRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < inputRef.current.length - 1) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData) {
      const digits = pastedData.split("");
      const newOtp = new Array(4).fill("");
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtpArray(newOtp);
      const focusIndex = Math.min(digits.length, 3);
      inputRef.current[focusIndex]?.focus();
    }
  };

  const handleClearOtp = () => {
    setOtpArray(new Array(4).fill(""));
    inputRef.current[0]?.focus();
  };

  return (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3 px-8 py-5 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <h2 className="text-center text-lg font-bold text-slate-900 dark:text-white">
        Enter the code we just mailed you
      </h2>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        If you don't have an account, we'll create one for you.
      </p>

      {/* OTP INPUT */}
      <div className="flex items-center justify-center my-2">
        {otpArray.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => (inputRef.current[index] = ref)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name={`otp-${index}`}
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-11 h-11 font-bold text-center text-lg rounded-xl mx-1 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500 outline-none transition shadow-sm"
          />
        ))}

        <button
          onClick={handleClearOtp}
          type="button"
          className="w-8 h-8 cursor-pointer border border-slate-300 dark:border-slate-700 text-rose-500 ml-1 font-bold rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <IoClose size={20} className="inline" />
        </button>
      </div>

      {isExpired ? (
        <p className="text-center text-xs text-indigo-500 cursor-pointer">
          OTP expired. Please{" "}
          <button
            type="button"
            className="underline font-semibold cursor-pointer disabled:opacity-50"
            onClick={handleResendOtp}
            disabled={otpLoader}
          >
            {otpLoader ? "Resending..." : "resend OTP"}
          </button>
          .
        </p>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">OTP expires in {displayTime}</p>
          <button
            type="button"
            className="text-xs text-rose-500 underline cursor-pointer disabled:opacity-50 font-semibold"
            onClick={handleResendOtp}
            disabled={otpLoader}
          >
            {otpLoader ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      )}

      <button
        type="submit"
        className="w-full cursor-pointer text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 py-2.5 rounded-xl text-sm font-bold shadow-md transition"
      >
        Continue
      </button>

      <p className="text-slate-400 dark:text-slate-500 text-center m-auto text-[11px] leading-relaxed">
        By entering your email id, you're agreeing to our{" "}
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

export default StepOTP;
