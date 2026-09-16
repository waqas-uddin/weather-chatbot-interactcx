import request from 'supertest';
import { createApp } from '../../src/app';
import * as geocodingService from '../../src/services/geocoding.service';
import * as openweatherService from '../../src/services/openweather.service';

jest.mock('../../src/services/geocoding.service');
jest.mock('../../src/services/openweather.service');

const mockedGeocode = geocodingService as jest.Mocked<typeof geocodingService>;
const mockedWeather = openweatherService as jest.Mocked<typeof openweatherService>;

const app = createApp();

function buildRequest(displayName: string, parameters: Record<string, unknown>) {
  return {
    responseId: 'test-response-id',
    session: 'projects/test/agent/sessions/test-session',
    queryResult: {
      queryText: 'test query',
      parameters,
      allRequiredParamsPresent: true,
      intent: { name: 'projects/test/agent/intents/test-id', displayName },
      languageCode: 'en',
    },
  };
}

describe('POST /webhook', () => {
  beforeEach(() => {
    mockedGeocode.geocodeCity.mockResolvedValue({ lat: 24.86, lon: 67.0, resolvedName: 'Karachi, Sindh, PK' });
  });

  it('answers Current-Weather with a fulfillmentText containing the city and conditions', async () => {
    mockedWeather.getCurrentWeather.mockResolvedValue({
      description: 'clear sky',
      temperatureC: 30,
      feelsLikeC: 33,
      humidity: 45,
    });

    const res = await request(app)
      .post('/webhook')
      .send(buildRequest('Current-Weather', { city: 'Karachi' }));

    expect(res.status).toBe(200);
    expect(res.body.fulfillmentText).toContain('Karachi');
    expect(res.body.fulfillmentText).toContain('clear sky');
  });

  it('answers Forecast-Weather with an 8-day window in the fulfillmentText', async () => {
    mockedWeather.getDailyForecast.mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000),
        description: 'sunny',
        minTempC: 20,
        maxTempC: 28,
        humidity: 40,
      })),
    );

    const res = await request(app)
      .post('/webhook')
      .send(buildRequest('Forecast-Weather', { city: 'Karachi' }));

    expect(res.status).toBe(200);
    expect(res.body.fulfillmentText).toContain('Karachi');
    expect(res.body.fulfillmentText.match(/sunny/g)?.length).toBe(8);
  });

  it('returns a friendly apology (still HTTP 200) when the city is missing', async () => {
    const res = await request(app)
      .post('/webhook')
      .send(buildRequest('Current-Weather', {}));

    expect(res.status).toBe(200);
    expect(res.body.fulfillmentText).toMatch(/didn't catch which city/i);
  });

  it('returns a friendly apology (still HTTP 200) for an unknown intent', async () => {
    const res = await request(app)
      .post('/webhook')
      .send(buildRequest('Some-Unmapped-Intent', {}));

    expect(res.status).toBe(200);
    expect(res.body.fulfillmentText).toBeTruthy();
  });
});
