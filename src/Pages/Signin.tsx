import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth, type User } from '../contexts/useAuth';
import { api } from '../Services/api';

const ArrowLeftIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const LineIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#06c755" d="M19.7 3.5H4.3C2.5 3.5 1 5 1 6.8v7.9C1 16.5 2.5 18 4.3 18h5.1l-.8 2.8c-.1.4.3.7.6.5l5-3.3h5.5c1.8 0 3.3-1.5 3.3-3.3V6.8c0-1.8-1.5-3.3-3.3-3.3Z" />
    <path fill="#fff" d="M5.5 8h1.1v4H9v1H5.5V8Zm4.1 0h1.1v5H9.6V8Zm2 0h1l2.1 3.1V8h1.1v5h-1l-2.1-3.1V13h-1.1V8Zm5.1 0h3.5v1h-2.4v1h2.1v1h-2.1v1h2.5v1h-3.6V8Z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285f4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.2 3-7.2Z" />
    <path fill="#34a853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.7 19.7 8.1 22 12 22Z" />
    <path fill="#fbbc05" d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.4l3.3-2.6Z" />
    <path fill="#ea4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 3 14.7 2 12 2 8.1 2 4.7 4.3 3.1 7.6l3.3 2.6c.8-2.3 3-4.1 5.6-4.1Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877f2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" />
    <path fill="#fff" d="m16.7 15.5.5-3.5h-3.4V9.8c0-1 .5-1.9 2-1.9h1.5v-3s-1.4-.2-2.7-.2c-2.7 0-4.5 1.7-4.5 4.7V12h-3v3.5h3v8.4a12.1 12.1 0 0 0 3.7 0v-8.4h2.9Z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.7 12.3c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8s-1.8-.8-2.9-.8c-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 7 1.1 9.2.8 1.1 1.7 2.4 2.9 2.3 1.1-.1 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.2-2.5 1.2-2.6-.1-.1-2.8-1.1-2.8-3.7zM14.5 5.7c.6-.8 1.1-1.8 1-2.9-1 .1-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3z" />
  </svg>
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const startFacebookLogin = () => {
  window.location.href = `${API_BASE_URL.replace(/\/$/, '')}/auth/facebook`;
};

const startGoogleLogin = () => {
  window.location.href = `${API_BASE_URL.replace(/\/$/, '')}/auth/google`;
};

const startLineLogin = () => {
  window.location.href = `${API_BASE_URL.replace(/\/$/, '')}/auth/line`;
};

function Signin(): React.JSX.Element {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login({ email_address: emailAddress, password }) as unknown as { token: string; user: User };
      login(data.token, data.user);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative flex min-h-[520px] flex-col justify-end overflow-hidden bg-[#063b70] px-8 py-12 text-white sm:px-16 lg:min-h-screen lg:px-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1800&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-[#063b70]/70" />

        <div className="relative z-10 max-w-xl">
          <Link to="/" className="mb-16 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-white/95 transition hover:text-amber-300">
            <ArrowLeftIcon />
            Back to website
          </Link>

          <h1 className="max-w-md text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Welcome back to the skies.
          </h1>
          <p className="mt-8 max-w-lg text-xl leading-8 text-sky-100/95">
            Experience the pinnacle of aviation with Horizon Elite. Access your exclusive benefits and manage your journey with effortless precision.
          </p>

          <div className="mt-24 border-t border-white/20 pt-10">
            <p className="text-3xl font-semibold text-amber-300">Horizon Elite</p>
            <p className="mt-2 text-xs font-extrabold uppercase tracking-[.28em] text-sky-100/70">
              Global excellence in aviation
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-8 py-14 sm:px-12">
        <div className="w-full max-w-[490px]">
          <h2 className="text-5xl font-semibold tracking-normal text-[#063b70]">Sign In</h2>
          <p className="mt-4 text-lg text-slate-600">Continue your journey with your KrisFlyer account.</p>

          {error && (
            <div className="mt-6 rounded bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-7">
            <label className="block">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-[#063b70]">Email Address<span className="text-red-500">*</span></span>
              <input
                type="email"
                required
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="jane.doe@example.com"
                className="h-14 w-full rounded border border-slate-300 bg-slate-50 px-5 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-[#063b70]">Password<span className="text-red-500">*</span></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="h-14 w-full rounded border border-slate-300 bg-slate-50 px-5 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
              />
            </label>

            <label className="flex items-center gap-3 text-base text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-[#063b70]" />
              Remember me for future travels
            </label>

            <button disabled={loading} type="submit" className="h-16 w-full rounded bg-[#063b70] text-base font-semibold text-white transition hover:bg-[#052f59] disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In to My Account'}
            </button>
          </form>

          <div className="my-16 flex items-center gap-5">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-center text-xs font-semibold uppercase leading-4 tracking-widest text-slate-500">
              Or
              <br />
              Connect
              <br />
              With
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-4">
            {[
              { label: 'Continue with Line', icon: <LineIcon key="line" />, onClick: startLineLogin },
              { label: 'Continue with Google', icon: <GoogleIcon key="google" />, onClick: startGoogleLogin },
              { label: 'Continue with Facebook', icon: <FacebookIcon key="facebook" />, onClick: startFacebookLogin },
              { label: 'Continue with Apple', icon: <AppleIcon key="apple" /> },
            ].map((item) => (
              <button key={item.label} type="button" onClick={item.onClick} className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-700 transition hover:border-blue-500 hover:text-[#063b70]">
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <p className="mt-10 text-center text-base text-slate-600">
            New to Horizon Elite?{' '}
            <Link to="/signup" className="font-semibold text-[#063b70] underline underline-offset-2">
              Sign Up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Signin;
