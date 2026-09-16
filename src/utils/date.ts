import { WeatherIntentParameters } from '../dialogflow/types';

const DAY_MS = 24 * 60 * 60 * 1000;
export const FORECAST_DAYS = 8;

export interface ForecastWindow {
  startDate: Date;
  endDate: Date;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseISODate(value: string): Date | undefined {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function resolveStartDate(
  parameters: WeatherIntentParameters,
  now: Date = new Date(),
): Date {
  const datePeriod = parameters['date-period'];
  if (datePeriod?.startDate) {
    const parsed = parseISODate(datePeriod.startDate);
    if (parsed) return parsed;
  }

  const dateTime = parameters['date-time'];
  if (dateTime) {
    const parsed = parseISODate(dateTime);
    if (parsed) return parsed;
  }

  return now;
}

export function computeForecastWindow(startDate: Date): ForecastWindow {
  const endDate = new Date(startDate.getTime() + (FORECAST_DAYS - 1) * DAY_MS);
  return { startDate, endDate };
}

export function formatHumanDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
