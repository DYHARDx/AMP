import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where
} from 'firebase/firestore';
import {
  Link2, Plus, Copy, Trash2, Edit2, X, Check, BarChart3, AlertCircle
} from 'lucide-react';

interface TrackingLink {
  id: string;
  name: string;
  alias?: string;
  originalUrl: string;
  affiliateEmail?: string;
  minCR: number;
  maxCR: number;
  targetConversions: number;
  targetClicks: number;
  clicks: number;
  conversions: number;
  createdAt?: string;
}

interface Affiliate { id: string; name: string; email: string; }

const BASE_URL = window.location.origin;

export default function LinkManagement() {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState<TrackingLink | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultForm = {
    name: '', alias: '', originalUrl: '', affiliateEmail: '',
    minCR: 2, maxCR: 8, targetConversions: 10, targetClicks: 200,
  };
  const [form, setForm] = useState(defaultForm);

  const fetchData = async () => {
    const [linksSnap, affSnap] = await Promise.all([
      getDocs(collection(db, 'links')),
      getDocs(query(collection(db, 'users'), where('role', '==', 'affiliate'))),
    ]);
    setLinks(linksSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrackingLink)));
    setAffiliates(affSnap.docs.map(d => ({ id: d.id, ...d.data() } as Affiliate)));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditLink(null);
    setForm(defaultForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (link: TrackingLink) => {
    setEditLink(link);
    setForm({
      name: link.name, alias: link.alias || '', originalUrl: link.originalUrl,
      affiliateEmail: link.affiliateEmail || '',
      minCR: link.minCR, maxCR: link.maxCR,
      targetConversions: link.targetConversions, targetClicks: link.targetClicks,
    });
    setError('');
    setShowModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = {
        name: form.name,
        alias: form.alias || null,
        originalUrl: form.originalUrl,
        affiliateEmail: form.affiliateEmail || null,
        minCR: Number(form.minCR),
        maxCR: Number(form.maxCR),
        targetConversions: Number(form.targetConversions),
        targetClicks: Number(form.targetClicks),
        clicks: editLink?.clicks || 0,
        conversions: editLink?.conversions || 0,
        createdAt: editLink?.createdAt || new Date().toISOString(),
      };
      if (editLink) {
        await updateDoc(doc(db, 'links', editLink.id), data);
      } else {
        await addDoc(collection(db, 'links'), data);
      }
      setShowModal(false);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save link');
    } finally {
      setSaving(false);
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Delete this tracking link?')) return;
    await deleteDoc(doc(db, 'links', id));
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const copyLink = (id: string, alias?: string) => {
    const shortId = alias || id;
    navigator.clipboard.writeText(`${BASE_URL}/r/${shortId}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-2xl flex items-center gap-2">
            <Link2 className="w-6 h-6 text-neon-pink" />
            Link Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{links.length} tracking links</p>
        </div>
        <button onClick={openCreate} className="btn-solid-indigo">
          <Plus className="w-4 h-4" />
          Create Link
        </button>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin" />
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No tracking links yet. Create your first link above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Partner</th>
                  <th>Short URL</th>
                  <th>Clicks</th>
                  <th>Conv.</th>
                  <th>CR%</th>
                  <th>CR Range</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => {
                  const cr = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0.0';
                  const shortId = link.alias || link.id;
                  return (
                    <tr key={link.id}>
                      <td className="font-semibold text-foreground max-w-32 truncate">{link.name}</td>
                      <td className="text-muted-foreground text-xs max-w-24 truncate">{link.affiliateEmail || '—'}</td>
                      <td>
                        <span className="font-mono text-xs text-neon-indigo">/r/{shortId.substring(0, 10)}{shortId.length > 10 ? '…' : ''}</span>
                      </td>
                      <td className="font-semibold">{(link.clicks || 0).toLocaleString()}</td>
                      <td className="font-semibold">{(link.conversions || 0).toLocaleString()}</td>
                      <td><span className="font-mono font-bold neon-text-indigo">{cr}%</span></td>
                      <td className="text-xs text-muted-foreground">{link.minCR}%–{link.maxCR}%</td>
                      <td><span className="status-live"><span className="w-1.5 h-1.5 rounded-full bg-current" />Live</span></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => copyLink(link.id, link.alias)} className="p-1.5 rounded-lg text-neon-indigo hover:bg-neon-indigo/10 transition-colors" title="Copy link">
                            {copied === link.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => openEdit(link)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteLink(link.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl w-full max-w-lg neon-border-indigo overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border/60">
              <h2 className="font-outfit font-bold text-lg">{editLink ? 'Edit Link' : 'Create Tracking Link'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={save} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider uppercase text-neon-indigo mb-3">Basic Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Link Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Campaign Alpha" className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Custom Alias</label>
                    <input type="text" value={form.alias} onChange={e => setForm(p => ({ ...p, alias: e.target.value }))} placeholder="my-campaign" className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block mt-3">Original URL *</label>
                  <input type="url" value={form.originalUrl} onChange={e => setForm(p => ({ ...p, originalUrl: e.target.value }))} required placeholder="https://offer.com/landing" className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block mt-3">Assign to Affiliate</label>
                  <select value={form.affiliateEmail} onChange={e => setForm(p => ({ ...p, affiliateEmail: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none transition-all">
                    <option value="">None</option>
                    {affiliates.map(a => <option key={a.id} value={a.email}>{a.name} ({a.email})</option>)}
                  </select>
                </div>
              </div>

              {/* Smart Logic */}
              <div className="pt-2">
                <p className="text-xs font-bold tracking-wider uppercase text-neon-pink mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Smart Logic Configuration
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'minCR', label: 'Min CR%', placeholder: '2' },
                    { key: 'maxCR', label: 'Max CR%', placeholder: '8' },
                    { key: 'targetConversions', label: 'Target Conversions', placeholder: '10' },
                    { key: 'targetClicks', label: 'Target Clicks', placeholder: '200' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                      <input
                        type="number"
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        min={0}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-pink/50 focus:outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                  💡 If CR &lt; Min CR → force conversion. If CR &gt; Max CR → skip. Otherwise use target ratio logic.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-neon-indigo flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-solid-indigo flex-1 justify-center">
                  {saving ? 'Saving...' : editLink ? 'Update Link' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
