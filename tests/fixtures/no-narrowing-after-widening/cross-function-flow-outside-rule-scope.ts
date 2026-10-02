// This rule deliberately does not follow values across function boundaries.
const payload: unknown = { id: 'order-1' };
export function readPayload() { return payload as { id: string }; }
