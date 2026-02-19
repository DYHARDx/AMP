import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Link2, MousePointerClick, TrendingUp, Copy, Check, LogOut } from 'lucide-react';

interface TrackingLink {
  id: string;
  name: string;
  alias?: string;
  originalUrl: string;
  clicks: number;
  conversions: number;
}

const BASE_URL = window.location.origin;

export default function Portal() {
  const { profile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [fetching, setFetching] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'affiliate')) {
      navigate('/login', { replace: true });
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile?.email) return;
    const fetch = async () => {
      const snap = await getDocs(query(collection(db, 'links'), where('affiliateEmail', '==', profile.email)));
      setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() } as TrackingLink)));
      setFetching(false);
    };
    fetch();
  }, [profile]);

  const copyLink = (link: TrackingLink) => {
    const id = link.alias || link.id;
    navigator.clipboard.writeText(`${BASE_URL}/r/${id}`);
    setCopied(link.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
  const totalConversions = links.reduce((s, l) => s + (l.conversions || 0), 0);
  const cr = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="blob blob-indigo w-80 h-80 top-0 right-0 opacity-10" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/40 px-6 py-4 flex items-center justify-between glass-panel-light">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="AMP Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-outfit font-bold gradient-text">AMP Mediaz</span>
          <span className="text-xs text-muted-foreground">• Affiliate Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{profile?.name}</span>
          <button onClick={async () => { await logout(); navigate('/login'); }} className="btn-neon-indigo py-1.5 px-3 text-xs">
            <LogOut className="w-3.5 h-3.5" />Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="font-outfit font-bold text-2xl">Welcome back, <span className="gradient-text">{profile?.name}</span></h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your affiliate performance overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'My Links', value: links.length, icon: Link2, color: 'indigo' },
            { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'pink' },
            { label: 'Conversions', value: totalConversions.toLocaleString(), icon: TrendingUp, color: 'cyan' },
          ].map(card => (
            <div key={card.label} className="stat-card">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color === 'indigo' ? 'bg-neon-indigo/10' : card.color === 'pink' ? 'bg-neon-pink/10' : 'bg-neon-cyan/10'}`}>
                <card.icon className={`w-4 h-4 ${card.color === 'indigo' ? 'text-neon-indigo' : card.color === 'pink' ? 'text-neon-pink' : 'text-neon-cyan'}`} />
              </div>
              <div className={`font-outfit font-black text-2xl mb-0.5 ${card.color === 'indigo' ? 'neon-text-indigo' : card.color === 'pink' ? 'neon-text-pink' : 'text-neon-cyan'}`}>
                {card.value}
              </div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Links table */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60">
            <h2 className="font-outfit font-bold text-base flex items-center gap-2">
              <Link2 className="w-4 h-4 text-neon-indigo" />
              My Tracking Links
            </h2>
          </div>
          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No links assigned to you yet. Contact your administrator.
            </div>
          ) : (
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Link Name</th>
                  <th>Short URL</th>
                  <th>Clicks</th>
                  <th>Conversions</th>
                  <th>CR%</th>
                  <th>Copy</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => {
                  const cr = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={link.id}>
                      <td className="font-semibold">{link.name}</td>
                      <td className="font-mono text-xs text-neon-indigo">/r/{(link.alias || link.id).substring(0, 12)}</td>
                      <td>{(link.clicks || 0).toLocaleString()}</td>
                      <td>{(link.conversions || 0).toLocaleString()}</td>
                      <td><span className="font-mono font-bold neon-text-indigo">{cr}%</span></td>
                      <td>
                        <button onClick={() => copyLink(link)} className="p-1.5 rounded-lg text-neon-indigo hover:bg-neon-indigo/10 transition-colors">
                          {copied === link.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
