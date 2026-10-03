type Order = {
  id: string;
  total: number;
};

export async function loadOrder(response: Response): Promise<Order> {
  const order = (await response.json()) as unknown as Order;

  return order;
}
