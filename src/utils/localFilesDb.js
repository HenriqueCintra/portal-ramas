// Utility to handle binary file storage in the browser's IndexedDB.
// This allows caching image/audio/video blobs without hitting localStorage size limits.

const DB_NAME = 'RamasEsperancaFiles';
const STORE_NAME = 'files';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Saves a file blob locally in IndexedDB
 * @param {string} id Unique file ID
 * @param {Blob|File} blob Binary data
 */
export async function saveLocalFile(id, blob) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('IndexedDB saveLocalFile failed:', e);
    throw e;
  }
}

/**
 * Retrieves a file blob from IndexedDB
 * @param {string} id Unique file ID
 * @returns {Promise<Blob|null>}
 */
export async function getLocalFile(id) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('IndexedDB getLocalFile failed:', e);
    return null;
  }
}

/**
 * Deletes a file from IndexedDB
 * @param {string} id Unique file ID
 */
export async function deleteLocalFile(id) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('IndexedDB deleteLocalFile failed:', e);
  }
}
