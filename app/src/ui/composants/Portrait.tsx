/**
 * Portrait généré : visage, cheveux, barbe, coiffe selon le sexe, l'âge et le rang.
 * Entièrement déterministe à partir de la graine du personnage (aucune image externe).
 */
const PEAUX = ['#f1d3b8', '#e8c39e', '#dcb08a', '#c99a72', '#f5ddc8'];
const CHEVEUX = ['#2b1d14', '#4a3020', '#6b4423', '#8a5a2b', '#b07a3a', '#d6b06a', '#a0391e'];
const FONDS = ['#7b2d26', '#2f4f6f', '#3e5b3a', '#6d4b7a', '#8a6a1f', '#4a4a4a'];

function rand(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

export function Portrait({ graine, sexe, age, rang, taille = 56, mort = false }: { graine: number; sexe: 'h' | 'f'; age: number; rang: number; taille?: number; mort?: boolean }) {
  const r = rand(graine);
  const peau = PEAUX[Math.floor(r() * PEAUX.length)]!;
  let cheveux = CHEVEUX[Math.floor(r() * CHEVEUX.length)]!;
  if (age >= 65) cheveux = '#e6e2da'; else if (age >= 50) cheveux = '#9a948a';
  const fond = FONDS[Math.floor(r() * FONDS.length)]!;
  const style = Math.floor(r() * 3);
  const barbe = sexe === 'h' && age >= 18 && r() < 0.65;
  const enfant = age < 14;
  const tete = enfant ? 15 : 17;
  return (
    <svg width={taille} height={taille} viewBox="0 0 64 64" role="img" aria-hidden="true" style={{ borderRadius: 10, flex: 'none', filter: mort ? 'grayscale(1)' : undefined }}>
      <rect width="64" height="64" fill={fond} />
      <path d="M8 64 C10 48 22 44 32 44 C42 44 54 48 56 64Z" fill={sexe === 'h' ? '#5a3e2b' : '#6b2f3a'} />
      {sexe === 'f' && !enfant && <path d="M14 30 C12 46 18 52 32 52 C46 52 52 46 50 30Z" fill={cheveux} />}
      <ellipse cx="32" cy={enfant ? 32 : 29} rx={tete * 0.82} ry={tete} fill={peau} />
      {style === 0 && <path d={`M${32 - tete} 26 C${32 - tete} 10 ${32 + tete} 10 ${32 + tete} 26 C${32 + tete - 4} 18 ${32 - tete + 4} 18 ${32 - tete} 26Z`} fill={cheveux} />}
      {style === 1 && <path d={`M${32 - tete} 28 C${30 - tete} 8 ${34 + tete} 8 ${32 + tete} 28 L${30 + tete} 22 C26 14 22 18 ${33 - tete} 24Z`} fill={cheveux} />}
      {style === 2 && <path d={`M${32 - tete + 1} 24 C${32 - tete} 12 ${32 + tete} 12 ${32 + tete - 1} 24 C28 19 36 19 ${32 - tete + 1} 24Z`} fill={cheveux} />}
      <circle cx="27" cy="29" r="1.6" fill="#2b1d14" /><circle cx="37" cy="29" r="1.6" fill="#2b1d14" />
      <path d="M29 37 Q32 39 35 37" stroke="#7a4a3a" strokeWidth="1.2" fill="none" />
      {barbe && <path d={`M${32 - tete * 0.7} 33 C${32 - tete * 0.6} 46 ${32 + tete * 0.6} 46 ${32 + tete * 0.7} 33 C34 40 30 40 ${32 - tete * 0.7} 33Z`} fill={cheveux} />}
      {rang >= 3 && <path d="M18 14 L22 5 L27 12 L32 3 L37 12 L42 5 L46 14Z" fill="#d9a640" stroke="#7a5a10" strokeWidth="0.8" />}
      {rang === 2 && <path d="M19 15 L45 15 L44 11 L38 13 L32 9 L26 13 L20 11Z" fill="#c9c3b5" stroke="#6b665d" strokeWidth="0.8" />}
    </svg>
  );
}
