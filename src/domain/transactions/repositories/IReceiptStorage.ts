export interface IReceiptStorage {
  upload(userId: string, localUri: string): Promise<string>;
  remove(receiptUrl: string): Promise<void>;
}
