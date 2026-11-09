import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@infra/firebase";
import { IReceiptStorage } from "@domain/transactions/repositories/IReceiptStorage";

export class FirebaseReceiptStorage implements IReceiptStorage {
  async upload(userId: string, localUri: string): Promise<string> {
    const response = await fetch(localUri);
    const blob = await response.blob();
    if (blob.size === 0 || blob.size > 5 * 1024 * 1024) {
      throw new Error("O comprovante deve ter até 5 MB.");
    }

    const mimeExtensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
    };
    const uriExtension = localUri
      .split(/[?#]/)[0]
      .split(".")
      .pop()
      ?.toLowerCase();
    const contentType =
      blob.type || (uriExtension === "jpg" ? "image/jpeg" : `image/${uriExtension}`);
    const extension = mimeExtensions[contentType];
    if (!extension) {
      throw new Error("Formato de comprovante não suportado.");
    }

    const nonce = Math.random().toString(36).slice(2, 12) || "upload";
    const path = `receipts/${userId}/${Date.now()}-${nonce}.${extension}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, blob, {
      contentType,
    });
    return storageRef.fullPath;
  }

  async getDownloadUrl(receipt: string, userId: string): Promise<string> {
    const storageRef = this.getOwnedReceiptRef(receipt, userId);
    return getDownloadURL(storageRef);
  }

  async remove(receipt: string, userId: string): Promise<void> {
    const storageRef = this.getOwnedReceiptRef(receipt, userId);
    await deleteObject(storageRef);
  }

  private getOwnedReceiptRef(receipt: string, userId: string) {
    const storageRef = ref(storage, receipt);
    if (
      storageRef.bucket !== storage.app.options.storageBucket ||
      !storageRef.fullPath.startsWith(`receipts/${userId}/`)
    ) {
      throw new Error("Referência de comprovante inválida.");
    }
    return storageRef;
  }
}
