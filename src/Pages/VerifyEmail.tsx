import React from 'react';
import { Link, useSearchParams } from 'react-router';
import { api } from '../Services/api';

const verificationRequests = new Map<string, Promise<{ message: string }>>();

function VerifyEmail(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('Verifying your email...');

  React.useEffect(() => {
    let isActive = true;

    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification link is missing a token.');
        return;
      }

      try {
        const request = verificationRequests.get(token) || api.verifyEmailToken(token);
        verificationRequests.set(token, request);

        const response = await request;

        if (!isActive) return;

        setStatus('success');
        setMessage(response.message || 'Email verified successfully. You can now sign in.');
      } catch (error: unknown) {
        if (!isActive) return;

        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Email verification failed.');
      }
    };

    void verify();

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-md rounded border border-slate-300 bg-white p-8 text-center shadow-sm">
        <Link to="/" className="text-2xl font-semibold tracking-wide text-[#073b70]">
          HORIZON<span className="text-amber-500">ELITE</span>
        </Link>

        <div className={`mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-semibold ${
          status === 'success' ? 'bg-green-100 text-green-700' : status === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-[#073b70]'
        }`}>
          {status === 'success' ? 'OK' : status === 'error' ? '!' : '...'}
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-[#073b70]">
          {status === 'success' ? 'Email Verified' : status === 'error' ? 'Verification Failed' : 'Verifying Email'}
        </h1>

        <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
          {message}
        </p>

        <Link
          to={status === 'success' ? '/signin' : '/signup'}
          className="mt-8 flex h-12 items-center justify-center rounded bg-[#073b70] text-sm font-semibold text-white transition hover:bg-[#052f59]"
        >
          {status === 'success' ? 'Go to Sign In' : 'Back to Sign Up'}
        </Link>
      </section>
    </main>
  );
}

export default VerifyEmail;
