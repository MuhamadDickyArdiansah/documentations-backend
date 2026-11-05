'use client';
import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
const commands = { npm: 'npm install express', pnpm: 'pnpm add express', yarn: 'yarn add express' };
export function InstallDemo() {
  const [manager, setManager] = useState<keyof typeof commands>('npm');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(commands[manager]); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setError(true); } }
  return <div className="install-demo"><div className="install-tabs" role="tablist" aria-label="Package manager">{Object.keys(commands).map(key => <button key={key} role="tab" aria-selected={manager === key} onClick={() => { setManager(key as keyof typeof commands); setError(false); }}>{key}</button>)}<Terminal size={14} /></div><div className="install-command" role="tabpanel"><code><span>$</span> {commands[manager]}</code><button onClick={copy} aria-label="Salin perintah instalasi">{copied ? <Check size={15} /> : <Copy size={15} />}</button></div><span className="sr-only" role="status">{copied ? 'Perintah disalin' : error ? 'Tidak dapat menyalin. Pilih dan salin perintah secara manual.' : ''}</span></div>;
}
