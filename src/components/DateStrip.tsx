import React from 'react';

interface DateStripProps {
  selectedReturn?: boolean;
}

export const DateStrip: React.FC<DateStripProps> = ({ selectedReturn = false }) => {
  const prices = selectedReturn
    ? ['Mon 12 THB 185.83', 'Tue 13 THB 264.72', 'Wed 14 THB 225.77', 'Thu 15 THB 300.00', 'Fri 16 THB 338.80', 'Sat 17 THB 238.80']
    : ['Mon 25 THB 185.83', 'Tue 26 THB 264.72', 'Wed 27 THB 225.77', 'Thu 28 THB 282.00', 'Fri 29 THB 238.80', 'Sat 30 THB 238.80'];

  return (
    <div className="mx-auto flex max-w-5xl items-center gap-3 overflow-x-auto px-4 pb-8">
      <button className="h-14 shrink-0 rounded-xl bg-blue-600 px-5 text-sm font-black text-white">&lt; - 2 days</button>
      {prices.map((price, index) => (
        <button
          key={price}
          className={`h-20 min-w-28 rounded-xl border px-3 text-center text-sm font-black ${
            index === 3 ? 'border-[#073b70] bg-[#073b70] text-white ring-4 ring-blue-200' : 'border-slate-300 bg-white text-slate-600'
          }`}
        >
          <span className="block text-xs font-bold opacity-70">{price.split(' ').slice(0, 2).join(' ')}</span>
          {price.split(' ').slice(2).join(' ')}
          {index === 0 && <span className="mt-1 block rounded border border-blue-600 text-[9px] uppercase text-blue-600">Lowest Price</span>}
        </button>
      ))}
      <button className="h-14 shrink-0 rounded-xl bg-blue-600 px-5 text-sm font-black text-white">+ 7 days &gt;</button>
    </div>
  );
};

export default DateStrip;