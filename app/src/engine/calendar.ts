/**
 * Calendrier julien (en usage au Moyen Âge) : année bissextile tous les 4 ans.
 * Une date de jeu est un entier : le nombre de jours depuis le 1er janvier 1066.
 */
export type Day = number;

export const START_YEAR = 1066;
const BASE_YEAR = 800;                // année bissextile : permet les naissances bien avant 1066
let offset = 0;
for (let y = BASE_YEAR; y < START_YEAR; y++) offset += y % 4 === 0 ? 366 : 365;
const OFFSET = offset;                // jours entre le 1/1/800 et le 1/1/1066
const CYCLE = 1461;                   // 4 ans juliens
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
  'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export interface CalendarDate { year: number; month: number; day: number } // month 1–12, day 1–31

export const isLeap = (year: number): boolean => year % 4 === 0;
export const yearLength = (year: number): number => (isLeap(year) ? 366 : 365);
export const monthLength = (year: number, month: number): number =>
  month === 2 && isLeap(year) ? 29 : (MONTH_DAYS[month - 1] as number);

export function toCalendar(d: Day): CalendarDate {
  let abs = d + OFFSET;
  if (abs < 0) throw new Error(`Date antérieure à ${BASE_YEAR} non gérée : ${d}`);
  const cycles = Math.floor(abs / CYCLE);
  abs -= cycles * CYCLE;
  let year = BASE_YEAR + cycles * 4;
  while (abs >= yearLength(year)) { abs -= yearLength(year); year++; }
  let month = 1;
  while (abs >= monthLength(year, month)) { abs -= monthLength(year, month); month++; }
  return { year, month, day: abs + 1 };
}

export function fromCalendar(year: number, month = 1, day = 1): Day {
  if (year < BASE_YEAR) throw new Error(`Année antérieure à ${BASE_YEAR} non gérée : ${year}`);
  const cycles = Math.floor((year - BASE_YEAR) / 4);
  let abs = cycles * CYCLE;
  for (let y = BASE_YEAR + cycles * 4; y < year; y++) abs += yearLength(y);
  for (let m = 1; m < month; m++) abs += monthLength(year, m);
  return abs + day - 1 - OFFSET;
}

export const isFirstOfMonth = (d: Day): boolean => toCalendar(d).day === 1;
export const isFirstOfYear = (d: Day): boolean => { const c = toCalendar(d); return c.day === 1 && c.month === 1; };

/** « 14 octobre 1066 » (« 1er » pour le premier du mois). */
export function formatDate(d: Day): string {
  const c = toCalendar(d);
  return `${c.day === 1 ? '1er' : c.day} ${MONTHS_FR[c.month - 1]} ${c.year}`;
}

/** Âge en années révolues entre une naissance et une date. */
export function ageAt(birth: Day, now: Day): number {
  const b = toCalendar(birth), n = toCalendar(now);
  let age = n.year - b.year;
  if (n.month < b.month || (n.month === b.month && n.day < b.day)) age--;
  return age;
}

/** Ajoute des mois en gardant le jour (borné à la fin du mois). */
export function addMonths(d: Day, months: number): Day {
  const c = toCalendar(d);
  const total = c.year * 12 + (c.month - 1) + months;
  const year = Math.floor(total / 12), month = (total % 12) + 1;
  return fromCalendar(year, month, Math.min(c.day, monthLength(year, month)));
}

export const addYears = (d: Day, years: number): Day => addMonths(d, years * 12);
