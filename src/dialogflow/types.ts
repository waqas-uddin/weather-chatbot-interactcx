export interface DialogflowDatePeriod {
  startDate: string;
  endDate: string;
}

export interface WeatherIntentParameters {
  city?: string;
  'date-time'?: string;
  'date-period'?: DialogflowDatePeriod;
  [key: string]: unknown;
}

export interface DialogflowIntent {
  name: string;
  displayName: string;
}

export interface DialogflowQueryResult {
  queryText: string;
  parameters: WeatherIntentParameters;
  allRequiredParamsPresent: boolean;
  intent: DialogflowIntent;
  languageCode: string;
}

export interface WebhookRequest {
  responseId: string;
  session: string;
  queryResult: DialogflowQueryResult;
}

export interface DialogflowTextMessage {
  text: {
    text: string[];
  };
}

export interface WebhookResponse {
  fulfillmentText: string;
  fulfillmentMessages?: DialogflowTextMessage[];
}
