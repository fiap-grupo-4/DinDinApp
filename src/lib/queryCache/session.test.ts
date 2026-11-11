import { createQueryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";
import { clearUserData, shouldClearUserData } from "./session";
import { describe, expect, it } from "vitest";

describe("session cache management", () => {
  it("shouldClearUserData identifica quando a sessão mudou ou deslogou", () => {
    expect(shouldClearUserData(undefined, "user-1")).toBe(false);
    expect(shouldClearUserData(undefined, null)).toBe(true);
    expect(shouldClearUserData("user-1", "user-1")).toBe(false);
    expect(shouldClearUserData("user-1", null)).toBe(true);
    expect(shouldClearUserData("user-1", "user-2")).toBe(true);
  });

  it("clearUserData remove transações, categorias e metas do QueryClient", () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.transactions.history("user-1"), []);
    queryClient.setQueryData(queryKeys.categories.all("user-1"), []);
    queryClient.setQueryData(queryKeys.savingsGoals.all("user-1"), []);

    clearUserData(queryClient);

    expect(
      queryClient.getQueryData(queryKeys.transactions.history("user-1")),
    ).toBeUndefined();
    expect(
      queryClient.getQueryData(queryKeys.categories.all("user-1")),
    ).toBeUndefined();
    expect(
      queryClient.getQueryData(queryKeys.savingsGoals.all("user-1")),
    ).toBeUndefined();
  });
});
