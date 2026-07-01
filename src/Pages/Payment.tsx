import React, { useState } from 'react';
import { BadgeCheck, Plane } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

type PaymentMethod = 'card' | 'qr' | 'banking' | 'wallet';

const steps = ['Flight', 'Passenger', 'Service', 'Payment', 'Additional Services', 'Personalized'];

const methods: Array<{ id: PaymentMethod; title: string; subtitle: string; icon: string }> = [
  { id: 'card', title: 'Credit / Debit Card', subtitle: 'Mastercard / Visa', icon: 'CARD' },
  { id: 'qr', title: 'Thai QR / PromptPay', subtitle: 'Scan with banking app', icon: 'QR' },
  { id: 'banking', title: 'Mobile Banking', subtitle: 'Pay through bank apps', icon: 'BANK' },
  { id: 'wallet', title: 'eWallet', subtitle: 'Supported wallets', icon: 'WALLET' },
];

const inputClass = 'h-14 w-full rounded border border-slate-300 bg-white px-5 text-lg text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#073b70]';

const Stepper = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-6 items-start gap-2 px-4 py-10">
    {steps.map((step, index) => {
      const complete = index < 3;
      const active = index === 3;
      return (
        <div key={step} className="relative flex flex-col items-center gap-2 text-center">
          {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
          <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${complete ? 'border-blue-600 bg-blue-600 text-white' : active ? 'border-amber-400 bg-[#073b70] text-white' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
            {complete ? <BadgeCheck size={18} /> : index + 1}
          </span>
          <span className={`text-[10px] font-black uppercase ${complete || active ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
        </div>
      );
    })}
  </div>
);

const TripSummary = ({ method, isProcessing, onPay }: { method: PaymentMethod; isProcessing: boolean; onPay: () => void }) => (
  <aside className="h-fit border border-slate-300 bg-white p-8 shadow-md">
    <h2 className="text-3xl font-black text-[#073b70]">Trip Summary</h2>
    <div className="my-7 h-px bg-slate-200" />
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <div>
        <p className="text-xl font-black text-[#073b70]">BKK</p>
        <p className="text-[10px] font-black uppercase text-slate-500">Bangkok</p>
      </div>
      <div className="text-center text-amber-500">
        <Plane className="mx-auto" size={24} />
        <div className="mt-2 h-px w-24 bg-slate-300" />
        <p className="mt-2 text-[10px] font-black uppercase text-slate-500">Non-stop</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-black text-[#073b70]">SIN</p>
        <p className="text-[10px] font-black uppercase text-slate-500">Singapore</p>
      </div>
    </div>
    <div className="mt-10 space-y-4 text-base font-semibold text-slate-600">
      <div className="flex justify-between"><span>Flight (1 Adult)</span><span className="font-black text-[#073b70]">THB 16,400</span></div>
      <div className="flex justify-between"><span>Taxes & Fees</span><span className="font-black text-[#073b70]">THB 3,525</span></div>
      <div className="flex justify-between pt-3 text-xl"><span>Total Amount</span><span className="text-[#073b70]">THB 19,925</span></div>
    </div>
    <button
      type="button"
      onClick={onPay}
      disabled={isProcessing}
      className="mt-9 flex h-16 w-full items-center justify-center rounded bg-[#073b70] text-base font-black text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-500"
    >
      {isProcessing ? 'Processing Payment...' : method === 'qr' ? 'Complete QR Payment' : 'Pay THB 19,925'}
    </button>
    {isProcessing && <p className="mt-4 text-center text-xs font-black uppercase tracking-widest text-cyan-700">Mock payment approved</p>}
    <div className="mt-7 text-center text-xs font-black uppercase tracking-widest text-slate-400">SSL 256-bit encrypted</div>
  </aside>
);

const CardPanel = () => (
  <section>
    <h1 className="text-3xl font-black text-[#073b70]">Credit / Debit Card</h1>
    <p className="mt-3 text-base font-semibold text-slate-600">Enter your card details for secure payment processing.</p>
    <div className="mt-8 flex items-center gap-8">
      <div className="flex items-center">
        <span className="h-10 w-10 rounded-full bg-red-500" />
        <span className="-ml-4 h-10 w-10 rounded-full bg-amber-400 opacity-90" />
      </div>
      <p className="text-4xl font-black italic text-[#173f8a]">VISA</p>
    </div>
    <div className="my-9 h-px bg-slate-200" />
    <form className="space-y-8">
      <label className="block">
        <span className="mb-3 block text-xs font-black uppercase tracking-widest text-[#073b70]">Card Number</span>
        <input className={inputClass} placeholder="0000 0000 0000 0000" />
      </label>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="mb-3 block text-xs font-black uppercase tracking-widest text-[#073b70]">Expiry Date</span>
          <input className={inputClass} placeholder="MM/YY" />
        </label>
        <label className="block">
          <span className="mb-3 block text-xs font-black uppercase tracking-widest text-[#073b70]">CVV</span>
          <input className={inputClass} placeholder="123" />
        </label>
      </div>
      <label className="block">
        <span className="mb-3 block text-xs font-black uppercase tracking-widest text-[#073b70]">Cardholder's Full Name</span>
        <input className={inputClass} placeholder="As shown on card" />
      </label>
      <label className="flex items-start gap-4 text-base font-semibold text-slate-600">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-[#073b70]" />
        <span>I agree to the <a href="#" className="font-black text-[#073b70]">Terms & Conditions</a> and confirm that I am authorized to use this payment method.</span>
      </label>
    </form>
  </section>
);

const QrPanel = () => (
  <section>
    <h1 className="text-3xl font-black text-[#073b70]">Thai QR / PromptPay</h1>
    <p className="mt-3 text-base font-semibold text-slate-600">Scan this QR code using your Thai mobile banking app.</p>
    <div className="mt-6 border border-dashed border-slate-500 bg-slate-50 p-10 text-center">
      <div className="mx-auto w-64 bg-white p-8">
        <p className="mb-4 inline-block border border-[#073b70] px-3 text-sm font-black text-[#073b70]">PromptPay</p>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 49 }).map((_, index) => (
            <span key={index} className={`h-5 w-5 ${index % 3 === 0 || index % 7 === 0 || index % 11 === 0 ? 'bg-black' : 'bg-white'}`} />
          ))}
        </div>
      </div>
      <p className="mt-8 text-3xl font-black text-slate-900">THB 19,925</p>
      <p className="mt-4 text-base font-black text-red-600">QR code expires in 10:00</p>
    </div>
    <p className="mt-8 text-center text-sm font-semibold text-slate-600">Once scanned, the payment will be processed immediately. Do not close this page.</p>
    <div className="mt-8 border border-slate-300 bg-white p-5 text-center text-sm font-semibold text-slate-600">Your transaction is encrypted and secured by Horizon Elite's enterprise-grade safety protocols.</div>
  </section>
);

const BankingPanel = () => (
  <section>
    <h1 className="text-3xl font-black text-[#073b70]">Mobile Banking</h1>
    <p className="mt-3 text-base font-semibold text-slate-600">Choose your bank</p>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {['K PLUS', 'SCB Easy', 'Krungthai NEXT', 'Bangkok Bank'].map((bank, index) => (
        <button key={bank} className={`flex h-24 items-center gap-5 rounded-lg border p-6 text-left ${index === 0 ? 'border-[#073b70] bg-blue-50' : 'border-slate-300 bg-white'}`}>
          <span className={`flex h-12 w-12 items-center justify-center text-lg font-black text-white ${index === 0 ? 'bg-emerald-600' : index === 1 ? 'bg-purple-700' : index === 2 ? 'bg-sky-500' : 'bg-blue-900'}`}>{bank.slice(0, 2)}</span>
          <span className="text-lg font-black text-[#073b70]">{bank}</span>
        </button>
      ))}
    </div>
    <div className="mt-8 border-l-4 border-amber-300 bg-slate-100 p-6 text-base font-semibold leading-7 text-slate-600">
      You will be redirected to your selected bank's secure payment page to complete payment. Please ensure your mobile banking app is installed and ready on your device.
    </div>
  </section>
);

const WalletPanel = () => (
  <section>
    <h1 className="text-3xl font-black text-[#073b70]">eWallet</h1>
    <p className="mt-3 text-base font-semibold text-slate-600">Choose your wallet</p>
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {['TrueMoney Wallet', 'Line Pay'].map((wallet, index) => (
        <button key={wallet} className={`flex h-36 flex-col items-center justify-center rounded border bg-white p-6 ${index === 0 ? 'border-[#073b70] ring-1 ring-[#073b70]' : 'border-slate-300'}`}>
          <span className={`text-4xl font-black ${index === 0 ? 'text-orange-500' : 'text-green-600'}`}>{index === 0 ? 'W' : 'LINE'}</span>
          <span className="mt-4 text-sm font-black uppercase tracking-wide text-slate-700">{wallet}</span>
        </button>
      ))}
    </div>
    <div className="mt-10 border-l-4 border-cyan-600 bg-slate-100 p-6 text-base font-semibold leading-7 text-slate-600">
      You will be redirected to your selected wallet to complete payment. Please ensure you have sufficient balance before proceeding.
    </div>
  </section>
);

const panels: Record<PaymentMethod, React.ReactNode> = {
  card: <CardPanel />,
  qr: <QrPanel />,
  banking: <BankingPanel />,
  wallet: <WalletPanel />,
};

function Payment(): React.JSX.Element {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleMockPayment = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    window.setTimeout(() => {
      navigate('/booking-confirmed');
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-slate-100 pt-10 text-center">
        <Link to="/" className="text-4xl font-black tracking-wide text-[#073b70]">HORIZON<span className="text-amber-500">ELITE</span></Link>
      </header>
      <Stepper />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-28 lg:grid-cols-[310px_1fr_310px]">
        <aside>
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-600">Payment Methods</h2>
          <div className="space-y-4">
            {methods.map((item) => (
              <button key={item.id} onClick={() => setMethod(item.id)} className={`flex min-h-20 w-full items-center gap-4 rounded border bg-white p-5 text-left transition ${method === item.id ? 'border-l-4 border-l-amber-300 border-slate-200 shadow-sm' : 'border-slate-300 hover:border-[#073b70]'}`}>
                <span className="w-12 text-center text-xs font-black text-[#073b70]">{item.icon}</span>
                <span>
                  <span className="block text-lg font-semibold text-slate-700">{item.title}</span>
                  <span className="text-xs font-semibold text-slate-500">{item.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="border-t-8 border-[#073b70] bg-white p-10 shadow-md">
          {panels[method]}
        </section>

        <TripSummary method={method} isProcessing={isProcessing} onPay={handleMockPayment} />
      </div>

      <footer className="pb-10 text-center text-xs font-semibold text-slate-400">© 2024 Horizon Elite Airways. All data transmitted is encrypted using the highest industry standards.</footer>
    </main>
  );
}

export default Payment;
