import { openDB } from 'idb';

const DB_NAME = 'lyrics-cache';
const STORE_NAME = 'lyrics';
const DB_VERSION = 1;

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    },
  });
};

export const cacheLyrics = async (songId, lyrics) => {
  try {
    const db = await initDB();
    await db.put(STORE_NAME, {
      id: songId,
      lyrics,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error caching lyrics:', error);
  }
};

export const getCachedLyrics = async (songId) => {
  try {
    const db = await initDB();
    return await db.get(STORE_NAME, songId);
  } catch (error) {
    console.error('Error getting cached lyrics:', error);
    return null;
  }
};

export const clearOldCache = async (maxAge = 7 * 24 * 60 * 60 * 1000) => { // 7 days
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const oldEntries = await store.index('timestamp').getAllKeys(
      IDBKeyRange.upperBound(Date.now() - maxAge)
    );
    
    await Promise.all(oldEntries.map(key => store.delete(key)));
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}; 