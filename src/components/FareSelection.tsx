import React from 'react';

interface Fare {
  name: string;
  price: number;
  active: boolean;
  perks: string[];
}

interface FareSelectionProps {
  fares?: Fare[];
}

const defaultFares: Fare[] = [
  {
    name: 'Economy Value',
    price: 282,
    active: false,
    perks: [
      'Cabin baggage 7kg',
      'Check-in baggage 20kg',
      'Complimentary snacks / meals & beverages',
      'Child discount 10%',
      'Rebooking with a fee and fare difference',
      'Refund available at a fee',
    ],
  },
  {
    name: 'Economy Basic',
    price: 425,
    active: false,
    perks: [
      'Cabin baggage 7kg',
      'Check-in baggage 25kg',
      'Complimentary snacks / meals & beverages',
      'Child discount 15%',
      'Complimentary rebooking with fare difference',
      'Free standard seat selection',
    ],
  },
  {
    name: 'Economy Flex',
    price: 550,
    active: true,
    perks: [
      'Cabin baggage 7kg',
      'Check-in baggage 30kg',
      'Complimentary snacks / meals & beverages',
      'Child discount 25%',
      'Unlimited rebooking with fare difference',
      'Free standard seat selection',
      'Priority check-in, boarding & baggage',
    ],
  },
];

export const FareSelection: React.FC<FareSelectionProps> = ({ fares = defaultFares }) => (
  <section className="mb-8 grid gap-4 lg:grid-cols-3">
    {fares.map((fare) => (
      <article
        key={fare.name}
        className={`rounded-lg border bg-white p-5 ${fare.active ? 'border-[#073b70] ring-4 ring-blue-100' : 'border-slate-300'}`}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#073b70]">{fare.name}</h3>
            {fare.active && <p className="text-[10px] font-semibold uppercase text-blue-600">Recommended</p>}
          </div>
          <span className={`h-5 w-5 rounded-full border ${fare.active ? 'border-[#073b70] bg-[#073b70]' : 'border-slate-300'}`} />
        </div>
        <p className="mb-5 text-2xl font-semibold text-[#073b70]">THB {fare.price.toFixed(2)}</p>
        <ul className="space-y-4 text-sm font-semibold text-slate-600">
          {fare.perks.map((perk) => (
            <li key={perk}>□ {perk}</li>
          ))}
        </ul>
      </article>
    ))}
  </section>
);

export default FareSelection;