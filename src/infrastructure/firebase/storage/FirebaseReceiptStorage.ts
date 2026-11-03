import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@lib/firebase";

export async function uploadTransactionReceipt(
  userId: string,
  localUri: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const extension = localUri.split(".").pop()?.split("?")[0] || "jpg";
  const path = `receipts/${userId}/${Date.now()}.${extension}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob, {
    contentType: blob.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
  });
  return getDownloadURL(storageRef);
}
