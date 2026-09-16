import { computeForecastWindow, resolveStartDate, toISODate, FORECAST_DAYS } from '../../src/utils/date';
import { WeatherIntentParameters } from '../../src/dialogflow/types';

describe('resolveStartDate', () => {
  const now = new Date('2026-09-13T10:00:00Z');

  it('uses date-period.startDate when provided', () => {
    const params: WeatherIntentParameters = {
      'date-period': { startDate: '2026-09-20', endDate: '2026-09-21' },
    };
    expect(toISODate(resolveStartDate(params, now))).toBe('2026-09-20');
  });

  it('falls back to date-time when no date-period is given', () => {
    const params: WeatherIntentParameters = { 'date-time': '2026-09-18T00:00:00Z' };
    expect(toISODate(resolveStartDate(params, now))).toBe('2026-09-18');
  });

  it('falls back to "now" when neither date param is given', () => {
    expect(toISODate(resolveStartDate({}, now))).toBe('2026-09-13');
  });
});

describe('computeForecastWindow', () => {
  it('spans exactly FORECAST_DAYS (8) days inclusive of the start date', () => {
    const start = new Date('2026-09-13T00:00:00Z');
    const { startDate, endDate } = computeForecastWindow(start);

    expect(toISODate(startDate)).toBe('2026-09-13');
    expect(toISODate(endDate)).toBe('2026-09-20');

    const spanDays = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    expect(spanDays).toBe(FORECAST_DAYS);
  });
});
