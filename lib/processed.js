/**
 * Tracks which sheet entries have already been processed.
 * Uses a simple in-memory Set for dev; in production Vercel KV is recommended.
 * For this deployment we use a JSON file on /tmp (persists across warm invocations).
 * 
 * To upgrade to Vercel KV: npm i @vercel/kv and replace the functions below.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const STORE_PATH = '/tmp/processed_entries.json';

function load() {
  try {
    if (existsSync(STORE_PATH)) {
      return new Set(JSON.parse(readFileSync(STORE_PATH, 'utf8')));
    }
  } catch {}
  return new Set();
}

function save(set) {
  try {
    writeFileSync(STORE_PATH, JSON.stringify([...set]), 'utf8');
  } catch {}
}

export function isProcessed(key) {
  return load().has(key);
}

export function markProcessed(key) {
  const set = load();
  set.add(key);
  save(set);
}

export function getRowKey(row) {
  const email = row['Email Address'] || row['Email'] || '';
  const ts    = row['Timestamp'] || '';
  return `${email}_${ts}`;
}
