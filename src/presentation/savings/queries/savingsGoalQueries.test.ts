import { MutationObserver, QueryClient } from "@tanstack/react-query";
import type { SavingsGoal } from "@domain/savings/entities/SavingsGoal";
import { InMemorySavingsGoalRepository } from "@/tests/fakes/InMemorySavingsGoalRepository";
import { createQueryClient } from "@lib/queryCache/queryClient";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createSavingsGoalMutationOptions,
  deleteSavingsGoalMutationOptions,
  savingsGoalsQueryOptions,
  updateSavingsGoalMutationOptions,
} from "./savingsGoalQueries";

const USER_ID = "user-1";

const initialGoal: SavingsGoal = {
  uid: "goal-initial",
  userId: USER_ID,
  title: "Reserva de emergência",
  currentValueInCents: 100_00,
  targetValueInCents: 1000_00,
  createdAt: "2026-06-01T12:00:00.000Z",
};

describe("savingsGoalQueries", () => {
  let queryClient: QueryClient;
  let repository: InMemorySavingsGoalRepository;

  beforeEach(() => {
    queryClient = createQueryClient();
    repository = new InMemorySavingsGoalRepository();
    repository.seed(initialGoal);
  });

  it("carrega e reutiliza o cache de metas dentro do staleTime", async () => {
    const options = savingsGoalsQueryOptions(repository, USER_ID);

    const first = await queryClient.fetchQuery(options);
    const second = await queryClient.fetchQuery(options);

    expect(first).toEqual([initialGoal]);
    expect(second).toEqual([initialGoal]);
    expect(repository.calls.listForUser).toHaveLength(1);
  });

  it("cria, edita e exclui metas com atualização otimista", async () => {
    const options = savingsGoalsQueryOptions(repository, USER_ID);
    await queryClient.fetchQuery(options);

    let optimisticTitlesOnCreate: string[] = [];
    const originalCreate = repository.create.bind(repository);
    repository.create = async (data) => {
      optimisticTitlesOnCreate = (
        queryClient.getQueryData<SavingsGoal[]>(options.queryKey) ?? []
      ).map((goal) => goal.title);
      return originalCreate(data);
    };

    const createObserver = new MutationObserver(
      queryClient,
      createSavingsGoalMutationOptions(queryClient, repository, USER_ID),
    );
    const created = await createObserver.mutate({
      title: "Viagem",
      currentValueInCents: 200_00,
      targetValueInCents: 500_00,
    });

    expect(optimisticTitlesOnCreate).toEqual([
      "Viagem",
      "Reserva de emergência",
    ]);
    expect(
      queryClient
        .getQueryData<SavingsGoal[]>(options.queryKey)
        ?.map((goal) => goal.uid),
    ).toContain(created.uid);

    // Edição otimista
    let optimisticCurrentDuringUpdate: number | undefined;
    const originalUpdate = repository.update.bind(repository);
    repository.update = async (id, data) => {
      optimisticCurrentDuringUpdate = queryClient
        .getQueryData<SavingsGoal[]>(options.queryKey)
        ?.find((goal) => goal.uid === id)?.currentValueInCents;
      return originalUpdate(id, data);
    };

    const updateObserver = new MutationObserver(
      queryClient,
      updateSavingsGoalMutationOptions(queryClient, repository, USER_ID),
    );
    await updateObserver.mutate({
      goalId: initialGoal.uid,
      data: { currentValueInCents: 350_00 },
    });

    expect(optimisticCurrentDuringUpdate).toBe(350_00);

    // Exclusão otimista
    let idsDuringDelete: string[] = [];
    const originalDelete = repository.delete.bind(repository);
    repository.delete = async (id) => {
      idsDuringDelete = (
        queryClient.getQueryData<SavingsGoal[]>(options.queryKey) ?? []
      ).map((goal) => goal.uid);
      return originalDelete(id);
    };

    const deleteObserver = new MutationObserver(
      queryClient,
      deleteSavingsGoalMutationOptions(queryClient, repository, USER_ID),
    );
    await deleteObserver.mutate(initialGoal.uid);

    expect(idsDuringDelete).not.toContain(initialGoal.uid);
  });

  it("restaura o cache de metas quando uma mutação falha", async () => {
    const options = savingsGoalsQueryOptions(repository, USER_ID);
    await queryClient.fetchQuery(options);

    repository.delete = async () => {
      throw new Error("erro ao excluir meta");
    };

    const deleteObserver = new MutationObserver(
      queryClient,
      deleteSavingsGoalMutationOptions(queryClient, repository, USER_ID),
    );

    await expect(deleteObserver.mutate(initialGoal.uid)).rejects.toThrow(
      "erro ao excluir meta",
    );

    expect(queryClient.getQueryData<SavingsGoal[]>(options.queryKey)).toEqual([
      initialGoal,
    ]);
  });
});
