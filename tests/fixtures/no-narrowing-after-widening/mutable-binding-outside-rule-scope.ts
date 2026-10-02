// This rule deliberately follows only stable const bindings.
declare function readPayload(): unknown;
let payload: unknown = { id: 'order-1' };
payload = readPayload();
export const result = payload as { id: string };
