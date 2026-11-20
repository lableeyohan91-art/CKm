// Génère le gabarit d'alignement des calques de portrait (à joindre à chaque demande à ChatGPT).
// Usage : node tools/art/gabarit.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const sortie = resolve(racine, 'assets/_gabarits/gabarit-portrait.png');
mkdirSync(dirname(sortie), { recursive: true });

const W = 1024, H = 1536;
const ligne = (y, nom, couleur) => `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${couleur}" stroke-width="3" stroke-dasharray="18 10"/>
  <text x="20" y="${y - 10}" font-family="sans-serif" font-size="30" fill="${couleur}">${nom} (y=${y})</text>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f4efe6"/>
  <!-- silhouette de référence -->
  <path d="M512 1000 C 380 1000 300 1030 250 1050 C 150 1090 90 1180 70 1536 L 954 1536 C 934 1180 874 1090 774 1050 C 724 1030 644 1000 512 1000 Z" fill="#d9cfbf"/>
  <rect x="440" y="860" width="144" height="170" fill="#e6d7c3"/>
  <ellipse cx="512" cy="630" rx="185" ry="250" fill="#ecdcc6" stroke="#8a7a66" stroke-width="4"/>
  <ellipse cx="440" cy="640" rx="32" ry="16" fill="#8a7a66"/><ellipse cx="584" cy="640" rx="32" ry="16" fill="#8a7a66"/>
  <path d="M512 660 L 498 740 L 526 740" fill="none" stroke="#8a7a66" stroke-width="4"/>
  <path d="M470 800 Q 512 818 554 800" fill="none" stroke="#8a7a66" stroke-width="4"/>
  <line x1="512" y1="0" x2="512" y2="${H}" stroke="#2f5d8a" stroke-width="3" stroke-dasharray="8 8"/>
  ${ligne(380, 'Sommet du crâne', '#9b2a1e')}
  ${ligne(640, 'Ligne des yeux', '#9b2a1e')}
  ${ligne(880, 'Menton', '#9b2a1e')}
  ${ligne(1050, 'Épaules', '#9b2a1e')}
  <rect x="192" y="260" width="640" height="640" fill="none" stroke="#3f7a46" stroke-width="4"/>
  <text x="200" y="300" font-family="sans-serif" font-size="26" fill="#3f7a46">Cadrage petit portrait (carré)</text>
  <rect x="152" y="240" width="720" height="900" fill="none" stroke="#b0821e" stroke-width="4" stroke-dasharray="4 6"/>
  <text x="160" y="1125" font-family="sans-serif" font-size="26" fill="#b0821e">Cadrage fiche personnage (4:5)</text>
  <text x="${W / 2}" y="1480" font-family="sans-serif" font-size="34" fill="#2b1d14" text-anchor="middle">GABARIT 1024 x 1536 — vue de face — axe vertical x=512</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile(sortie);
console.log(`Gabarit écrit : ${sortie}`);
