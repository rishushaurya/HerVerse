import { differenceInDays, parseISO } from 'date-fns';

// Cycle day and phase from the last period start (YYYY-MM-DD). Used by Home and the Period tracker.
// No modulo: a late period shows as "Late" instead of wrapping back to day 1.
export function getCycleInfo(lastPeriodStart, cycleLength = 28) {
  if (!lastPeriodStart) return { day: null, phase: null };
  const day = differenceInDays(new Date(), parseISO(lastPeriodStart)) + 1;
  let phase;
  if (day > cycleLength) phase = 'Late';
  else if (day <= 5) phase = 'Menstrual';
  else if (day <= 13) phase = 'Follicular';
  else if (day <= 16) phase = 'Ovulation';
  else phase = 'Luteal';
  return { day, phase };
}
