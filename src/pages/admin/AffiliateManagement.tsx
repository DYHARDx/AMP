import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setDoc } from 'firebase/firestore';
import { Users, Plus, Trash2, ToggleLeft, ToggleRight, X, AlertCircle } from 'lucide-react';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
  createdAt?: string;
}

const firebaseConfig = {
  apiKey: "AIzaSyAsXGL3iqPGdzRKWlyU3jzrV5oC1OG7fr4",
  authDomain: "amp-mediaz.firebaseapp.com",
  projectId: "amp-mediaz",
  storageBucket: "amp-mediaz.firebasestorage.app",
  messagingSenderId: "117826156017",
  appId: "1:117826156017:web:cbbed13f3e79965c500050",
};

export default function AffiliateManagement() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchAffiliates = async () => {
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'affiliate')));
    setAffiliates(snap.docs.map(d => ({ id: d.id, ...d.data() } as Affiliate)));
    setLoading(false);
  };

  useEffect(() => { fetchAffiliates(); }, []);

  const toggleStatus = async (aff: Affiliate) => {
    const newStatus = aff.status === 'active' ? 'inactive' : 'active';
    await updateDoc(doc(db, 'users', aff.id), { status: newStatus });
    setAffiliates(prev => prev.map(a => a.id === aff.id ? { ...a, status: newStatus } : a));
  };

  const deleteAffiliate = async (id: string) => {
    if (!confirm('Delete this affiliate?')) return;
    await deleteDoc(doc(db, 'users', id));
    setAffiliates(prev => prev.filter(a => a.id !== id));
  };

  const createAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      // Use secondary app to avoid logging out admin
      const secondaryAppName = 'secondary-' + Date.now();
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      const secondaryDb = getFirestore(secondaryApp);

      const userCred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      await setDoc(doc(secondaryDb, 'users', userCred.user.uid), {
        name: form.name,
        email: form.email,
        role: 'affiliate',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      await deleteApp(secondaryApp);

      setShowModal(false);
      setForm({ name: '', email: '', password: '' });
      fetchAffiliates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create affiliate');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-neon-indigo" />
            Affiliate Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{affiliates.length} affiliates registered</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-solid-indigo">
          <Plus className="w-4 h-4" />
          Add Affiliate
        </button>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin" />
          </div>
        ) : affiliates.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No affiliates yet. Add your first affiliate above.
          </div>
        ) : (
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((aff) => (
                <tr key={aff.id}>
                  <td className="font-semibold">{aff.name}</td>
                  <td className="text-muted-foreground font-mono text-xs">{aff.email}</td>
                  <td>
                    {aff.status === 'active'
                      ? <span className="status-live"><span className="w-1.5 h-1.5 rounded-full bg-current" />Active</span>
                      : <span className="status-inactive"><span className="w-1.5 h-1.5 rounded-full bg-current" />Inactive</span>
                    }
                  </td>
                  <td className="text-muted-foreground text-xs">
                    {aff.createdAt ? new Date(aff.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(aff)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          aff.status === 'active' ? 'text-neon-indigo hover:bg-neon-indigo/10' : 'text-muted-foreground hover:bg-muted'
                        }`}
                        title={aff.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {aff.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAffiliate(aff.id)}
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-md p-6 neon-border-indigo mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-outfit font-bold text-lg">Add Affiliate</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs">{error}</span>
              </div>
            )}

            <form onSubmit={createAffiliate} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Smith' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    required
                    className="w-full px-4 py-2.5 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none focus:ring-1 focus:ring-neon-indigo/30 transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-neon-indigo flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={creating} className="btn-solid-indigo flex-1 justify-center">
                  {creating ? 'Creating...' : 'Create Affiliate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
