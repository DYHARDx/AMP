import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { Users, Link2, MousePointerClick, TrendingUp, Activity, Clock } from 'lucide-react';

interface DailyStat {
  date: string;
  clicks: number;
  conversions: number;
  cr: number;
}

interface LinkStat {
  id: string;
  name: string;
  clicks: number;
  conversions: number;
  affiliate?: string;
}

export default function Intelligence() {
  const { profile } = useAuth();
  const [affiliateCount, setAffiliateCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topLinks, setTopLinks] = useState<LinkStat[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Affiliates
        const affSnap = await getDocs(query(collection(db, 'users')));
        const affiliates = affSnap.docs.filter(d => d.data().role === 'affiliate');
        setAffiliateCount(affiliates.length);

        // Links
        const linksSnap = await getDocs(collection(db, 'links'));
        const links = linksSnap.docs.map(d => ({ id: d.id, ...d.data() } as LinkStat));
        setLinkCount(links.length);

        let clicks = 0, convs = 0;
        links.forEach(l => {
          clicks += l.clicks || 0;
          convs += l.conversions || 0;
        });
        setTotalClicks(clicks);
        setTotalConversions(convs);
        setTopLinks(links.sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5));

        // Daily stats
        try {
          const daysSnap = await getDocs(
            query(collection(db, 'analytics', 'daily_stats', 'days'), orderBy('date', 'desc'), limit(7))
          );
          const days: DailyStat[] = daysSnap.docs.map(d => {
            const data = d.data();
            const cr = data.clicks > 0 ? ((data.conversions / data.clicks) * 100).toFixed(1) : 0;
            return { date: d.id, clicks: data.clicks || 0, conversions: data.conversions || 0, cr: Number(cr) };
          });
          setDailyStats(days);
        } catch {
          // no daily stats yet
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Affiliates', value: affiliateCount, icon: Users, color: 'indigo', suffix: '' },
    { label: 'Tracking Links', value: linkCount, icon: Link2, color: 'pink', suffix: '' },
    { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'cyan', suffix: '' },
    { label: 'Global Conversions', value: totalConversions.toLocaleString(), icon: TrendingUp, color: 'indigo', suffix: '' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-2xl text-foreground">
            {getGreeting()}, <span className="gradient-text">{profile?.name || 'Operator'}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Here's your intelligence overview.</p>
        </div>
        <div className="flex items-center gap-2 glass-panel rounded-full px-4 py-2">
          <span className="pulse-dot" />
          <span className="text-xs font-semibold text-neon-indigo tracking-wider">LIVE MONITORING</span>
          <Activity className="w-3.5 h-3.5 text-neon-indigo" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.label} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                card.color === 'indigo' ? 'bg-neon-indigo/10' : card.color === 'pink' ? 'bg-neon-pink/10' : 'bg-neon-cyan/10'
              }`}>
                <card.icon className={`w-4 h-4 ${
                  card.color === 'indigo' ? 'text-neon-indigo' : card.color === 'pink' ? 'text-neon-pink' : 'text-neon-cyan'
                }`} />
              </div>
            </div>
            <div className={`font-outfit font-black text-2xl mb-0.5 ${
              card.color === 'indigo' ? 'neon-text-indigo' : card.color === 'pink' ? 'neon-text-pink' : 'text-neon-cyan'
            }`}>
              {card.value}{card.suffix}
            </div>
            <div className="text-xs text-muted-foreground font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Breakdown */}
      <div className="glass-panel rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h2 className="font-outfit font-bold text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-indigo" />
            Daily Breakdown
          </h2>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
        <div className="overflow-x-auto">
          {dailyStats.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No daily stats yet. Traffic data will appear once links receive clicks.
            </div>
          ) : (
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clicks</th>
                  <th>Conversions</th>
                  <th>CR%</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.map((row) => (
                  <tr key={row.date}>
                    <td className="font-mono text-xs">{row.date}</td>
                    <td className="font-semibold">{row.clicks.toLocaleString()}</td>
                    <td className="font-semibold">{row.conversions.toLocaleString()}</td>
                    <td>
                      <span className={`font-mono font-bold ${
                        row.cr >= 5 ? 'text-neon-indigo' : row.cr >= 2 ? 'text-neon-cyan' : 'text-muted-foreground'
                      }`}>
                        {row.cr}%
                      </span>
                    </td>
                    <td>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-neon-indigo to-neon-pink"
                          style={{ width: `${Math.min(row.cr * 10, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top Links */}
      <div className="glass-panel rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h2 className="font-outfit font-bold text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-pink" />
            Performance Snapshot
          </h2>
          <span className="status-live"><span className="w-1.5 h-1.5 rounded-full bg-current" />Live</span>
        </div>
        <div className="overflow-x-auto">
          {topLinks.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No tracking links created yet.
            </div>
          ) : (
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Link Name</th>
                  <th>Clicks</th>
                  <th>Conversions</th>
                  <th>CR%</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map((link) => {
                  const cr = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={link.id}>
                      <td className="font-semibold text-foreground">{link.name}</td>
                      <td>{(link.clicks || 0).toLocaleString()}</td>
                      <td>{(link.conversions || 0).toLocaleString()}</td>
                      <td>
                        <span className="font-mono font-bold neon-text-indigo">{cr}%</span>
                      </td>
                      <td><span className="status-live"><span className="w-1.5 h-1.5 rounded-full bg-current" />Live</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
