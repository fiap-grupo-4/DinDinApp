import { IReceiptStorage } from "@domain/transactions/repositories/IReceiptStorage";
import { requireUserId } from "../validation/validation";

export type ReceiptSelection = {
  currentReceipt?: string;
  selectedUri?: string;
};

// Envia o comprovante só quando ele mudou e chama `persist` com a URL final.
// Se `persist` falhar, apaga o arquivo recém-enviado; se der certo e o
// comprovante antigo foi trocado ou removido, apaga o antigo. Assim nenhum
// arquivo fica órfão no storage.
export async function saveWithReceipt(
  storage: IReceiptStorage,
  userId: string,
  { currentReceipt, selectedUri }: ReceiptSelection,
  persist: (receipt: string | undefined) => Promise<void>,
): Promise<void> {
  requireUserId(userId);

  if (selectedUri && selectedUri === currentReceipt) {
    await persist(currentReceipt);
    return;
  }

  const uploaded = selectedUri
    ? await storage.upload(userId, selectedUri)
    : undefined;
  try {
    await persist(uploaded);
  } catch (error) {
    if (uploaded) await storage.remove(uploaded).catch(() => undefined);
    throw error;
  }

  if (currentReceipt) {
    await storage.remove(currentReceipt).catch(() => undefined);
  }
}
