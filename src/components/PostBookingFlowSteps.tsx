import React from 'react';
import { BadgeCheck } from 'lucide-react';

type PostBookingStep = 1 | 2 | 3;

interface PostBookingFlowStepsProps {
  currentStep: PostBookingStep;
}

const postBookingSteps = ['Confirmed', 'Services', 'Personalize'];

function PostBookingFlowSteps({ currentStep }: PostBookingFlowStepsProps): React.JSX.Element {
  return (
    <div className="he-pop mb-5 grid gap-2 rounded-lg border border-slate-300 bg-white p-3 shadow-sm sm:grid-cols-3">
      {postBookingSteps.map((step, index) => {
        const number = index + 1;
        const active = number === currentStep;
        const complete = number < currentStep;

        return (
          <div
            key={step}
            className={`he-action flex items-center gap-3 rounded px-3 py-2 ${active ? 'bg-[#073b70] text-white' : complete ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${active ? 'bg-white text-[#073b70]' : complete ? 'bg-green-600 text-white' : 'bg-white text-slate-500'}`}>
              {complete ? <BadgeCheck size={16} /> : number}
            </span>
            <span className="text-sm font-semibold">{step}</span>
          </div>
        );
      })}
    </div>
  );
}

export default PostBookingFlowSteps;
