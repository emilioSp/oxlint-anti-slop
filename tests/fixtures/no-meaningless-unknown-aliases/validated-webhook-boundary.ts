type PaymentWebhook = {
  id: string;
  event: 'payment.succeeded';
  amount: number;
};

declare const isPaymentWebhook: (
  body: unknown,
) => body is PaymentWebhook;
declare const processPayment: (body: PaymentWebhook) => Promise<void>;

export async function handleWebhook(body: unknown): Promise<void> {
  if (!isPaymentWebhook(body)) {
    throw new Error('Webhook payload is invalid.');
  }

  await processPayment(body);
}
