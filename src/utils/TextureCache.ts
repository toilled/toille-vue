import { CanvasTexture, NearestFilter, type Wrapping } from 'three';

const DB_NAME = 'cyberpunk-city-textures';
const DB_VERSION = 1;
const STORE_NAME = 'textures';

interface CacheEntry {
  key: string;
  blob: Blob;
  width: number;
  height: number;
  wrapS: number;
  wrapT: number;
  useNearestFilter: boolean;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  }
  return dbPromise;
}

async function getCachedTexture(key: string): Promise<CanvasTexture | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => {
      const entry: CacheEntry | undefined = request.result;
      if (!entry) {
        resolve(null);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(entry.blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = entry.width;
        canvas.height = entry.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        URL.revokeObjectURL(url);
        const texture = new CanvasTexture(canvas);
        texture.wrapS = entry.wrapS as Wrapping;
        texture.wrapT = entry.wrapT as Wrapping;
        if (entry.useNearestFilter) {
          texture.magFilter = NearestFilter;
        }
        resolve(texture);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    };
    request.onerror = () => resolve(null);
  });
}

async function cacheTexture(
  key: string,
  texture: CanvasTexture,
  useNearestFilter = false
): Promise<void> {
  const db = await openDB();
  if (!db) return;

  const canvas = texture.image as HTMLCanvasElement;
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve();
        return;
      }
      const entry: CacheEntry = {
        key,
        blob,
        width: canvas.width,
        height: canvas.height,
        wrapS: texture.wrapS,
        wrapT: texture.wrapT,
        useNearestFilter,
      };
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(entry, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  });
}

export async function getCachedOrGenerate(
  key: string,
  generate: () => CanvasTexture,
  useNearestFilter = false,
  anisotropy?: number
): Promise<CanvasTexture> {
  const cached = await getCachedTexture(key);
  if (cached) {
    if (anisotropy) cached.anisotropy = anisotropy;
    return cached;
  }

  const texture = generate();
  if (anisotropy) texture.anisotropy = anisotropy;
  cacheTexture(key, texture, useNearestFilter);
  return texture;
}

export async function getCachedHeightmap(key: string): Promise<Float32Array | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result;
      if (result instanceof ArrayBuffer) {
        resolve(new Float32Array(result));
      } else {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
  });
}

export async function cacheHeightmap(key: string, data: Float32Array): Promise<void> {
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data.buffer.slice(0), key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}
