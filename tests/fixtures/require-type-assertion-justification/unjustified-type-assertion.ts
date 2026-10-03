type Customer = {
  id: string;
  email: string;
};

declare const apiResponse: {
  body: unknown;
};

export function readCustomer(): Customer {
  const customer = apiResponse.body as Customer;

  return customer;
}
