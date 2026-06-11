import type { HabitLog } from '@navi/types';

/**
 * Formats a numeric value representing cents/units into currency display format.
 */
export function formatCurrency(amount: number, locale = 'pt-BR', currency = 'BRL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formats an ISO date string or Date object into localized short format.
 */
export function formatDate(date: string | Date, locale = 'pt-BR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Helper to calculate habit streak from logs.
 * Expects logs to be sorted by completion date descending.
 */
export function calculateStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Parse logs into normalized dates
  const logDates = logs.map(l => {
    const d = new Date(l.completedAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  // Unique sorted dates descending
  const uniqueDates = Array.from(new Set(logDates)).sort((a, b) => b - a);

  const mostRecent = new Date(uniqueDates[0]);
  
  // If the last log is older than yesterday, streak is broken
  if (mostRecent < yesterday && mostRecent.getTime() !== today.getTime()) {
    return 0;
  }

  let expectedTime = mostRecent.getTime();
  for (const logTime of uniqueDates) {
    if (logTime === expectedTime) {
      streak++;
      // Set expected to the previous calendar day
      const nextExpected = new Date(expectedTime);
      nextExpected.setDate(nextExpected.getDate() - 1);
      expectedTime = nextExpected.getTime();
    } else {
      break;
    }
  }

  return streak;
}
