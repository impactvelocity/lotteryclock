import { readFileSync, writeFileSync } from 'node:fs';
const W = '/Users/dylanjones/lotteryclock/web/src/components';
const read = (p) => readFileSync(p, 'utf8');
const art = (n) => read(`${W}/sections/art/why/${n}.svg`).replace(/<svg[^>]*>/, '<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid meet">');
const kiro = read(`${W}/kiro-ghost.tsx`);
const paths = [...kiro.matchAll(/d="([^"]+)"/g)].map((m) => m[1]);
const ghost = (id, fill) => `<svg viewBox="272 202 655 796" style="width:100%; height:auto; display:block"><mask id="${id}" maskUnits="userSpaceOnUse" x="272" y="202" width="655" height="796"><path fill="#fff" d="${paths[0]}"/><path fill="#000" d="${paths[1]}"/><path fill="#000" d="${paths[2]}"/></mask><rect x="272" y="202" width="655" height="796" fill="${fill}" mask="url(#${id})"/></svg>`;
const moon = read(`${W}/scenes/art/night/moon-full.svg`).replace(/<svg[^>]*>/, '<svg viewBox="0 0 80 80" style="width:100%; height:100%; filter: drop-shadow(0 0 30px rgba(255,243,218,.45))">');
const TL = read(new URL('./timeline.json', import.meta.url));
let html = read(new URL('./scenes/src.html', import.meta.url));
const SV = { snooze: art('snooze'), snooze2: art('snooze'), ringing: art('ringing'), doubt: art('doubt'), up: art('up'),
  ghost: ghost('gm1', '#F4F0FF'), ghostWhite: ghost('gm2', '#ffffff'), moon, moon2: moon };
html = html.replace(/<!--SVG:(\w+)-->/g, (_, k) => { if (!SV[k]) throw new Error('missing ' + k); return SV[k]; });
html = html.replace('/*TIMELINE*/null', TL.trim());
writeFileSync(new URL('./scenes/index.html', import.meta.url), html);
console.log('built', html.length);
