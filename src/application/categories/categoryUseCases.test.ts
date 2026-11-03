import { ValidationError } from "@domain/shared/errors";
import { InMemoryCategoryRepository } from "@/src/test/fakes/InMemoryCategoryRepository";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createCategory,
  getCategory,
  listCategories,
} from "./categoryUseCases";

let repo: InMemoryCategoryRepository;

beforeEach(() => {
  repo = new InMemoryCategoryRepository();
  repo.seed({ uid: "c1", userId: "u1", name: "Comida", createdAt: "" });
});

describe("createCategory", () => {
  it("persiste o nome trimado", async () => {
    const created = await createCategory(repo, {
      userId: "u1",
      name: "  Lazer ",
    });
    expect(created.name).toBe("Lazer");
    expect(repo.calls.create[0]).toEqual({ userId: "u1", name: "Lazer" });
  });

  it("rejeita nome vazio", async () => {
    await expect(
      createCategory(repo, { userId: "u1", name: "   " }),
    ).rejects.toThrow("Informe o nome da categoria.");
    expect(repo.calls.create).toHaveLength(0);
  });

  it("rejeita userId vazio", async () => {
    await expect(
      createCategory(repo, { userId: " ", name: "Lazer" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("listCategories", () => {
  it("lista do usuário", async () => {
    expect(await listCategories(repo, "u1")).toHaveLength(1);
  });

  it("rejeita userId vazio", async () => {
    await expect(listCategories(repo, "")).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});

describe("getCategory", () => {
  it("retorna por id ou null", async () => {
    expect((await getCategory(repo, "c1"))?.name).toBe("Comida");
    expect(await getCategory(repo, "nope")).toBeNull();
  });
});
