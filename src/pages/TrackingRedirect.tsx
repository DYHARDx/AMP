import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection } from 'firebase/firestore';

export default function TrackingRedirect() {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const process = async () => {
      if (!linkId) { navigate('/'); return; }

      try {
        // Try direct ID first, then look up by alias
        let linkDoc = await getDoc(doc(db, 'links', linkId));
        let actualId = linkId;

        if (!linkDoc.exists()) {
          // lookup by alias
          const { getDocs, query, where } = await import('firebase/firestore');
          const q = query(collection(db, 'links'), where('alias', '==', linkId));
          const snap = await getDocs(q);
          if (snap.empty) { navigate('/'); return; }
          linkDoc = snap.docs[0];
          actualId = snap.docs[0].id;
        }

        const data = linkDoc.data()!;
        const { originalUrl, minCR, maxCR, targetConversions, targetClicks } = data;
        let currentClicks: number = data.clicks || 0;
        let currentConversions: number = data.conversions || 0;

        if (!originalUrl) { navigate('/'); return; }

        // Daily cap: check localStorage
        const todayKey = `last_click_date_${actualId}`;
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const lastClick = localStorage.getItem(todayKey);

        if (lastClick !== today) {
          // New click today — process it
          localStorage.setItem(todayKey, today);

          // Smart conversion logic
          const currentCR = currentClicks > 0 ? (currentConversions / currentClicks) * 100 : 0;
          let triggerConversion = false;

          if (currentCR < minCR) {
            // CR below minimum — force conversion
            triggerConversion = true;
          } else if (currentCR > maxCR) {
            // CR above maximum — skip conversion
            triggerConversion = false;
          } else {
            // Target ratio logic
            const targetRatio = targetClicks > 0 ? targetConversions / targetClicks : 0;
            triggerConversion = currentConversions < (currentClicks + 1) * targetRatio;
          }

          // Update link stats
          const linkRef = doc(db, 'links', actualId);
          if (triggerConversion) {
            await updateDoc(linkRef, {
              clicks: increment(1),
              conversions: increment(1),
            });
          } else {
            await updateDoc(linkRef, { clicks: increment(1) });
          }

          // Update daily analytics
          const dateStr = today;
          const dayRef = doc(db, 'analytics', 'daily_stats', 'days', dateStr);
          try {
            if (triggerConversion) {
              await updateDoc(dayRef, { clicks: increment(1), conversions: increment(1), date: dateStr });
            } else {
              await updateDoc(dayRef, { clicks: increment(1), date: dateStr });
            }
          } catch {
            // Day doc doesn't exist yet — create it
            const { setDoc } = await import('firebase/firestore');
            await setDoc(dayRef, {
              date: dateStr,
              clicks: 1,
              conversions: triggerConversion ? 1 : 0,
            });
          }
        }

        // Redirect to destination
        window.location.replace(originalUrl);
      } catch (err) {
        console.error('Tracking error:', err);
        navigate('/');
      }
    };

    process();
  }, [linkId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <img src="/logo.png" alt="AMP Logo" className="w-12 h-12 rounded-2xl object-contain shadow-lg" />
        <div className="w-8 h-8 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Routing through AMP Mediaz...</p>
      </div>
    </div>
  );
}
