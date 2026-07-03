import React from 'react';

interface StepperProps {
  currentStep?: number; // Optional: highlight current step (1-6)
}

export const Stepper: React.FC<StepperProps> = ({ currentStep = 1 }) => (
  <div className="mx-auto grid max-w-5xl grid-cols-6 items-start gap-2 px-4 py-7">
    {['Flight', 'Passenger', 'Service', 'Payment', 'Additional Services', 'Personalized'].map((step, index) => (
      <div key={step} className="relative flex flex-col items-center gap-2 text-center">
        {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
        <span
          className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${
            index + 1 === currentStep
              ? 'border-amber-400 bg-[#073b70] text-white'
              : index + 1 < currentStep
                ? 'border-green-500 bg-green-100 text-green-700'
                : 'border-slate-300 bg-slate-100 text-slate-400'
          }`}
        >
          {index + 1 < currentStep ? '✓' : index + 1}
        </span>
        <span
          className={`text-[10px] font-black uppercase ${
            index + 1 === currentStep ? 'text-[#073b70]' : 'text-slate-400'
          }`}
        >
          {step}
        </span>
      </div>
    ))}
  </div>
);

export default Stepper;