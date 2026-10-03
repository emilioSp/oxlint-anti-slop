export async function readPayload(response: Response) {
  const payload: unknown = await response.json();
  return payload;
}
