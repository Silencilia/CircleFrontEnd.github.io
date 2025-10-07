// Utilities for local audio draft storage using IndexedDB via idb-keyval-like minimal wrapper
// No external deps to keep bundle lean.

export interface StoredAudioDraftMeta {
  id: string;
  durationSeconds: number | null;
  createdAt: number; // epoch ms
  mimeType: string;
  sizeBytes: number;
}

export interface StoredAudioDraft extends StoredAudioDraftMeta {
  blob: Blob;
}

const DB_NAME = 'circle-audio-db';
const STORE_NAME = 'audio-drafts';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    fn(store).then((result) => {
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    }).catch(reject);
  });
}

export async function saveAudioDraft(input: { id?: string; blob: Blob; durationSeconds: number | null; createdAt?: number; }): Promise<StoredAudioDraftMeta> {
  const id = input.id ?? crypto.randomUUID();
  const createdAt = input.createdAt ?? Date.now();
  const record: StoredAudioDraft = {
    id,
    blob: input.blob,
    durationSeconds: input.durationSeconds ?? null,
    createdAt,
    mimeType: input.blob.type || 'audio/webm',
    sizeBytes: input.blob.size,
  };
  await withStore('readwrite', async (store) => {
    await new Promise<void>((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return record as unknown as void;
  });
  return { id: record.id, durationSeconds: record.durationSeconds, createdAt: record.createdAt, mimeType: record.mimeType, sizeBytes: record.sizeBytes };
}

export async function getAudioDraft(id: string): Promise<StoredAudioDraft | null> {
  return withStore('readonly', async (store) => {
    return await new Promise<StoredAudioDraft | null>((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as StoredAudioDraft) ?? null);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function listAudioDrafts(): Promise<StoredAudioDraftMeta[]> {
  return withStore('readonly', async (store) => {
    return await new Promise<StoredAudioDraftMeta[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = (req.result as StoredAudioDraft[]).map((r) => ({ id: r.id, durationSeconds: r.durationSeconds, createdAt: r.createdAt, mimeType: r.mimeType, sizeBytes: r.sizeBytes }));
        resolve(rows);
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function deleteAudioDraft(id: string): Promise<void> {
  await withStore('readwrite', async (store) => {
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return undefined as unknown as void;
  });
}

export async function cleanUpStaleDrafts(olderThanMs: number): Promise<number> {
  const threshold = Date.now() - olderThanMs;
  return withStore('readwrite', async (store) => {
    return await new Promise<number>((resolve, reject) => {
      const req = store.openCursor();
      let deleted = 0;
      req.onsuccess = () => {
        const cursor = req.result as IDBCursorWithValue | null;
        if (!cursor) return resolve(deleted);
        const value = cursor.value as StoredAudioDraft;
        if (value.createdAt < threshold) {
          const delReq = cursor.delete();
          delReq.onsuccess = () => { deleted++; cursor.continue(); };
          delReq.onerror = () => reject(delReq.error);
        } else {
          cursor.continue();
        }
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      return await navigator.storage.persist();
    }
  } catch {
    // ignore
  }
  return false;
}


