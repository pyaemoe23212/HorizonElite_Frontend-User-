import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth, type User } from '../contexts/AuthContext';

const decodeRedirectUser = (value: string): User => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
  return JSON.parse(window.atob(padded)) as User;
};

function SocialAuthCallback(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const authError = searchParams.get('error');

    if (authError) {
      setError(authError);
      return;
    }

    if (!token || !userParam) {
      setError('Facebook login did not return a valid session.');
      return;
    }

    try {
      const user = decodeRedirectUser(userParam);
      login(token, user);
      navigate('/', { replace: true });
    } catch {
      setError('Could not complete Facebook login.');
    }
  }, [login, navigate, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-md rounded border border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-black text-[#063b70]">
          {error ? 'Facebook Login Failed' : 'Signing you in...'}
        </h1>
        <p className="mt-4 text-sm font-semibold text-slate-600">
          {error || 'Please wait while we complete your Facebook login.'}
        </p>
        {error && (
          <Link to="/signin" className="mt-6 inline-flex h-11 items-center justify-center rounded bg-[#063b70] px-6 text-sm font-black text-white">
            Back to Sign In
          </Link>
        )}
      </section>
    </main>
  );
}

export default SocialAuthCallback;
