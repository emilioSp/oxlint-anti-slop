type Payload = { id: string };
const original: Payload = { id: 'order-1' };
const payload: object = original;
export const result = payload as Payload;
