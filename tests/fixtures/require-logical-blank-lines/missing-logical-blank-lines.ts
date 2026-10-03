import { invoiceRepository } from '#billing/invoice-repository';
import { sendInvoice } from '#billing/send-invoice';

type Invoice = {
  id: string;
  recipient: string;
};
export async function sendInvoiceById(invoiceId: string): Promise<void> {
  const invoice = await invoiceRepository.find(invoiceId);
  await sendInvoice(invoice);
}
