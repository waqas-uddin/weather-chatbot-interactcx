import { WebhookResponse } from './types';

export function buildTextResponse(text: string): WebhookResponse {
  return {
    fulfillmentText: text,
    fulfillmentMessages: [{ text: { text: [text] } }],
  };
}
