export interface IReceiptStorage {
  upload(userId: string, localUri: string): Promise<string>;
  getDownloadUrl(receipt: string, userId: string): Promise<string>;
  remove(receipt: string, userId: string): Promise<void>;
}
