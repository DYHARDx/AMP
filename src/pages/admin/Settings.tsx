import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore';
import { Settings as SettingsIcon, Save, Check } from 'lucide-react';

interface BrandingSettings {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
}

export default function Settings() {
  const [branding, setBranding] = useState<BrandingSettings>({ siteName: 'AMP Mediaz', logoUrl: '', primaryColor: '#6366f1' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'branding'));
        if (snap.exists()) setBranding(snap.data() as BrandingSettings);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'branding'), branding);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-outfit font-bold text-2xl flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-neon-indigo" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform branding and configuration</p>
      </div>

      <div className="glass-panel rounded-xl border border-border p-6">
        <h2 className="font-outfit font-bold text-base mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-indigo" />
          Branding Settings
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin" />
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">Site Name</label>
              <input
                type="text"
                value={branding.siteName}
                onChange={e => setBranding(p => ({ ...p, siteName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none focus:ring-1 focus:ring-neon-indigo/30 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">Logo URL</label>
              <input
                type="url"
                value={branding.logoUrl}
                onChange={e => setBranding(p => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://yoursite.com/logo.png"
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none focus:ring-1 focus:ring-neon-indigo/30 transition-all"
              />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn-solid-indigo">
                {saved ? (
                  <><Check className="w-4 h-4" /> Saved!</>
                ) : saving ? (
                  'Saving...'
                ) : (
                  <><Save className="w-4 h-4" /> Save Settings</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
