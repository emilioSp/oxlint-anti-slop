type Payload = { id: string };
const payload: unknown = { id: 'order-1' };
export const result = payload as Payload;
