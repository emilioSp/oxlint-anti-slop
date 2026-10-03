# `require-logical-blank-lines`

Keep blank lines between imports and declarations, between top-level declarations, around multiline declarations, and between logical control-flow groups. Related imports and overload declarations can stay together.

## ❌ Bad

```ts
import { invoiceRepository } from '#billing/invoice-repository';
import { sendInvoice } from '#billing/send-invoice';

type Invoice = {
  id: string;
  recipient: string;
};
export async function sendInvoiceById(invoiceId: string): Promise<void> {
  const invoice = await invoiceRepository.find(invoiceId);
  if (invoice === null) {
    throw new Error('Invoice not found.');
  }
  await sendInvoice(invoice);
}
```

## ✅ Good

```ts
import { invoiceRepository } from '#billing/invoice-repository';
import { sendInvoice } from '#billing/send-invoice';

type Invoice = {
  id: string;
  recipient: string;
};

export async function sendInvoiceById(invoiceId: string): Promise<void> {
  const invoice = await invoiceRepository.find(invoiceId);

  if (invoice === null) {
    throw new Error('Invoice not found.');
  }

  await sendInvoice(invoice);
}
```

Add the blank line that separates the logical groups. Do not use a suppression to keep unrelated statements together.

[Back to available rules](../../README.md#available-rules)
