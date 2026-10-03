type Delivery = {
  id: string;
  topic: string;
  attempt: number;
};

declare const delivery: Delivery;

const webhookEvent = {
  id: delivery.id,
  topic: delivery.topic,
  attempt: delivery.attempt,
};

export const eventMetadata: Record<string, unknown> = webhookEvent;
