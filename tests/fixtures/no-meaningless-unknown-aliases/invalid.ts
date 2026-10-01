type IncomingWebhookBody = unknown;

declare const processWebhook: (body: unknown) => Promise<void>;

export async function handleWebhook(
  body: IncomingWebhookBody,
): Promise<void> {
  await processWebhook(body);
}
