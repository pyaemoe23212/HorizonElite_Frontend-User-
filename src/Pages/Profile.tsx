import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  'Personal Details',
  'Contact',
  'Documents',
  'Emergency',
  'Travel Preferences',
  'Loyalty',
  'Passengers',
  'Payment',
  'Security',
];

const EditLink = () => (
  <button type="button" className="text-xs font-bold uppercase text-slate-500 transition hover:text-[#073b70]">
    Edit
  </button>
);

const TextInput = ({ value = '', placeholder = '' }: { value?: string; placeholder?: string }) => (
  <input
    defaultValue={value}
    placeholder={placeholder}
    className="h-11 w-full rounded-none border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#073b70]"
  />
);

const SelectInput = ({ children }: { children: React.ReactNode }) => (
  <select className="h-11 w-full rounded-none border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#073b70]">
    {children}
  </select>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{children}</span>
  </label>
);

const Section = ({ title, children, action = 'Save Changes' }: { title: string; children: React.ReactNode; action?: string }) => (
  <section className="border border-slate-300 bg-white p-7 shadow-sm">
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-2xl font-black text-[#073b70]">{title}</h2>
      <EditLink />
    </div>
    {children}
    <div className="mt-7 flex justify-end">
      <button type="button" className="h-11 bg-[#073b70] px-8 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#052f59]">
        {action}
      </button>
    </div>
  </section>
);

const MenuIcon = () => (
  <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-slate-200 text-[10px] text-slate-500">◆</span>
);

function Profile(): React.JSX.Element {
  const { user } = useAuth();
  const fullName = user ? `${user.title ? user.title + ' ' : ''}${user.first_name} ${user.last_name}` : '';
  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-center px-6">
          <Link to="/" className="text-2xl font-black tracking-wide text-[#073b70]">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="bg-[#073b70] p-12 text-white">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-lg border-4 border-amber-300 bg-white shadow">
                <svg className="h-20 w-20 text-blue-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm8 9a8 8 0 1 0-16 0h16Z" />
                </svg>
                <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-xs text-[#073b70]">✎</span>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-normal">{fullName}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-amber-300 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#073b70]">Platinum Elite</span>
                  <span className="font-bold">842,500 <span className="text-white/45">Points</span></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-white/20 md:border-l md:pl-10">
              <button type="button" className="h-11 border border-white bg-white px-8 text-xs font-black uppercase text-[#073b70]">Redeem Points</button>
              <button type="button" className="h-11 border border-amber-300 px-8 text-xs font-black uppercase text-amber-200">Elite Benefits</button>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="h-fit border border-slate-300 bg-white">
            {menuItems.map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                className={`flex h-14 items-center gap-3 border-b border-slate-200 px-6 text-xs font-black uppercase tracking-wide ${
                  index === 0 ? 'bg-stone-50 text-[#073b70]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MenuIcon />
                {item}
              </a>
            ))}
          </aside>

          <div className="space-y-8">
            <Section title="Personal Details">
              <div className="grid gap-5 md:grid-cols-4">
                <Label>Title *<SelectInput><option>{user?.title || 'Mr.'}</option></SelectInput></Label>
                <Label>First Name *<TextInput value={user?.first_name || ''} /></Label>
                <Label>Middle Name<TextInput /></Label>
                <Label>Last Name *<TextInput value={user?.last_name || ''} /></Label>
                <Label>Date of Birth *<TextInput value="09/14/1982" /></Label>
                <Label>Gender *<SelectInput><option>Male</option></SelectInput></Label>
                <Label>Nationality *<SelectInput><option>British</option></SelectInput></Label>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Label>Email Address *<TextInput value={user?.email_address || ''} /></Label>
                <Label>Phone Number *<div className="grid grid-cols-[90px_1fr] gap-3"><SelectInput><option>🇺🇸</option></SelectInput><TextInput value={user?.phone_number || ''} /></div></Label>
              </div>
              <div className="mt-5">
                <Label>Residential Address<textarea placeholder="Full residential address" className="h-24 w-full border border-slate-300 px-3 py-3 text-sm outline-none focus:border-[#073b70]" /></Label>
              </div>
            </Section>

            <Section title="Contact Information">
              <div className="grid gap-5">
                <Label>Email Address<TextInput value="a.sterling@horizon-elite.com" /></Label>
                <div className="grid gap-5 md:grid-cols-2">
                  <Label>Phone Number<div className="grid grid-cols-[90px_1fr] gap-3"><SelectInput><option>🇺🇸</option></SelectInput><TextInput value="7700 900 123" /></div></Label>
                  <Label>Phone Number<div className="grid grid-cols-[90px_1fr] gap-3"><SelectInput><option>🇺🇸</option></SelectInput><TextInput value="7700 900 123" /></div></Label>
                </div>
                <Label>Address<textarea placeholder="Full residential address" className="h-24 w-full border border-slate-300 px-3 py-3 text-sm outline-none focus:border-[#073b70]" /></Label>
              </div>
            </Section>

            <Section title="Passport Details" action="Save Documents">
              <div className="grid gap-5 md:grid-cols-2">
                <Label>Passport Number<TextInput value="**** **** 4582" /></Label>
                <Label>Passport Country<TextInput value="United Kingdom" /></Label>
                <Label>Passport Expiry Date<TextInput value="10/12/2029" /></Label>
                <Label>Upload Passport Photo<input type="file" className="h-11 w-full border border-dashed border-slate-400 bg-white px-3 py-2 text-sm text-slate-500" /></Label>
              </div>
              <div className="my-8 h-px bg-slate-300" />
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#073b70]">Visa Information</h2>
                <EditLink />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Label>Visa Number<TextInput value="**** **** 9901" /></Label>
                <Label>Visa Expiry Date<TextInput value="01/05/2026" /></Label>
              </div>
              <div className="mt-5">
                <Label>Upload Visa Document<input type="file" className="h-11 w-full border border-dashed border-slate-400 bg-white px-3 py-2 text-sm text-slate-500" /></Label>
              </div>
            </Section>

            <Section title="Emergency Contacts" action="Save Contacts">
              {[1, 2].map((item) => (
                <div key={item} className={item === 2 ? 'mt-8 border-t border-slate-300 pt-8' : ''}>
                  <p className="mb-4 text-sm font-black uppercase tracking-wide text-amber-300">Priority Contact {item}</p>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Label>Contact Name<TextInput /></Label>
                    <Label>Relationship<TextInput /></Label>
                    <Label>Phone Number<TextInput /></Label>
                    <Label>Email Address<TextInput /></Label>
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Travel Preferences" action="Save Preferences">
              <div className="grid gap-5 md:grid-cols-2">
                <Label>Known Traveler Number<TextInput value="Alphanumeric" /></Label>
                <Label>Redress Number<TextInput /></Label>
                <Label>Meal Preference<SelectInput><option>No Preference</option></SelectInput></Label>
                <Label>Seat Preference<SelectInput><option>No Preference</option></SelectInput></Label>
              </div>
              <div className="mt-5">
                <Label>Language Preference<SelectInput><option>English (UK)</option></SelectInput></Label>
              </div>
            </Section>

            <Section title="Loyalty & Membership" action="Sync Loyalty Data">
              <div className="mb-6 grid gap-5 bg-slate-100 p-5 md:grid-cols-2">
                <div><p className="text-[10px] font-black uppercase text-slate-500">Status</p><p className="text-xl font-black text-[#073b70]">Platinum Elite <span className="text-xs text-emerald-500">Verified</span></p></div>
                <div className="text-left md:text-right"><p className="text-[10px] font-black uppercase text-slate-500">Available Points</p><p className="text-xl font-black text-[#073b70]">842,500 <span className="text-xs text-slate-500">PTS</span></p></div>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <Label>Airline Partner<SelectInput><option>Horizon Connect</option></SelectInput></Label>
                <Label>Member ID<TextInput value="HE-984421-S" /></Label>
                <Label>Tier Level<SelectInput><option>Platinum</option></SelectInput></Label>
              </div>
            </Section>

            <Section title="Passenger Management" action="Save Passengers">
              <div className="mb-5 flex justify-end">
                <button type="button" className="text-xs font-black uppercase text-cyan-600">Add New Passenger</button>
              </div>
              {['Eleanor Sterling - Spouse', 'Oliver Sterling - Child'].map((person) => (
                <div key={person} className="mb-3 flex h-14 items-center justify-between border border-slate-200 px-4 text-sm font-bold text-[#073b70]">
                  {person}
                  <span className="text-slate-400">✎</span>
                </div>
              ))}
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Label>Passenger Full Name<TextInput value="Eleanor Sterling" /></Label>
                <Label>Relationship to User<TextInput value="Spouse" /></Label>
                <Label>Passenger Date of Birth<TextInput value="04/22/1985" /></Label>
                <Label>Passenger Passport Number<TextInput value="**** **** 1122" /></Label>
              </div>
            </Section>

            <Section title="Payment Method" action="Save Payment Method">
              <div className="mb-6 space-y-4">
                {['American Express  •••• •••• •••• 8007  ALISTAIR STERLING  12/28', 'Visa  •••• •••• •••• 4582  ALISTAIR STERLING  05/26'].map((card) => (
                  <div key={card} className="border-b border-slate-200 pb-3 text-sm font-bold text-slate-700">{card}</div>
                ))}
              </div>
              <div className="grid gap-5">
                <Label>Card Number<TextInput value="0000 0000 0000 0000" /></Label>
                <div className="grid gap-5 md:grid-cols-[1fr_160px_110px]">
                  <Label>Cardholder Name<TextInput value="Alistair Sterling" /></Label>
                  <Label>Expiry Date<TextInput placeholder="MM/YY" /></Label>
                  <Label>CVV<TextInput value="123" /></Label>
                </div>
                <label className="flex items-center gap-3 text-sm text-slate-600"><input type="checkbox" className="accent-[#073b70]" />Billing address is same as contact address</label>
              </div>
            </Section>

            <section className="border border-slate-300 bg-white p-7 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#073b70]">Security & Account</h2>
                <button type="button" className="text-xs font-bold uppercase text-slate-500">Manage</button>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <p className="mb-4 text-xs font-black uppercase text-[#073b70]">Change Password</p>
                  <div className="space-y-4">
                    <Label>Current Password *<TextInput placeholder="Required to save changes" /></Label>
                    <Label>New Password *<TextInput placeholder="Minimum 12 characters" /></Label>
                    <button type="button" className="h-10 w-full bg-[#073b70] text-xs font-black uppercase text-white">Update Password</button>
                  </div>
                </div>
                <div className="border-l-0 border-slate-300 md:border-l md:pl-8">
                  <p className="mb-4 text-xs font-black uppercase text-[#073b70]">Security Settings</p>
                  <div className="flex items-center justify-between border border-slate-300 p-4">
                    <span className="text-sm font-black text-slate-700">Two-Factor Authentication</span>
                    <span className="h-5 w-10 rounded-full bg-[#073b70]" />
                  </div>
                  <dl className="mt-8 grid grid-cols-2 gap-y-2 text-[11px] uppercase text-slate-500">
                    <dt>Account Status:</dt><dd className="text-right font-black text-cyan-600">Active</dd>
                    <dt>Profile Created:</dt><dd className="text-right">Sept 12, 2021</dd>
                    <dt>Last Modified:</dt><dd className="text-right">Oct 24, 2023, 14:22 GMT</dd>
                  </dl>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-end gap-10 py-6">
              <button type="button" className="text-xs font-black uppercase tracking-widest text-slate-400">Discard Changes</button>
              <button type="button" className="h-12 bg-[#073b70] px-10 text-xs font-black uppercase tracking-wide text-white">Complete Profile Setup</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
