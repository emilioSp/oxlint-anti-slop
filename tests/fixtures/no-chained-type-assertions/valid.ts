type Order = {
  id: string;
  total: number;
};

const isOrder = (value: unknown): value is Order =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'total' in value;

export async function loadOrder(response: Response): Promise<Order> {
  const payload: unknown = await response.json();

  if (!isOrder(payload)) {
    throw new Error('Order response is invalid.');
  }

  return payload;
}
