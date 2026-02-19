import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { Database, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface TrackingLink {
  id: string;
  name: string;
  clicks: number;
  conversions: number;
}

export default function DataRecovery() {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [selected, setSelected] = useState('');
  const [clicks, setClicks] = useState('');
  const [conversions, setConversions] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, 'links'));
      setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() } as TrackingLink)));
      setLoading(false);
    };
    fetch();
  }, []);

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return setError('Select a link first');
    setError('');
    setApplying(true);
    try {
      const clickDelta = Number(clicks) || 0;
      const convDelta = Number(conversions) || 0;
      await updateDoc(doc(db, 'links', selected), {
        clicks: increment(clickDelta),
        conversions: increment(convDelta),
      });
      setSuccess(true);
      setLinks(prev => prev.map(l => l.id === selected
        ? { ...l, clicks: l.clicks + clickDelta, conversions: l.conversions + convDelta }
        : l
      ));
      setTimeout(() => setSuccess(false), 3000);
      setClicks('');
      setConversions('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to inject data');
    }
    setApplying(false);
  };

  const selectedLink = links.find(l => l.id === selected);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-outfit font-bold text-2xl flex items-center gap-2">
          <Database className="w-6 h-6 text-neon-pink" />
          Data Recovery Wizard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manually inject or restore clicks and conversions to match a snapshot</p>
      </div>

      <div className="glass-panel rounded-xl border border-border p-6 neon-border-pink">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-neon-pink/5 border border-neon-pink/20 mb-6">
          <AlertCircle className="w-4 h-4 text-neon-pink shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This wizard injects delta values (positive or negative) into a link's stats. Use it to restore data from a snapshot or correct discrepancies. Values are incremented — to set absolute values, calculate the delta.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm">
            <Check className="w-4 h-4 shrink-0" />Data injected successfully!
          </div>
        )}

        <form onSubmit={apply} className="space-y-4">
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">Select Tracking Link</label>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-pink/50 focus:outline-none transition-all"
            >
              <option value="">Choose a link...</option>
              {links.map(l => <option key={l.id} value={l.id}>{l.name} (Clicks: {l.clicks}, Conv: {l.conversions})</option>)}
            </select>
          </div>

          {selectedLink && (
            <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-muted/30 border border-border/40">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Current Clicks</div>
                <div className="font-outfit font-bold text-xl neon-text-indigo">{selectedLink.clicks}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Current Conv.</div>
                <div className="font-outfit font-bold text-xl neon-text-pink">{selectedLink.conversions}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">CR%</div>
                <div className="font-outfit font-bold text-xl text-neon-cyan">
                  {selectedLink.clicks > 0 ? ((selectedLink.conversions / selectedLink.clicks) * 100).toFixed(1) : '0.0'}%
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">Inject Clicks (Δ)</label>
              <input
                type="number"
                value={clicks}
                onChange={e => setClicks(e.target.value)}
                placeholder="e.g. +500 or -100"
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">Inject Conversions (Δ)</label>
              <input
                type="number"
                value={conversions}
                onChange={e => setConversions(e.target.value)}
                placeholder="e.g. +25 or -5"
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button type="submit" disabled={applying || !selected} className="btn-neon-pink w-full justify-center">
            {applying ? (
              <><RefreshCw className="w-4 h-4 animate-spin" />Injecting...</>
            ) : (
              <><Database className="w-4 h-4" />Apply Recovery Snapshot</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
