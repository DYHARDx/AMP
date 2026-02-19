import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { login, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/portal', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('invalid-credential') || message.includes('wrong-password')) {
        setError('Invalid email or password.');
      } else if (message.includes('too-many-requests')) {
        setError('Too many attempts. Try again later.');
      } else {
        setError('Login failed. Check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Blobs */}
      <div className="blob blob-indigo w-96 h-96 -top-20 -left-20" />
      <div className="blob blob-pink w-80 h-80 bottom-0 right-0" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in-up">
        <div className="glass-panel rounded-2xl p-8 neon-border-indigo">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="AMP Logo" className="w-16 h-16 mb-4 object-contain drop-shadow-lg" />
            <h1 className="font-outfit font-black text-2xl gradient-text mb-1">AMP Mediaz</h1>
            <p className="text-muted-foreground text-sm">
              {role === 'admin' ? '⚡ Admin Access Portal' : role === 'affiliate' ? '🔗 Affiliate Login' : 'Intelligence Platform'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@amp-mediaz.com"
                required
                className="w-full px-4 py-3 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none focus:ring-1 focus:ring-neon-indigo/30 transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none focus:ring-1 focus:ring-neon-indigo/30 transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-solid-indigo w-full justify-center text-base py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Access Platform'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground">
              Need access?{' '}
              <span className="text-neon-indigo hover:underline cursor-pointer">Contact your administrator</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by AMP Mediaz Security • All access is logged
        </p>
      </div>
    </div>
  );
}
