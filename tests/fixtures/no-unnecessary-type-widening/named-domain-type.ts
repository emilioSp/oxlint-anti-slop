type Delivery = {
  id: string;
  topic: string;
  attempt: number;
};

type WebhookEventMetadata = {
  id: string;
  topic: string;
  attempt: number;
};

declare const delivery: Delivery;

export const eventMetadata: WebhookEventMetadata = {
  id: delivery.id,
  topic: delivery.topic,
  attempt: delivery.attempt,
};
