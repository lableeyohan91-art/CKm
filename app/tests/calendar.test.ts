import { describe, expect, it } from 'vitest';
import { addMonths, addYears, ageAt, formatDate, fromCalendar, isFirstOfYear, toCalendar } from '../src/engine/calendar';

describe('calendrier julien', () => {
  it('le jour 0 est le 1er janvier 1066', () => {
    expect(toCalendar(0)).toEqual({ year: 1066, month: 1, day: 1 });
    expect(formatDate(0)).toBe('1er janvier 1066');
  });
  it('Hastings : 14 octobre 1066', () => {
    const d = fromCalendar(1066, 10, 14);
    expect(formatDate(d)).toBe('14 octobre 1066');
    expect(d).toBe(286); // 31+28+31+30+31+30+31+31+30 + 13
  });
  it('aller-retour sur 500 ans, années bissextiles comprises', () => {
    let prev = toCalendar(fromCalendar(1064, 1, 1) - 0);
    for (let d = fromCalendar(1064, 1, 1); d < fromCalendar(1566, 1, 1); d++) {
      const c = toCalendar(d);
      expect(fromCalendar(c.year, c.month, c.day)).toBe(d);
      if (d > fromCalendar(1064, 1, 1)) expect(c.year * 400 + c.month * 32 + c.day).toBeGreaterThan(prev.year * 400 + prev.month * 32 + prev.day);
      prev = c;
    }
  });
  it('1068 est bissextile (calendrier julien)', () => {
    expect(toCalendar(fromCalendar(1068, 2, 28) + 1)).toEqual({ year: 1068, month: 2, day: 29 });
    expect(toCalendar(fromCalendar(1067, 2, 28) + 1)).toEqual({ year: 1067, month: 3, day: 1 });
  });
  it('âge et ajouts de mois', () => {
    const birth = fromCalendar(1028, 6, 15);
    expect(birth).toBeLessThan(0);
    expect(formatDate(birth)).toBe('15 juin 1028');
    expect(ageAt(birth, fromCalendar(1066, 6, 14))).toBe(37);
    expect(ageAt(birth, fromCalendar(1066, 6, 15))).toBe(38);
    expect(toCalendar(addMonths(fromCalendar(1066, 1, 31), 1))).toEqual({ year: 1066, month: 2, day: 28 });
    expect(toCalendar(addYears(fromCalendar(1066, 3, 1), 9))).toEqual({ year: 1075, month: 3, day: 1 });
    expect(isFirstOfYear(fromCalendar(1100, 1, 1))).toBe(true);
  });
});
