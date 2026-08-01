import React from "react";
import { IoClose } from "react-icons/io5";
import mainWhiteLogo from "../../assets/main-icon-white.png";
import { useAuth } from "../../context/AuthContext";
import StepEmail from "../auth/StepEmail";
import StepOTP from "../auth/StepOTP";
import StepAccountCreation from "../auth/StepAccountCreation";

const steps = {
  1: StepEmail,
  2: StepOTP,
  3: StepAccountCreation,
};

const SignInModel = () => {
  const { step, setStep, showModal, toggleModal } = useAuth();

  const Step = steps[step];

  const onNext = () => {
    setStep(step + 1);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-[90%] h-[620px] max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300">
        {/* Top Header Section */}
        <div
          className="bg-gradient-to-r from-slate-900 via-rose-900 to-rose-600 text-white px-6
            py-8 h-[260px] relative items-center flex flex-col justify-center shadow-md"
        >
          <IoClose onClick={() => toggleModal()} className="absolute top-4 right-4 text-3xl cursor-pointer text-white/80 hover:text-white transition" />
          <img
            src={mainWhiteLogo}
            alt="BookMyScreen"
            className="mx-auto h-20 mb-2 object-contain"
          />
          <p className="text-sm font-semibold text-rose-100">Where movies meet magic.</p>
        </div>

        <div>
          <Step onNext={onNext} />
        </div>
      </div>
    </div>
  );
};

export default SignInModel;
