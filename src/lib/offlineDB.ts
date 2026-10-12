/**
 * offlineDB.ts
 * ─────────────────────────────────────────────────────────────
 * Tiny IndexedDB wrapper for offline student profile caching.
 * No external dependencies — uses the native browser API.
 *
 * Usage:
 *   await saveStudentProfile(profileData);
 *   const cached = await getStudentProfile();
 */

const DB_NAME = 'ims_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'student_profile';
const PROFILE_KEY = 'my_profile';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Persist student profile data to IndexedDB.
 * Called after every successful network fetch so the cache is always fresh.
 */
export async function saveStudentProfile(profile: unknown): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(
            { data: profile, savedAt: Date.now() },
            PROFILE_KEY
        );
        await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        db.close();
    } catch (err) {
        // Non-fatal – silently fail in environments where IndexedDB is unavailable
        console.warn('[offlineDB] Failed to save profile:', err);
    }
}

/**
 * Retrieve the cached student profile from IndexedDB.
 * Returns null if no cached data exists.
 */
export async function getStudentProfile<T = unknown>(): Promise<{ data: T; savedAt: number } | null> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const result = await new Promise<{ data: T; savedAt: number } | null>((resolve, reject) => {
            const req = tx.objectStore(STORE_NAME).get(PROFILE_KEY);
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => reject(req.error);
        });
        db.close();
        return result;
    } catch (err) {
        console.warn('[offlineDB] Failed to read profile:', err);
        return null;
    }
}

/**
 * Clear the cached student profile.
 */
export async function clearStudentProfile(): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(PROFILE_KEY);
        db.close();
    } catch {
        // silently ignore
    }
}
