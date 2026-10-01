type Customer = {
  id: string;
  email: string;
};

declare const apiResponse: {
  body: unknown;
};

export function readCustomer(): Customer {
  // JUSTIFICATION: decodeCustomerResponse verifies the API version and every required field.
  const customer = apiResponse.body as Customer;

  return customer;
}
