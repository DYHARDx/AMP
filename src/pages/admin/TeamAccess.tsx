import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc } from 'firebase/firestore';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { UserCog, Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface Admin { id: string; name: string; email: string; role: string; createdAt?: string; }

import { firebaseConfig } from '@/lib/firebase';

export default function TeamAccess() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchAdmins = async () => {
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
    setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() } as Admin)));
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const deleteAdmin = async (id: string) => {
    if (!confirm('Remove this admin?')) return;
    await deleteDoc(doc(db, 'users', id));
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const secondaryApp = initializeApp(firebaseConfig, 'admin-secondary-' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const secondaryDb = getFirestore(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      await setDoc(doc(secondaryDb, 'users', cred.user.uid), {
        name: form.name, email: form.email, role: 'admin',
        status: 'active', createdAt: new Date().toISOString(),
      });
      await deleteApp(secondaryApp);
      setShowModal(false);
      setForm({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-2xl flex items-center gap-2">
            <UserCog className="w-6 h-6 text-neon-cyan" />
            Team Access
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{admins.length} admin accounts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-solid-indigo">
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin" />
          </div>
        ) : (
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No admins found</td></tr>
              )}
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td className="font-semibold">{admin.name}</td>
                  <td className="font-mono text-xs text-muted-foreground">{admin.email}</td>
                  <td><span className="px-2 py-1 rounded-full text-xs font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">Admin</span></td>
                  <td className="text-xs text-muted-foreground">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button onClick={() => deleteAdmin(admin.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-md p-6 neon-border-indigo mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-outfit font-bold text-lg">Add Admin</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            {error && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            <form onSubmit={createAdmin} className="space-y-4">
              {[{ label: 'Full Name', key: 'name', type: 'text', ph: 'Admin Name' }, { label: 'Email', key: 'email', type: 'email', ph: 'admin@pyronex.com' }, { label: 'Password', key: 'password', type: 'password', ph: '••••••••' }].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} required className="w-full px-4 py-2.5 rounded-lg text-sm bg-muted/50 border border-border focus:border-neon-indigo/50 focus:outline-none transition-all" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-neon-indigo flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={creating} className="btn-solid-indigo flex-1 justify-center">{creating ? 'Creating...' : 'Create Admin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
