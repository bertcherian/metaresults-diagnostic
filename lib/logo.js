import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

let _cached = null;

export function getLogoBase64() {
  if (_cached) return _cached;
  const paths = [
    join(process.cwd(), 'public', 'logo.jpg'),
    join(process.cwd(), 'public', 'logo.png'),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      _cached = readFileSync(p).toString('base64');
      return _cached;
    }
  }
  return null;
}
