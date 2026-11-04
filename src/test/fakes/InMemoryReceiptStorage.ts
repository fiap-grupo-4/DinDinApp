import { IReceiptStorage } from "@domain/transactions/repositories/IReceiptStorage";

export class InMemoryReceiptStorage implements IReceiptStorage {
  files = new Set<string>();
  calls = {
    upload: [] as { userId: string; localUri: string }[],
    remove: [] as string[],
  };
  private counter = 0;

  async upload(userId: string, localUri: string): Promise<string> {
    this.calls.upload.push({ userId, localUri });
    const url = `https://storage.test/receipts/${userId}/${++this.counter}`;
    this.files.add(url);
    return url;
  }

  async remove(receiptUrl: string): Promise<void> {
    this.calls.remove.push(receiptUrl);
    this.files.delete(receiptUrl);
  }
}
