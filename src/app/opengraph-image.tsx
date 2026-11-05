import { ImageResponse } from 'next/og';
export const alt = 'Backend Handbook — Dari konsep ke production';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() { return new ImageResponse(<div style={{ width: '100%', height: '100%', background: '#f6f9f8', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 90, color: '#172b28', fontFamily: 'sans-serif' }}><div style={{ fontSize: 27, color: '#13866f', marginBottom: 38 }}>backendhandbook.</div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 78, fontWeight: 700, lineHeight: 1.1 }}><span>Dari konsep</span><span>ke production.</span></div><div style={{ fontSize: 27, marginTop: 35, color: '#63716e' }}>Dokumentasi Backend Engineering · JavaScript & TypeScript</div></div>, size); }
