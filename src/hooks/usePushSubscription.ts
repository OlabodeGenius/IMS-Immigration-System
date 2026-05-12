import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ims-push-subscription';

/**
 * Registers/reads a Web Push subscription using the VAPID public key
 * stored in VITE_VAPID_PUBLIC_KEY. Persists the subscription endpoint
 * in localStorage and syncs it to the server via the subscribe-push
 * Edge Function.
 */
export function usePushSubscription() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check browser support on mount
    useEffect(() => {
        const supported =
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window;
        setIsSupported(supported);

        if (supported) {
            // Check if already subscribed
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setIsSubscribed(true);
        }
    }, []);

    const subscribe = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setError('Notification permission denied.');
                return;
            }

            // 2. Get active service worker registration
            const reg = await navigator.serviceWorker.ready;

            // 3. Subscribe via PushManager
            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                // Graceful fallback: just mark as subscribed (no real push)
                setIsSubscribed(true);
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ fallback: true }));
                return;
            }

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            // 4. Persist locally
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
            setIsSubscribed(true);

            // 5. Send to backend (best-effort; not blocking)
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const anonKey     = import.meta.env.VITE_SUPABASE_ANON_KEY;
            if (supabaseUrl && anonKey) {
                fetch(`${supabaseUrl}/functions/v1/subscribe-push`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': anonKey,
                        'Authorization': `Bearer ${anonKey}`,
                    },
                    body: JSON.stringify({ subscription: sub }),
                }).catch(() => { /* non-blocking */ });
            }
        } catch (e: any) {
            setError(String(e?.message ?? e));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const unsubscribe = useCallback(async () => {
        setIsLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();
            localStorage.removeItem(STORAGE_KEY);
            setIsSubscribed(false);
        } catch (e: any) {
            setError(String(e?.message ?? e));
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isSupported, isSubscribed, isLoading, error, subscribe, unsubscribe };
}

// ── VAPID key conversion util ─────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
