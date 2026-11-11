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
    const path = `receipts/${userId}/${++this.counter}-test.jpg`;
    this.files.add(path);
    return path;
  }

  async getDownloadUrl(receipt: string): Promise<string> {
    return `https://storage.test/${receipt}`;
  }

  async remove(receipt: string): Promise<void> {
    this.calls.remove.push(receipt);
    this.files.delete(receipt);
  }
}
