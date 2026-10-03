import { emailQueue } from '#infrastructure/email-queue';

type InvoiceEmail = {
  invoiceId: string;
  recipient: string;
  locale: string;
};

export async function queueInvoiceEmail(
  invoice: InvoiceEmail,
): Promise<void> {
  await emailQueue.add('invoice-ready', invoice);
}
