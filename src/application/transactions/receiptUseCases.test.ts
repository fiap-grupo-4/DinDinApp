import { ValidationError } from "@domain/shared/errors";
import { InMemoryReceiptStorage } from "@/src/test/fakes/InMemoryReceiptStorage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveWithReceipt } from "./receiptUseCases";

let storage: InMemoryReceiptStorage;

beforeEach(() => {
  storage = new InMemoryReceiptStorage();
});

describe("saveWithReceipt", () => {
  it("sem comprovante persiste undefined e não envia nada", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    await saveWithReceipt(storage, "u1", { currentReceipt: "x" }, persist);
    expect(persist).toHaveBeenCalledWith(undefined);
    expect(storage.calls.upload).toHaveLength(0);
    expect(storage.calls.remove).toEqual(["x"]);
  });

  it("troca de comprovante apaga o antigo depois de persistir", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    await saveWithReceipt(
      storage,
      "u1",
      { currentReceipt: "https://antigo", selectedUri: "file://novo.jpg" },
      persist,
    );
    expect(storage.calls.remove).toEqual(["https://antigo"]);
  });

  it("comprovante inalterado não reenvia", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    await saveWithReceipt(
      storage,
      "u1",
      { currentReceipt: "https://a", selectedUri: "https://a" },
      persist,
    );
    expect(persist).toHaveBeenCalledWith("https://a");
    expect(storage.calls.upload).toHaveLength(0);
    expect(storage.calls.remove).toHaveLength(0);
  });

  it("comprovante novo envia e persiste a URL", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    await saveWithReceipt(storage, "u1", { selectedUri: "file://r.jpg" }, persist);
    expect(storage.calls.upload).toEqual([
      { userId: "u1", localUri: "file://r.jpg" },
    ]);
    expect(persist).toHaveBeenCalledWith([...storage.files][0]);
  });

  it("apaga o arquivo enviado se persistir falhar", async () => {
    const failure = new Error("falhou");
    await expect(
      saveWithReceipt(storage, "u1", { selectedUri: "file://r.jpg" }, () =>
        Promise.reject(failure),
      ),
    ).rejects.toBe(failure);
    expect(storage.calls.remove).toEqual(["receipts/u1/1-test.jpg"]);
    expect(storage.files.size).toBe(0);
  });

  it("exige usuário", async () => {
    await expect(
      saveWithReceipt(storage, "", { selectedUri: "file://r.jpg" }, vi.fn()),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(storage.calls.upload).toHaveLength(0);
  });
});
