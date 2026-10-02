declare function readPayload(): unknown;
const payload: unknown = readPayload();
export const result = payload as { id: string };
