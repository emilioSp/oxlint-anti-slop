import { emailQueue } from '#infrastructure/email-queue';

export async function queueInvoiceEmail(invoice: object): Promise<void> {
  await emailQueue.add('invoice-ready', invoice);
}
